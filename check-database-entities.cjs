// Check what entities exist in the database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

async function checkDatabaseEntities() {
  console.log('🔍 Checking database entities...');
  
  try {
    // Check customers
    console.log('\n👥 CUSTOMERS:');
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .limit(5);
    
    if (customerError) {
      console.log('❌ Error fetching customers:', customerError.message);
    } else {
      console.log(`Found ${customers?.length || 0} customers:`);
      customers?.forEach(c => console.log(`  - ${c.id}: ${c.name}`));
    }
    
    // Check staff
    console.log('\n👤 STAFF:');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name')
      .limit(5);
    
    if (staffError) {
      console.log('❌ Error fetching staff:', staffError.message);
    } else {
      console.log(`Found ${staff?.length || 0} staff members:`);
      staff?.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
    }
    
    // Check services
    console.log('\n⚡ SERVICES:');
    const { data: services, error: serviceError } = await supabase
      .from('services')
      .select('id, name')
      .limit(5);
    
    if (serviceError) {
      console.log('❌ Error fetching services:', serviceError.message);
    } else {
      console.log(`Found ${services?.length || 0} services:`);
      services?.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
    }
    
    // Test with real data
    if (customers?.length > 0 && staff?.length > 0 && services?.length > 0) {
      console.log('\n🧪 TESTING WITH REAL DATA:');
      
      const realCustomer = customers[0];
      const realStaff = staff[0];
      const realService = services[0];
      
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
            method: 'CASH',
            amount: 52.50,
            status: 'completed'
          }
        ],
        tip_amount: 0
      };

      console.log('Testing transaction with real IDs...');
      
      const { data, error } = await supabase.rpc('finalize_transaction', {
        transaction_data: transactionData
      });

      if (error) {
        console.log('❌ Real transaction failed:', error.message);
        
        if (error.message.includes('payments_method_check')) {
          console.log('🚨 PAYMENT METHOD CONSTRAINT VIOLATION!');
          console.log('The database constraint is rejecting the payment method values.');
        } else {
          console.log('❌ Other constraint violation:', error.message);
        }
      } else {
        console.log('✅ Real transaction successful!');
      }
    } else {
      console.log('\n⚠️  Missing required data in database - need to seed data');
    }
    
  } catch (err) {
    console.log('❌ Database check failed:', err.message);
  }
}

checkDatabaseEntities().catch(console.error);