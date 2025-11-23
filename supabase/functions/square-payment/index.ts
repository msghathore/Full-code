import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.0";
import { Client, Environment } from "npm:square@37.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Square client
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    if (!squareAccessToken) {
      throw new Error('Square access token not configured');
    }

    const squareClient = new Client({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? Environment.Production : Environment.Sandbox,
    });

    // Parse request body
    const requestData = await req.json();
    const { sourceId, amount, locationId, description, referenceId } = requestData;

    if (!sourceId || !amount || !locationId) {
      throw new Error('Missing required payment parameters');
    }

    // Create payment with Square
    const paymentRequest = {
      sourceId,
      amountMoney: {
        amount: BigInt(amount), // Amount in cents
        currency: 'USD',
      },
      locationId,
      referenceId: referenceId || `payment_${Date.now()}`,
      note: description || 'Zavira Beauty Service Payment',
    };

    const { result: paymentResult, statusCode } = await squareClient.paymentsApi.createPayment(paymentRequest);

    if (statusCode !== 200 || !paymentResult.payment) {
      throw new Error('Payment failed to process');
    }

    const payment = paymentResult.payment;

    // Store payment record in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        appointment_id: payment.orderId || null,
        amount: parseFloat(payment.amountMoney.amount.toString()) / 100, // Convert cents to dollars
        payment_method: 'card', // Since this is processed through Square
        status: payment.status === 'COMPLETED' ? 'completed' : 'pending',
        square_payment_id: payment.id,
        stripe_payment_id: null, // Clear any Stripe references
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB insert fails, as payment was successful
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        amount: parseFloat(payment.amountMoney.amount.toString()) / 100,
        createdAt: payment.createdAt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Payment processing error:', error);

    const errorResponse = {
      success: false,
      error: error?.message || 'Payment processing failed',
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});