// Create the missing customer record to fix the payment issue
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

async function createMissingCustomer() {
  console.log('🔍 Creating missing customer record...');
  
  try {
    // Check if the customer already exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .single();
    
    if (checkError && !checkError.message.includes('No rows found')) {
      console.log('❌ Error checking customer:', checkError.message);
      return false;
    }
    
    if (existingCustomer) {
      console.log('✅ Customer already exists:', existingCustomer);
      return true;
    }
    
    // Create the customer record
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Carol Wilson',
          email: 'carol.wilson@example.com',
          phone: '(555) 123-4567',
          loyalty_points: 0,
          last_visit: '2024-11-15'
        }
      ])
      .select();
    
    if (createError) {
      console.log('❌ Error creating customer:', createError.message);
      
      if (createError.message.includes('customers table')) {
        console.log('🚨 CUSTOMERS TABLE DOES NOT EXIST!');
        console.log('The customers table needs to be created via migration.');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Customer created successfully:', newCustomer);
    return true;
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

async function testPaymentAfterFix() {
  console.log('🧪 Testing payment after customer fix...');
  
  try {
    // Get first staff and service
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name')
      .limit(1)
      .single();
    
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name')
      .limit(1)
      .single();
    
    if (staffError || serviceError) {
      console.log('❌ Error getting staff/service:', staffError?.message || serviceError?.message);
      return false;
    }
    
    const transactionData = {
      customer_id: '550e8400-e29b-41d4-a716-446655440000',
      staff_id: staff.id,
      cart_items: [
        {
          item_type: 'SERVICE',
          item_id: service.id,
          name: service.name,
          price: 50.00,
          quantity: 1,
          discount: 0,
          provider_id: staff.id
        }
      ],
      payment_methods: [
        {
          method: 'CASH',
          amount: 52.50,
          status: 'completed'
        }
      ],
      tip_amount: 0
    };

    console.log('Testing cash payment...');
    
    const { data, error } = await supabase.rpc('finalize_transaction', {
      transaction_data: transactionData
    });

    if (error) {
      console.log('❌ Payment still failing:', error.message);
      
      if (error.message.includes('payments_method_check')) {
        console.log('🚨 PAYMENT METHOD CONSTRAINT VIOLATION!');
        console.log('Now we have the real issue - database constraint mismatch');
      }
      return false;
    } else {
      console.log('✅ Payment successful!');
      console.log('🎉 CASH PAYMENTS ARE NOW WORKING!');
      return true;
    }
    
  } catch (err) {
    console.log('❌ Payment test failed:', err.message);
    return false;
  }
}

async function runCompleteFix() {
  console.log('🔧 PAYMENT FIX - CUSTOMER MISSING ISSUE');
  console.log('=' .repeat(50));
  
  const customerCreated = await createMissingCustomer();
  
  if (customerCreated) {
    const paymentWorks = await testPaymentAfterFix();
    
    if (paymentWorks) {
      console.log('\n🎉 SUCCESS! Payments are now working!');
    } else {
      console.log('\n❌ Payment still failing - likely the constraint issue');
    }
  }
  
  console.log('\n' + '=' .repeat(50));
}

runCompleteFix().catch(console.error);