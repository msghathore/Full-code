// Debug script to test payment processing
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://placeholder.supabase.co',
  'placeholder-key'
);

async function testPaymentProcessing() {
  try {
    console.log('Testing payment processing...');
    
    // Test transaction data
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
          method: 'CASH',
          amount: 52.50, // 50.00 + 5% tax
          status: 'completed'
        }
      ],
      tip_amount: 0
    };

    console.log('Transaction data:', JSON.stringify(transactionData, null, 2));

    // Call the finalize_transaction function
    const { data, error } = await supabase.rpc('finalize_transaction', {
      transaction_data: transactionData
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testPaymentProcessing();