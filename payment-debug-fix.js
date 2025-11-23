// Comprehensive Payment Debug Script
// This script will help identify and fix the payment constraint violation

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with real credentials
const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

// Payment method mapping function (same as frontend)
const mapPaymentMethod = (frontendMethod) => {
  const mapping = {
    'CASH': 'CASH',
    'CHECK': 'CHECK',
    'CREDIT': 'CREDIT',
    'DEBIT': 'DEBIT',
    'GIFT_CERTIFICATE': 'GIFT_CERTIFICATE'
  };
  return mapping[frontendMethod] || 'CASH';
};

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('relation "payments" does not exist')) {
      console.log('❌ ERROR: payments table does not exist. Need to run migrations.');
      return false;
    }
    
    if (error) {
      console.log('❌ Database error:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function testConstraintCheck() {
  console.log('🔍 Testing payment method constraints...');
  
  // Test the mapping function with all possible payment methods
  const paymentMethods = ['CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'];
  
  console.log('✅ Payment method mapping test:');
  paymentMethods.forEach(method => {
    const mapped = mapPaymentMethod(method);
    console.log(`   ${method} -> ${mapped}`);
  });
  
  // Test if all mapped values match expected database values
  const expectedValues = ['CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'];
  const allValid = paymentMethods.every(method => {
    const mapped = mapPaymentMethod(method);
    return expectedValues.includes(mapped);
  });
  
  if (allValid) {
    console.log('✅ All payment methods map to valid database values');
    return true;
  } else {
    console.log('❌ Some payment methods map to invalid values');
    return false;
  }
}

async function simulatePaymentTransaction() {
  console.log('🔍 Simulating payment transaction...');
  
  // Mock transaction data
  const transactionData = {
    customer_id: '550e8400-e29b-41d4-a716-446655440000',
    staff_id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
    cart_items: [
      {
        item_type: 'SERVICE',
        item_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Service',
        price: 50.00,
        quantity: 1,
        discount: 0,
        provider_id: '123e4567-e89b-12d3-a456-426614174000'
      }
    ],
    payment_methods: [
      {
        method: mapPaymentMethod('CASH'),
        amount: 52.50, // 50.00 + 5% tax
        status: 'completed'
      }
    ],
    tip_amount: 0
  };

  console.log('Transaction data:', JSON.stringify(transactionData, null, 2));

  try {
    // Call the finalize_transaction function
    const { data, error } = await supabase.rpc('finalize_transaction', {
      transaction_data: transactionData
    });

    if (error) {
      console.log('❌ Transaction failed:', error.message);
      
      // Check if it's a constraint violation
      if (error.message.includes('payments_method_check')) {
        console.log('🚨 CONSTRAINT VIOLATION DETECTED!');
        console.log('The constraint "payments_method_check" is rejecting the payment method.');
        console.log('This means the database schema has not been updated with the correct constraint.');
        return false;
      }
      
      return false;
    } else {
      console.log('✅ Transaction successful:', data);
      return true;
    }
  } catch (err) {
    console.log('❌ Exception during transaction:', err.message);
    return false;
  }
}

async function runFullDebug() {
  console.log('🔍 PAYMENT DEBUG ANALYSIS');
  console.log('=' .repeat(50));
  
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n❌ ISSUE: Database not connected or migrations not applied');
    console.log('SOLUTION: Run Supabase migrations to set up the database schema');
    return;
  }
  
  const constraintValid = await testConstraintCheck();
  
  if (!constraintValid) {
    console.log('\n❌ ISSUE: Payment method mapping is invalid');
    console.log('SOLUTION: Fix the mapPaymentMethod function');
    return;
  }
  
  const transactionSuccess = await simulatePaymentTransaction();
  
  if (!transactionSuccess) {
    console.log('\n❌ ISSUE: Transaction failing due to constraint violation');
    console.log('SOLUTION: Apply database migrations or use the fallback fix');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🔧 FINAL RECOMMENDATIONS:');
  console.log('1. Ensure Supabase migrations are applied');
  console.log('2. Check that the payments_method_check constraint allows all expected values');
  console.log('3. Verify the frontend mapPaymentMethod function is working correctly');
}

// Run the debug analysis
runFullDebug().catch(console.error);