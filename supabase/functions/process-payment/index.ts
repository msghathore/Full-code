import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID') || 'LKH6TY590G319';

if (!SQUARE_ACCESS_TOKEN) {
  throw new Error('SQUARE_ACCESS_TOKEN environment variable is required');
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('💳 Process payment function started');

    // Parse request body
    const requestData = await req.json();
    const { sourceId, amountMoney, locationId } = requestData;

    console.log('📨 Request data:', {
      sourceId: sourceId ? 'present' : 'missing',
      amountMoney,
      locationId
    });

    if (!sourceId || !amountMoney) {
      throw new Error('Missing required parameters: sourceId and amountMoney are required');
    }

    // Use provided location ID or default to hardcoded value
    const paymentLocationId = locationId || SQUARE_LOCATION_ID;

    // Generate unique idempotency key
    const idempotencyKey = crypto.randomUUID();

    console.log('🔑 Using idempotency key:', idempotencyKey);

    // Prepare Square API request
    const currency = amountMoney.currency || 'CAD';
    console.log('💰 Currency being used:', currency);

    const paymentRequest = {
      source_id: sourceId,
      amount_money: {
        amount: amountMoney.amount,
        currency: currency
      },
      location_id: paymentLocationId,
      idempotency_key: idempotencyKey
    };

    console.log('🔍 Full payment request:', paymentRequest);

    console.log('🏦 Sending request to Square API...');

    // Make direct API call to Square
    const squareResponse = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    });

    const responseData = await squareResponse.json();

    console.log('📡 Square API response:', {
      status: squareResponse.status,
      statusText: squareResponse.statusText,
      data: responseData
    });

    if (!squareResponse.ok) {
      console.error('❌ Square API error:', responseData);
      throw new Error(`Square API error: ${responseData.errors?.[0]?.detail || 'Payment failed'}`);
    }

    console.log('✅ Payment successful:', responseData.payment?.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment: responseData.payment,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Payment processing error:', {
      message: error.message,
      stack: error.stack
    });

    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
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