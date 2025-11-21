import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingFlow() {
  console.log('🔍 Testing booking flow step by step...');
  
  try {
    // Step 1: Check what services exist
    console.log('📋 Fetching services...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);
    
    if (servicesError) {
      console.log('❌ Services fetch failed:', servicesError);
    } else {
      console.log('✅ Services found:', services);
    }
    
    // Step 2: Check what staff exist  
    console.log('👥 Fetching staff...');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true);
    
    if (staffError) {
      console.log('❌ Staff fetch failed:', staffError);
    } else {
      console.log('✅ Staff found:', staff);
    }
    
    // Step 3: Check current appointments
    console.log('📅 Fetching existing appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(5);
    
    if (appointmentsError) {
      console.log('❌ Appointments fetch failed:', appointmentsError);
    } else {
      console.log('✅ Existing appointments:', appointments);
    }
    
    // Step 4: Try to disable RLS temporarily for testing
    console.log('🔧 Trying to disable RLS for testing...');
    
    // First, let's see the current table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Cannot access appointments table:', tableError);
      
      // Maybe try to access through different method
      console.log('🔄 Trying alternative approach...');
      
      // Check if we can see the schema through a different route
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'appointments');
        
      if (schemaError) {
        console.log('❌ Cannot access schema info:', schemaError);
      } else {
        console.log('✅ Schema info:', schemaData);
      }
    } else {
      console.log('✅ Can access appointments table (RLS not blocking)');
    }
    
    // Step 5: If we can access services, try a real booking
    if (services && services.length > 0) {
      console.log('🧪 Trying real booking with actual service...');
      
      const testBookingData = {
        service_id: services[0].id, // Use actual service ID
        appointment_date: '2024-11-20',
        appointment_time: '10:00',
        status: 'pending',
        payment_status: 'pending'
      };
      
      console.log('📦 Inserting booking with real service:', testBookingData);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('appointments')
        .insert(testBookingData)
        .select();
      
      if (insertError) {
        console.log('❌ Real booking failed:', insertError);
        console.log('🔍 This is likely the RLS policy blocking us');
      } else {
        console.log('✅ Real booking successful!');
        console.log('Result:', insertResult);
        
        // Clean up test booking
        if (insertResult && insertResult[0] && insertResult[0].id) {
          await supabase
            .from('appointments')
            .delete()
            .eq('id', insertResult[0].id);
          console.log('🧹 Test booking cleaned up');
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Exception:', error);
  }
}

// Run the test
testBookingFlow();