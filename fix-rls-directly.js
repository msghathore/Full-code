import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for guest bookings...');
  
  try {
    // Check current policies
    console.log('📋 Checking current policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_schema', { table_name: 'appointments' });
    
    if (policyError) {
      console.log('Policy check failed, proceeding with fixes...');
    }

    // SQL to fix RLS policies
    const sqlCommands = [
      // Drop existing restrictive policies
      `DROP POLICY IF EXISTS "Users can only view their own appointments" ON appointments;`,
      `DROP POLICY IF EXISTS "Users can only insert their own appointments" ON appointments;`,
      `DROP POLICY IF EXISTS "Users can only update their own appointments" ON appointments;`,
      
      // Allow anyone to INSERT appointments (for guest bookings)
      `CREATE POLICY "Allow guest bookings" ON appointments FOR INSERT WITH CHECK (true);`,
      
      // Allow anyone to SELECT appointments (so you can view bookings)
      `CREATE POLICY "Allow viewing all appointments" ON appointments FOR SELECT USING (true);`,
      
      // Allow updates (for admin/staff)
      `CREATE POLICY "Allow updating appointments" ON appointments FOR UPDATE USING (true);`,
      
      // Enable RLS
      `ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;`
    ];

    // Execute each SQL command
    for (const sql of sqlCommands) {
      console.log(`🔄 Running: ${sql}`);
      
      try {
        // Use rpc to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
          query: sql 
        });
        
        if (error) {
          console.log(`❌ Error with command: ${sql}`);
          console.log('Error:', error);
        } else {
          console.log('✅ Command executed successfully');
        }
      } catch (e) {
        console.log(`❌ Exception with command: ${sql}`);
        console.log('Exception:', e);
      }
    }
    
    // Test a simple booking insertion to verify it works
    console.log('🧪 Testing booking insertion...');
    
    const testBookingData = {
      service_id: '1',
      appointment_date: '2024-11-20',
      appointment_time: '10:00',
      status: 'pending',
      payment_status: 'pending'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('appointments')
      .insert(testBookingData)
      .select();
    
    if (insertError) {
      console.log('❌ Test booking failed:', insertError);
    } else {
      console.log('✅ Test booking successful!');
      console.log('Test booking result:', insertResult);
      
      // Clean up test booking
      if (insertResult && insertResult[0] && insertResult[0].id) {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Test booking cleaned up');
      }
    }
    
    console.log('🎉 RLS policy fix completed!');
    
  } catch (error) {
    console.error('💥 Exception during RLS fix:', error);
  }
}

// Run the fix
fixRLSPolicies();