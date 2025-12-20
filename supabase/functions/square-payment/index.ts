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
    console.log('🏁 Square payment function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized');

    // Initialize Square client
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    console.log('🔍 Environment variables check:', {
      hasSquareAccessToken: !!squareAccessToken,
      squareEnvironment: squareEnvironment,
      squareEnvironmentSource: Deno.env.get('SQUARE_ENVIRONMENT') ? 'set' : 'defaulting to sandbox'
    });

    if (!squareAccessToken) {
      console.error('❌ Missing Square access token');
      throw new Error('Square access token not configured');
    }

    const squareClient = new Client({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? Environment.Production : Environment.Sandbox,
    });
    console.log('✅ Square client initialized');

    // Parse request body
    const requestData = await req.json();
    const { nonce, sourceId, amount, description, referenceId, customerId, staffId } = requestData;

    // Use location ID from request or fallback to default sandbox location
    const locationId = requestData.locationId || 'LKH6TY590G319';

    console.log('📨 Request data:', {
      nonce: nonce ? 'present' : 'missing',
      sourceId: sourceId ? 'present' : 'missing',
      amount,
      locationId: locationId + ' (hardcoded)',
      description,
      referenceId,
      customerId,
      staffId
    });

    // Support both 'nonce' (frontend) and 'sourceId' (backend) parameter names
    const paymentSourceId = nonce || sourceId;

    if (!paymentSourceId || !amount) {
      console.error('❌ Missing required parameters:', {
        hasSource: !!paymentSourceId,
        hasAmount: !!amount,
        hasLocation: !!locationId
      });
      throw new Error('Missing required payment parameters: sourceId/nonce and amount are required');
    }

    // Validate amount is a positive integer
    const paymentAmount = parseInt(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new Error('Invalid amount: must be a positive number representing cents');
    }

    console.log('💰 Processing payment for amount:', paymentAmount, 'cents');

    // Generate unique idempotency key to prevent duplicate charges
    const idempotencyKey = crypto.randomUUID();
    console.log('🔑 Generated idempotency key:', idempotencyKey);

    // Create payment with Square
    const paymentRequest = {
      sourceId: paymentSourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(paymentAmount), // Amount in cents
        currency: 'CAD',
      },
      locationId,
      referenceId: referenceId || `payment_${Date.now()}`,
      note: description || 'Zavira Beauty Service Payment',
    };

    console.log('🏦 Sending request to Square API...');
    const { result: paymentResult, statusCode } = await squareClient.paymentsApi.createPayment(paymentRequest);

    if (statusCode !== 200 || !paymentResult.payment) {
      console.error('❌ Square API error:', { statusCode, result: paymentResult });

      // Handle specific Square API errors
      const errorMessage = paymentResult.errors?.[0]?.detail || 'Payment failed to process';

      // Map Square error codes to appropriate HTTP status codes
      let httpStatusCode = 500;
      if (paymentResult.errors?.[0]?.code) {
        const errorCode = paymentResult.errors[0].code;
        if (errorCode.includes('CARD_DECLINED') || errorCode.includes('INSUFFICIENT_FUNDS') ||
          errorCode.includes('INVALID_CARD') || errorCode.includes('EXPIRED_CARD')) {
          httpStatusCode = 400; // Bad Request - client error (invalid card)
        } else if (errorCode.includes('RATE_LIMIT') || errorCode.includes('API_ERROR')) {
          httpStatusCode = 429; // Too Many Requests - rate limiting
        }
      }

      throw new Error(`Payment failed: ${errorMessage}`);
    }

    const payment = paymentResult.payment;
    console.log('✅ Square payment successful:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amountMoney.amount.toString()
    });

    // Create transaction record first
    const transactionId = crypto.randomUUID();
    const paymentAmountInDollars = parseFloat(payment.amountMoney.amount.toString()) / 100;

    console.log('💾 Creating transaction record...');
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        customer_id: customerId || null,
        staff_id: staffId || null,
        total_amount: paymentAmountInDollars,
        status: 'PAID',
        checkout_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Transaction creation failed:', transactionError);
      throw new Error(`Transaction creation failed: ${transactionError.message}`);
    }

    console.log('✅ Transaction created:', transactionId);

    // Store payment record in database (matching actual schema)
    console.log('💾 Creating payment record...');
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        method: 'CREDIT', // Square payments are always credit card
        amount: paymentAmountInDollars,
      });

    if (paymentError) {
      console.error('❌ Payment record creation failed:', paymentError);
      // Don't fail the whole transaction if payment record insert fails
      console.log('⚠️ Payment was successful but record creation failed');
    } else {
      console.log('✅ Payment record created');
    }

    // Return success response
    const successResponse = {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: paymentAmountInDollars,
      createdAt: payment.createdAt,
      idempotencyKey,
      transactionId: transactionId,
      squareResponse: {
        id: payment.id,
        status: payment.status,
        amount: payment.amountMoney.amount.toString(),
        currency: payment.amountMoney.currency,
        cardDetails: payment.cardDetails ? {
          card: {
            brand: payment.cardDetails.card?.brand,
            last4: payment.cardDetails.card?.last4,
            expMonth: payment.cardDetails.card?.expMonth,
            expYear: payment.cardDetails.card?.expYear
          }
        } : null
      }
    };

    console.log('🎉 Returning success response:', successResponse);

    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Payment processing error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Determine appropriate HTTP status code based on error type
    let statusCode = 500;
    let errorCode = 'PAYMENT_PROCESSING_ERROR';

    if (error.message.includes('Missing required payment parameters') ||
      error.message.includes('Invalid amount')) {
      statusCode = 400;
      errorCode = 'INVALID_REQUEST';
    } else if (error.message.includes('Payment failed:') &&
      (error.message.includes('CARD_DECLINED') ||
        error.message.includes('INSUFFICIENT_FUNDS') ||
        error.message.includes('INVALID_CARD') ||
        error.message.includes('EXPIRED_CARD'))) {
      statusCode = 400;
      errorCode = 'PAYMENT_DECLINED';
    } else if (error.message.includes('Square access token not configured')) {
      statusCode = 503; // Service Unavailable
      errorCode = 'PAYMENT_SERVICE_UNAVAILABLE';
    } else if (error.message.includes('RATE_LIMIT')) {
      statusCode = 429; // Too Many Requests
      errorCode = 'RATE_LIMITED';
    } else if (error.message.includes('Transaction creation failed')) {
      statusCode = 500;
      errorCode = 'TRANSACTION_CREATION_FAILED';
    }

    const errorResponse = {
      success: false,
      error: error?.message || 'Payment processing failed',
      errorCode,
      timestamp: new Date().toISOString(),
    };

    console.error('📤 Returning error response:', errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});