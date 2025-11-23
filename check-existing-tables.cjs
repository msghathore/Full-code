// Check what tables actually exist in the database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

async function checkExistingTables() {
  console.log('🔍 Checking existing database tables...');
  
  try {
    // Check schema tables
    console.log('\n📋 SCHEMA TABLES:');
    
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.log('❌ Error getting schema info:', error.message);
    } else {
      console.log(`Found ${tables?.length || 0} tables:`);
      tables?.forEach(t => console.log(`  - ${t.table_name}`));
    }
    
    // Test POS-specific tables
    const posTables = ['payments', 'transactions', 'transaction_items', 'pos_customers', 'customers'];
    
    console.log('\n🧪 TESTING POS TABLES:');
    
    for (const tableName of posTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ ${tableName}: Table does not exist`);
          } else {
            console.log(`⚠️  ${tableName}: ${error.message}`);
          }
        } else {
          console.log(`✅ ${tableName}: Table exists (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Exception - ${err.message}`);
      }
    }
    
    // Test finalize_transaction function
    console.log('\n🔧 TESTING finalize_transaction FUNCTION:');
    try {
      const { data, error } = await supabase.rpc('finalize_transaction', {
        transaction_data: {}
      });
      
      if (error) {
        console.log(`❌ Function error: ${error.message}`);
      } else {
        console.log(`✅ Function exists and returned: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`❌ Function exception: ${err.message}`);
    }
    
  } catch (err) {
    console.log('❌ Database check failed:', err.message);
  }
}

checkExistingTables().catch(console.error);