// Test script to directly test booking functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBooking() {
  console.log('🔍 Testing booking functionality...');
  
  try {
    // Test data that the booking form would send
    const bookingData = {
      service_id: '1',
      appointment_date: '2024-11-19',
      appointment_time: '10:00',
      notes: 'Test booking',
      total_amount: 75,
      deposit_amount: 15,
      status: 'pending',
      payment_status: 'pending',
      full_name: 'Test Customer',
      phone: '+1234567890',
      email: 'test@example.com'
    };

    console.log('📦 Inserting booking data:', bookingData);

    const { data: insertResult, error } = await supabase
      .from('appointments')
      .insert(bookingData)
      .select();

    if (error) {
      console.error('❌ ERROR:', error);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error message:', error.message);
      return;
    }

    console.log('✅ SUCCESS: Booking created:', insertResult);
    
  } catch (error) {
    console.error('💥 EXCEPTION:', error);
  }
}

// Run the test
testBooking();