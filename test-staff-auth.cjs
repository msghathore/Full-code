// Simple test to check staff route authentication
const http = require('http');

function testStaffRoute() {
  console.log('🧪 Testing /staff route authentication...\n');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/staff',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`📍 Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response length: ${data.length} characters`);
      
      // Check if response contains authentication-related content
      const authKeywords = ['sign-in', 'SignIn', 'login', 'staff-login', 'Authentication Required', 'clerk'];
      const foundKeywords = authKeywords.filter(keyword => 
        data.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        console.log(`✅ Authentication UI detected: ${foundKeywords.join(', ')}`);
      } else {
        console.log(`❌ No authentication UI found in response`);
        console.log(`🔍 Response preview: ${data.substring(0, 200)}...`);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
  });
  
  req.end();
}

testStaffRoute();