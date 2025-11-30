import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    console.log('🔍 Diagnostic mode: Testing environment variables and basic functionality');
    
    // Test 1: Environment Variables
    console.log('📝 Checking environment variables...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT');
    
    const envStatus = {
      SUPABASE_URL: supabaseUrl ? 'present' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'present' : 'MISSING', 
      SQUARE_ACCESS_TOKEN: squareAccessToken ? 'present' : 'MISSING',
      SQUARE_ENVIRONMENT: squareEnvironment || 'default (sandbox)'
    };
    
    console.log('📊 Environment Status:', envStatus);
    
    // Test 2: Request parsing
    console.log('📨 Testing request parsing...');
    let requestData;
    try {
      requestData = await req.json();
      console.log('✅ Request parsed successfully');
    } catch (parseError) {
      console.error('❌ Request parsing failed:', parseError);
      throw new Error(`Request parsing failed: ${parseError.message}`);
    }
    
    // Test 3: Basic validation
    const { nonce, sourceId, amount, locationId } = requestData;
    const paymentSourceId = nonce || sourceId;
    
    if (!paymentSourceId) {
      throw new Error('Missing payment source (nonce/sourceId)');
    }
    
    if (!amount) {
      throw new Error('Missing amount');
    }
    
    if (!locationId) {
      throw new Error('Missing locationId');
    }
    
    // Return diagnostic results
    const diagnosticResult = {
      success: true,
      message: 'All basic checks passed',
      environment: envStatus,
      requestData: {
        hasSource: !!paymentSourceId,
        hasAmount: !!amount,
        hasLocation: !!locationId,
        amount: amount
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Diagnostic complete:', diagnosticResult);
    
    return new Response(
      JSON.stringify(diagnosticResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Diagnostic error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    console.error('📤 Returning diagnostic error response:', errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});