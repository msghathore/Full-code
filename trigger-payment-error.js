const { createClient } = require('@supabase/supabase-js');

// Test the square-payment function directly
async function testSquarePayment() {
  const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NzE5NjUsImV4cCI6MjA0ODI0Nzk2NX0.W9G0gYQ5YhZ8c8fX2lX6vY9mJqL2hA1xK9oN3cT1f4g';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test data that should trigger the function
  const testPaymentData = {
    nonce: 'test-nonce-123',
    amount: 2500, // $25.00 in cents
    locationId: 'test-location',
    description: 'Test payment for debugging',
    referenceId: 'test-ref-123'
  };
  
  console.log('🚀 Testing square-payment function...');
  
  try {
    const response = await supabase.functions.invoke('square-payment', {
      body: testPaymentData
    });
    
    console.log('✅ Response:', response);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSquarePayment();