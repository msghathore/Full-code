// Final payment test with real data from database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

async function testRealPayment() {
  console.log('🧪 TESTING REAL PAYMENT WITH ACTUAL DATABASE DATA');
  console.log('=' .repeat(60));
  
  try {
    // Get real data from database
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .limit(1);
    
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name')
      .limit(1);
    
    const { data: services, error: serviceError } = await supabase
      .from('services')
      .select('id, name')
      .limit(1);
    
    if (customerError || staffError || serviceError) {
      console.log('❌ Error getting test data:', customerError?.message || staffError?.message || serviceError?.message);
      return false;
    }
    
    const realCustomer = customers[0];
    const realStaff = staff[0];
    const realService = services[0];
    
    console.log(`✅ Using real data:`);
    console.log(`   Customer: ${realCustomer.name} (${realCustomer.id})`);
    console.log(`   Staff: ${realStaff.name} (${realStaff.id})`);
    console.log(`   Service: ${realService.name} (${realService.id})`);
    
    // Test different payment methods
    const paymentMethods = ['CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'];
    
    for (const paymentMethod of paymentMethods) {
      console.log(`\n💳 Testing ${paymentMethod} payment...`);
      
      const transactionData = {
        customer_id: realCustomer.id,
        staff_id: realStaff.id,
        cart_items: [
          {
            item_type: 'SERVICE',
            item_id: realService.id,
            name: realService.name,
            price: 50.00,
            quantity: 1,
            discount: 0,
            provider_id: realStaff.id
          }
        ],
        payment_methods: [
          {
            method: paymentMethod,
            amount: 52.50,
            status: 'completed'
          }
        ],
        tip_amount: 0
      };

      const { data, error } = await supabase.rpc('finalize_transaction', {
        transaction_data: transactionData
      });

      if (error) {
        console.log(`❌ ${paymentMethod} payment failed: ${error.message}`);
        
        if (error.message.includes('payments_method_check')) {
          console.log(`🚨 PAYMENT METHOD CONSTRAINT VIOLATION for ${paymentMethod}!`);
          return false;
        }
        
        return false;
      } else {
        console.log(`✅ ${paymentMethod} payment successful! Transaction ID: ${data.transaction_id}`);
      }
    }
    
    console.log('\n🎉 ALL PAYMENT METHODS WORKING!');
    console.log('✅ CASH, CHECK, CREDIT, DEBIT, GIFT_CERTIFICATE are all functional');
    return true;
    
  } catch (err) {
    console.log('❌ Exception during payment test:', err.message);
    return false;
  }
}

testRealPayment().catch(console.error);