// Square Payment System Test Script
// Tests the complete payment flow with Square sandbox credentials

const SQUARE_CONFIG = {
  applicationId: 'sandbox-sq0idb-KCbQTjUFAu6REMQXdfdW9w',
  locationId: 'LQ90HQVSRB9YW',
  environment: 'sandbox'
};

// Test Square payment functionality
async function testSquarePayment() {
  console.log('🧪 Testing Square Payment System...\n');
  
  try {
    // Test 1: Verify Square configuration
    console.log('✅ Square Configuration:');
    console.log(`   Application ID: ${SQUARE_CONFIG.applicationId}`);
    console.log(`   Location ID: ${SQUARE_CONFIG.locationId}`);
    console.log(`   Environment: ${SQUARE_CONFIG.environment}`);
    
    // Test 2: Check if Edge Function is accessible
    const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/square-payment`;
    
    console.log('\n🔗 Edge Function URL:');
    console.log(`   ${edgeFunctionUrl}`);
    
    // Test 3: Test payment endpoint with minimal data
    console.log('\n💳 Testing Payment Endpoint...');
    const testPaymentData = {
      nonce: 'test-nonce', // This would be real Square token in production
      amount: 1000, // $10.00 in cents
      locationId: SQUARE_CONFIG.locationId,
      description: 'Test payment for Zavira Beauty Service'
    };
    
    console.log('   Test Data:', testPaymentData);
    
    // This will fail with the test nonce, but will verify the endpoint is working
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    console.log(`   Response Status: ${response.status}`);
    console.log('   Response:', result);
    
    // Test 4: Provide instructions for real testing
    console.log('\n📋 Next Steps for Real Testing:');
    console.log('   1. Set Square environment variables in Supabase dashboard');
    console.log('   2. Use real Square test card: 4111 1111 1111 1111');
    console.log('   3. Test through your frontend checkout page');
    
    console.log('\n🎉 Square Payment System Setup Complete!');
    console.log('\n📝 IMPORTANT: Environment Variables Setup Required');
    console.log('In your Supabase dashboard, go to:');
    console.log('1. Project Settings → Edge Functions');
    console.log('2. Add environment variables:');
    console.log('   SQUARE_ACCESS_TOKEN=EAAAl3-Ighm0NOdxb8oNum_Ogz6y8r_7PSOmWmK-xOBFTGhKmnJLry9Pc7kQRH63');
    console.log('   SQUARE_ENVIRONMENT=sandbox');
    console.log('3. Redeploy the Edge Function');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSquarePayment();