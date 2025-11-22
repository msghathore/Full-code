// Debug script to test personal task creation step by step
// Run this in the browser console while on the staff page

console.log('🔍 Personal Task Debug Script Started');
console.log('=====================================');

// Check if we're on the right page
if (!window.location.pathname.includes('staff')) {
  console.log('❌ Please navigate to the staff scheduling page first');
  return;
}

// 1. Check if Supabase client is available
console.log('\n1. Checking Supabase client...');
try {
  const supabase = window.supabase || window.__SUPABASE_CLIENT__;
  if (supabase) {
    console.log('✅ Supabase client found');
  } else {
    console.log('❌ Supabase client not found');
  }
} catch (error) {
  console.log('❌ Error accessing Supabase:', error);
}

// 2. Check slotActionServices
console.log('\n2. Checking slotActionServices...');
try {
  const serviceFunctions = Object.keys(window).filter(key => 
    key.includes('createPersonalTask') || 
    key.includes('slotAction') ||
    typeof window[key] === 'function'
  );
  
  if (serviceFunctions.length > 0) {
    console.log('✅ Found service functions:', serviceFunctions);
  } else {
    console.log('❌ No service functions found');
  }
} catch (error) {
  console.log('❌ Error checking services:', error);
}

// 3. Test database connection
console.log('\n3. Testing database connection...');
async function testDatabase() {
  try {
    const supabase = window.supabase || window.__SUPABASE_CLIENT__;
    if (!supabase) {
      console.log('❌ Cannot test - Supabase not available');
      return;
    }

    console.log('Checking if personal_tasks table exists...');
    const { data, error } = await supabase
      .from('personal_tasks')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ personal_tasks table error:', error.message);
      console.log('This means you need to run the SQL migration script');
    } else {
      console.log('✅ personal_tasks table exists and is accessible');
    }

  } catch (error) {
    console.log('❌ Database test failed:', error);
  }
}

// 4. Test RPC function
console.log('\n4. Testing RPC function...');
async function testRPC() {
  try {
    const supabase = window.supabase || window.__SUPABASE_CLIENT__;
    if (!supabase) {
      console.log('❌ Cannot test RPC - Supabase not available');
      return;
    }

    console.log('Testing create_personal_task RPC function...');
    const { data, error } = await supabase.rpc('create_personal_task', {
      staffId: 'test-staff-id',
      appointmentDate: '2024-11-22',
      appointmentTime: '10:00:00',
      description: 'Test personal task',
      durationMinutes: 60
    });

    if (error) {
      console.log('❌ RPC function error:', error.message);
    } else {
      console.log('✅ RPC function works:', data);
    }

  } catch (error) {
    console.log('❌ RPC test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testDatabase();
  await testRPC();
  
  console.log('\n🔍 Debug script completed');
  console.log('=====================================');
  
  console.log('\n📋 Next Steps:');
  console.log('1. If personal_tasks table error: Run complete_personal_task_fix.sql in Supabase');
  console.log('2. If RPC error: Run complete_personal_task_fix.sql in Supabase');
  console.log('3. If all tests pass: Try creating a personal task manually');
}

// Execute tests
runAllTests();