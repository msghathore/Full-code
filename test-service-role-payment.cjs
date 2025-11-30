const { createClient } = require('@supabase/supabase-js');

// Test with service role key to see detailed error
async function testSquarePaymentWithServiceKey() {
  const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
  // Using service role key - get from project settings
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjY3MTk2NSwiZXhwIjoyMDQ4MjQ3OTY1fQ.4iVJ7mCqX5T8Y9nQ2wE5xP6mL1aQ9sF3rH6uV2bN0tA';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test data that should trigger the function
  const testPaymentData = {
    nonce: 'test-nonce-123',
    amount: 2500, // $25.00 in cents
    locationId: 'L88917ABCD1234EF', // Real Square sandbox location ID
    description: 'Test payment for debugging',
    referenceId: 'test-ref-123',
    customerId: null,
    staffId: null
  };
  
  console.log('🚀 Testing square-payment function with service role...');
  
  try {
    const response = await supabase.functions.invoke('square-payment', {
      body: testPaymentData,
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    console.log('✅ Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      context: error.context
    });
  }
}

testSquarePaymentWithServiceKey();