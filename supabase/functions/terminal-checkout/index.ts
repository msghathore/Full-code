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
    console.log('🖥️ Square Terminal checkout function started');

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
    const { action } = requestData;

    // Route to appropriate handler
    switch (action) {
      case 'create_checkout':
        return await handleCreateCheckout(squareClient, supabase, requestData);
      case 'get_checkout_status':
        return await handleGetCheckoutStatus(squareClient, requestData);
      case 'cancel_checkout':
        return await handleCancelCheckout(squareClient, requestData);
      case 'list_devices':
        return await handleListDevices(squareClient);
      case 'pair_device':
        return await handlePairDevice(squareClient, requestData);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('💥 Terminal checkout error:', error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Terminal checkout failed',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Create a checkout on the Square Terminal
async function handleCreateCheckout(squareClient: any, supabase: any, data: any) {
  const { deviceId, amount, currency = 'CAD', referenceId, note, appointmentId, customerId, staffId, cartItems } = data;

  console.log('📱 Creating Terminal checkout:', { deviceId, amount, referenceId });

  // Get location ID (use environment variable or hardcoded sandbox)
  const locationId = Deno.env.get('SQUARE_LOCATION_ID') || 'L487Y87FWY04R';

  // Generate idempotency key
  const idempotencyKey = crypto.randomUUID();

  // Create the checkout request
  const checkoutRequest = {
    idempotencyKey,
    checkout: {
      amountMoney: {
        amount: BigInt(amount), // Amount in cents
        currency,
      },
      referenceId: referenceId || `terminal_${Date.now()}`,
      note: note || 'Zavira Beauty Service Payment',
      deviceOptions: {
        deviceId,
        skipReceiptScreen: false,
        tipSettings: {
          allowTipping: true,
          separateTipScreen: true,
          customTipField: true,
          tipPercentages: [15, 18, 20],
        },
      },
      paymentOptions: {
        autocomplete: true,
      },
    },
  };

  console.log('🏦 Sending checkout request to Square Terminal API...');

  const { result, statusCode } = await squareClient.terminalApi.createTerminalCheckout(checkoutRequest);

  if (statusCode !== 200 || !result.checkout) {
    console.error('❌ Square Terminal API error:', { statusCode, result });
    throw new Error(result.errors?.[0]?.detail || 'Failed to create terminal checkout');
  }

  const checkout = result.checkout;
  console.log('✅ Terminal checkout created:', {
    id: checkout.id,
    status: checkout.status,
    amount: checkout.amountMoney.amount.toString()
  });

  // Store pending checkout in database for tracking
  const { error: insertError } = await supabase
    .from('terminal_checkouts')
    .insert({
      id: checkout.id,
      device_id: deviceId,
      amount: parseFloat(checkout.amountMoney.amount.toString()) / 100,
      currency,
      status: checkout.status,
      reference_id: referenceId,
      appointment_id: appointmentId || null,
      customer_id: customerId || null,
      staff_id: staffId || null,
      cart_items: cartItems || null,
      created_at: checkout.createdAt,
    });

  if (insertError) {
    console.warn('⚠️ Failed to store checkout record:', insertError);
    // Don't fail - checkout is still valid
  }

  return new Response(
    JSON.stringify({
      success: true,
      checkoutId: checkout.id,
      status: checkout.status,
      amount: parseFloat(checkout.amountMoney.amount.toString()) / 100,
      deviceId,
      createdAt: checkout.createdAt,
      deadlineAt: checkout.deadlineDuration,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Get status of a terminal checkout
async function handleGetCheckoutStatus(squareClient: any, data: any) {
  const { checkoutId } = data;

  console.log('🔍 Getting checkout status:', checkoutId);

  const { result, statusCode } = await squareClient.terminalApi.getTerminalCheckout(checkoutId);

  if (statusCode !== 200 || !result.checkout) {
    throw new Error(result.errors?.[0]?.detail || 'Failed to get checkout status');
  }

  const checkout = result.checkout;

  return new Response(
    JSON.stringify({
      success: true,
      checkoutId: checkout.id,
      status: checkout.status,
      paymentIds: checkout.paymentIds || [],
      amount: parseFloat(checkout.amountMoney.amount.toString()) / 100,
      tipMoney: checkout.tipMoney ? parseFloat(checkout.tipMoney.amount.toString()) / 100 : 0,
      cancelReason: checkout.cancelReason || null,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Cancel a pending terminal checkout
async function handleCancelCheckout(squareClient: any, data: any) {
  const { checkoutId } = data;

  console.log('🚫 Canceling checkout:', checkoutId);

  const { result, statusCode } = await squareClient.terminalApi.cancelTerminalCheckout(checkoutId);

  if (statusCode !== 200) {
    throw new Error(result.errors?.[0]?.detail || 'Failed to cancel checkout');
  }

  return new Response(
    JSON.stringify({
      success: true,
      checkoutId,
      status: 'CANCELED',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// List paired devices
async function handleListDevices(squareClient: any) {
  console.log('📋 Listing paired devices...');

  const locationId = Deno.env.get('SQUARE_LOCATION_ID') || 'L487Y87FWY04R';

  // Search for devices using the correct API
  const { result, statusCode } = await squareClient.devicesApi.listDevices({
    locationId,
  });

  if (statusCode !== 200) {
    throw new Error(result.errors?.[0]?.detail || 'Failed to list devices');
  }

  const devices = (result.devices || []).map((device: any) => ({
    id: device.id,
    name: device.name || 'Square Terminal',
    status: device.status,
    locationId: device.locationId,
    productType: device.productType,
    components: device.components?.map((c: any) => ({
      type: c.type,
      applicationDetails: c.applicationDetails,
    })),
  }));

  console.log('✅ Found devices:', devices.length);

  return new Response(
    JSON.stringify({
      success: true,
      devices,
      count: devices.length,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Create a device code for pairing
async function handlePairDevice(squareClient: any, data: any) {
  const { name = 'Zavira Terminal' } = data;

  console.log('🔗 Creating device pairing code...');

  const locationId = Deno.env.get('SQUARE_LOCATION_ID') || 'L487Y87FWY04R';
  const idempotencyKey = crypto.randomUUID();

  const { result, statusCode } = await squareClient.devicesApi.createDeviceCode({
    idempotencyKey,
    deviceCode: {
      productType: 'TERMINAL_API',
      locationId,
      name,
    },
  });

  if (statusCode !== 200 || !result.deviceCode) {
    throw new Error(result.errors?.[0]?.detail || 'Failed to create pairing code');
  }

  const deviceCode = result.deviceCode;

  return new Response(
    JSON.stringify({
      success: true,
      code: deviceCode.code,
      deviceId: deviceCode.deviceId,
      status: deviceCode.status,
      expiresAt: deviceCode.statusChangedAt,
      pairBy: deviceCode.pairBy,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
