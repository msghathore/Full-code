// Test script to validate Clerk authentication fix
const fetch = require('node-fetch');

async function testStaffRouteAuthentication() {
  console.log('🧪 Testing Clerk authentication fix...\n');
  
  try {
    // Test unauthenticated access to /staff route
    console.log('1. Testing unauthenticated access to /staff route:');
    const staffResponse = await fetch('http://localhost:8080/staff', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   Status: ${staffResponse.status} ${staffResponse.statusText}`);
    const staffContent = await staffResponse.text();
    
    if (staffResponse.status === 302 || staffResponse.status === 301) {
      const redirectLocation = staffResponse.headers.get('location');
      console.log(`   ✅ Proper redirect detected: ${redirectLocation}`);
    } else if (staffContent.includes('sign-in') || staffContent.includes('SignIn') || staffContent.includes('staff-login')) {
      console.log(`   ✅ Authentication UI detected in response`);
    } else {
      console.log(`   ⚠️  Unexpected response content length: ${staffContent.length} characters`);
    }
    
    // Test authenticated route like root
    console.log('\n2. Testing public route / for comparison:');
    const rootResponse = await fetch('http://localhost:8080/');
    console.log(`   Status: ${rootResponse.status} ${rootResponse.statusText}`);
    
    // Test staff-login route exists
    console.log('\n3. Testing staff-login route exists:');
    const loginResponse = await fetch('http://localhost:8080/auth/staff-login');
    console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testStaffRouteAuthentication();