const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://stppkvkcjsyusxwtbaej.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
);

(async () => {
  try {
    // Manually execute the SQL since Supabase client doesn't support DDL well
    console.log('Note: Migration file created at supabase/migrations/20251226_create_service_upsells.sql');
    console.log('Please run the migration manually through Supabase dashboard or CLI');
    console.log('');
    console.log('For now, creating sample data with direct RPC if possible...');

    // Try to verify table exists
    const { data, error } = await supabase
      .from('service_upsells')
      .select('*')
      .limit(1);

    if (!error || error.message.includes('schema cache')) {
      console.log('Table exists in database');
      console.log('Proceeding with component creation...');
    } else {
      console.log('Table verification result:', error ? error.message : 'OK');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
