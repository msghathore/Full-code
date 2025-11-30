#!/usr/bin/env node

/**
 * DIAGNOSTIC SCRIPT FOR PERSONAL TASK CREATION ERROR
 * This script will help identify the exact cause of the failure
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPersonalTaskCreation() {
  console.log('🔍 Starting Personal Task Creation Diagnostic...\n');
  
  // Test data
  const testStaffId = 'test-staff-123'; // This is what the frontend would send
  const testDate = '2024-12-01';
  const testTime = '10:00:00';
  const testDescription = 'Test personal task';
  const testDuration = 60;

  console.log('📊 Test Parameters:');
  console.log(`  Staff ID: "${testStaffId}" (type: ${typeof testStaffId})`);
  console.log(`  Date: "${testDate}"`);
  console.log(`  Time: "${testTime}"`);
  console.log(`  Description: "${testDescription}"`);
  console.log(`  Duration: ${testDuration} minutes\n`);

  // Test 1: Check if RPC function exists
  console.log('🧪 Test 1: Checking RPC function existence...');
  try {
    const { data: functionInfo, error: funcError } = await supabase
      .rpc('create_personal_task', {
        staffId: testStaffId,
        appointmentDate: testDate,
        appointmentTime: testTime,
        description: testDescription,
        durationMinutes: testDuration
      });
    
    if (funcError) {
      console.log('❌ RPC function call failed:', funcError);
      console.log('   Error code:', funcError.code);
      console.log('   Error message:', funcError.message);
      console.log('   Error details:', funcError.details);
      console.log('   Error hint:', funcError.hint);
    } else {
      console.log('✅ RPC function call succeeded:', data);
    }
  } catch (err) {
    console.log('❌ RPC function call threw exception:', err.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Try direct table insertion
  console.log('🧪 Test 2: Testing direct table insertion...');
  try {
    const { data: directData, error: directError } = await supabase
      .from('personal_tasks')
      .insert([{
        staff_id: testStaffId,
        appointment_date: testDate,
        appointment_time: testTime,
        duration_minutes: testDuration,
        description: testDescription,
        status: 'scheduled'
      }])
      .select('id')
      .single();

    if (directError) {
      console.log('❌ Direct insertion failed:', directError);
      console.log('   Error code:', directError.code);
      console.log('   Error message:', directError.message);
      console.log('   Error details:', directError.details);
    } else {
      console.log('✅ Direct insertion succeeded:', directData);
    }
  } catch (err) {
    console.log('❌ Direct insertion threw exception:', err.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Check staff table to see the actual staff_id format
  console.log('🧪 Test 3: Checking actual staff data format...');
  try {
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, name')
      .limit(3);

    if (staffError) {
      console.log('❌ Staff query failed:', staffError);
    } else {
      console.log('✅ Staff data found:');
      staffData.forEach(staff => {
        console.log(`  - ID: "${staff.id}" (type: ${typeof staff.id}), Name: ${staff.name}`);
      });
    }
  } catch (err) {
    console.log('❌ Staff query threw exception:', err.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Test with UUID staff_id (what might be expected)
  console.log('🧪 Test 4: Testing with UUID staff_id format...');
  try {
    const { data: uuidData, error: uuidError } = await supabase
      .rpc('create_personal_task', {
        staffId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // UUID format
        appointmentDate: testDate,
        appointmentTime: testTime,
        description: testDescription,
        durationMinutes: testDuration
      });
    
    if (uuidError) {
      console.log('❌ UUID RPC call failed:', uuidError);
      console.log('   Error code:', uuidError.code);
      console.log('   Error message:', uuidError.message);
    } else {
      console.log('✅ UUID RPC call succeeded:', uuidData);
    }
  } catch (err) {
    console.log('❌ UUID RPC call threw exception:', err.message);
  }

  console.log('\n🎯 DIAGNOSTIC COMPLETE\n');
}

testPersonalTaskCreation().catch(console.error);