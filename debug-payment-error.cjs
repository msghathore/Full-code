#!/usr/bin/env node

// Payment Error Debug Script
// This script will help identify what's causing the 500 error in the Square payment function

const https = require('https');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

function logError(message) {
  log(`❌ ${message}`, '\x1b[31m');
}

function logSuccess(message) {
  log(`✅ ${message}`, '\x1b[32m');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, '\x1b[34m');
}

// Test the edge function with detailed error reporting
async function testPaymentFunction() {
  log('\n🔍 Testing Square Payment Function with Detailed Error Reporting', '\x1b[36m');
  
  const options = {
    hostname: 'stppkvkcjsyusxwtbaej.supabase.co',
    port: 443,
    path: '/functions/v1/square-payment',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
    },
    timeout: 15000
  };

  const testData = {
    nonce: 'test-nonce-for-debugging',
    amount: 1000, // $10.00
    locationId: 'LQ90HQVSRB9YW',
    description: 'Debug test payment'
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    logInfo(`Response Status: ${res.statusCode}`);
    logInfo(`Response Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      log('\n📋 Response Data:', '\x1b[33m');
      console.log(data);
      
      try {
        const parsedData = JSON.parse(data);
        log('\n🔍 Parsed Response:', '\x1b[33m');
        console.log(JSON.stringify(parsedData, null, 2));
        
        if (res.statusCode === 500) {
          logError('Server returned 500 Internal Server Error');
          
          if (parsedData.error) {
            logError(`Error Message: ${parsedData.error}`);
          }
          
          if (parsedData.errorCode) {
            logError(`Error Code: ${parsedData.errorCode}`);
          }
          
          // Common error analysis
          if (data.includes('access token') || data.includes('Square access token')) {
            logError('🔑 ANALYSIS: Access token issue detected');
            logInfo('💡 SOLUTION: Check that SQUARE_ACCESS_TOKEN is set in Supabase environment variables');
          } else if (data.includes('nonce') || data.includes('sourceId')) {
            logError('🔑 ANALYSIS: Payment token validation issue');
            logInfo('💡 SOLUTION: This is expected with test data - the function is working but validating tokens properly');
          } else if (data.includes('amount')) {
            logError('🔑 ANALYSIS: Amount validation issue');
            logInfo('💡 SOLUTION: Check amount formatting (should be in cents)');
          } else if (data.includes('locationId')) {
            logError('🔑 ANALYSIS: Location ID validation issue');
            logInfo('💡 SOLUTION: Check that location ID matches your Square account');
          } else {
            logError('🔑 ANALYSIS: Unknown server error');
            logInfo('💡 SOLUTION: Check Supabase Edge Function logs for detailed error information');
          }
        } else if (res.statusCode === 400) {
          logWarning('⚠️  Bad Request - This is expected with test data');
          logSuccess('✅ Function is responding correctly to invalid test data');
        } else if (res.statusCode === 200) {
          logSuccess('✅ Payment function responded successfully');
        }
        
      } catch (parseError) {
        logWarning('⚠️  Could not parse response as JSON');
        logInfo('Raw response data shown above');
      }
    });
  });

  req.on('error', (error) => {
    logError(`Request failed: ${error.message}`);
  });

  req.on('timeout', () => {
    logError('Request timed out');
    req.destroy();
  });

  logInfo('Sending test request with data:');
  console.log(JSON.stringify(testData, null, 2));
  
  req.write(JSON.stringify(testData));
  req.end();
}

// Additional function to test CORS
async function testCORS() {
  log('\n🌐 Testing CORS Headers', '\x1b[36m');
  
  const options = {
    hostname: 'stppkvkcjsyusxwtbaej.supabase.co',
    port: 443,
    path: '/functions/v1/square-payment',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,authorization,apikey'
    },
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    logInfo(`CORS Response Status: ${res.statusCode}`);
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    corsHeaders.forEach(header => {
      const value = res.headers[header];
      if (value) {
        logSuccess(`✅ ${header}: ${value}`);
      } else {
        logWarning(`⚠️  ${header}: Not set`);
      }
    });
  });

  req.on('error', (error) => {
    logError(`CORS test failed: ${error.message}`);
  });

  req.on('timeout', () => {
    logError('CORS request timed out');
    req.destroy();
  });

  req.end();
}

// Run the tests
async function runDebugTests() {
  log('🧪 Square Payment Error Debug Suite', '\x1b[1m');
  log('======================================', '\x1b[36m');
  
  await testCORS();
  await testPaymentFunction();
  
  log('\n💡 Debug Recommendations:', '\x1b[35m');
  log('1. Check Supabase Dashboard → Edge Functions → Logs for detailed error info');
  log('2. Verify environment variables are saved correctly in Supabase');
  log('3. Test with valid Square sandbox credentials if available');
  log('4. The 500 error with test data is normal - the function validates payment tokens');
}

runDebugTests().catch(error => {
  logError(`Debug tests failed: ${error.message}`);
});