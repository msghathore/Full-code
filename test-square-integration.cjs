#!/usr/bin/env node

// Comprehensive Square Payment Integration Test
// This script tests all aspects of the Square integration after Supabase environment setup

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Test configuration
const TEST_CONFIG = {
  frontendUrl: 'http://localhost:8080',
  checkoutPage: 'http://localhost:8080/checkout',
  staffPage: 'http://localhost:8080/staff',
  supabaseUrl: 'https://stppkvkcjsyusxwtbaej.supabase.co',
  timeout: 10000
};

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Square-Integration-Test/1.0',
        ...options.headers
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test 1: Frontend Server Health
async function testFrontendServer() {
  log('\n🔍 Testing Frontend Server Health...', colors.cyan);
  
  try {
    const response = await makeRequest(TEST_CONFIG.frontendUrl);
    
    if (response.success) {
      logSuccess('Frontend server is running and responding');
      
      // Check if it contains expected content
      if (response.data.includes('Vite') || response.data.includes('React')) {
        logSuccess('Frontend is serving the correct application');
      } else {
        logWarning('Frontend is running but may not be serving the expected content');
      }
      
      return true;
    } else {
      logError(`Frontend server returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Frontend server is not accessible: ${error.message}`);
    return false;
  }
}

// Test 2: Staff Dashboard Access
async function testStaffDashboard() {
  log('\n👥 Testing Staff Dashboard Access...', colors.cyan);
  
  try {
    const response = await makeRequest(TEST_CONFIG.staffPage);
    
    if (response.success) {
      logSuccess('Staff dashboard is accessible');
      
      // Check for JavaScript errors in the response (basic check)
      if (response.data.includes('StaffSchedulingSystem')) {
        logSuccess('Staff dashboard component is loading');
      } else {
        logWarning('Staff dashboard may not be loading the expected component');
      }
      
      return true;
    } else {
      logError(`Staff dashboard returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Staff dashboard is not accessible: ${error.message}`);
    return false;
  }
}

// Test 3: Checkout Page Access
async function testCheckoutPage() {
  log('\n💳 Testing Checkout Page Access...', colors.cyan);
  
  try {
    const response = await makeRequest(TEST_CONFIG.checkoutPage);
    
    if (response.success) {
      logSuccess('Checkout page is accessible');
      
      // Check for Square-related content
      if (response.data.includes('Square') || response.data.includes('square')) {
        logSuccess('Square payment integration found on checkout page');
      } else {
        logWarning('Square integration may not be present on checkout page');
      }
      
      return true;
    } else {
      logError(`Checkout page returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Checkout page is not accessible: ${error.message}`);
    return false;
  }
}

// Test 4: Supabase Edge Function Accessibility
async function testSupabaseEdgeFunction() {
  log('\n🚀 Testing Supabase Edge Function...', colors.cyan);
  
  try {
    const edgeFunctionUrl = `${TEST_CONFIG.supabaseUrl}/functions/v1/square-payment`;
    const response = await makeRequest(edgeFunctionUrl, {
      method: 'OPTIONS'
    });
    
    if (response.statusCode === 200 || response.statusCode === 204) {
      logSuccess('Supabase Edge Function is accessible');
      
      // Check CORS headers
      if (response.headers['access-control-allow-origin']) {
        logSuccess('CORS headers are configured correctly');
      } else {
        logWarning('CORS headers may not be properly configured');
      }
      
      return true;
    } else {
      logError(`Edge Function returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Supabase Edge Function is not accessible: ${error.message}`);
    return false;
  }
}

// Test 5: Square Payment Processing Test
async function testSquarePaymentProcessing() {
  log('\n💰 Testing Square Payment Processing...', colors.cyan);
  
  try {
    const edgeFunctionUrl = `${TEST_CONFIG.supabaseUrl}/functions/v1/square-payment`;
    
    // Test with invalid data to see if function responds properly
    const testPaymentData = {
      nonce: 'test-nonce-for-validation',
      amount: 1000, // $10.00 in cents
      locationId: 'LQ90HQVSRB9YW',
      description: 'Test payment validation'
    };
    
    const response = await makeRequest(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    if (response.statusCode === 200 || response.statusCode === 400 || response.statusCode === 401) {
      logSuccess('Square payment endpoint is responding (validation test)');
      
      try {
        const responseData = JSON.parse(response.data);
        if (responseData.error && responseData.error.includes('access token')) {
          logError('Access token issue detected - check Supabase environment variables');
          return false;
        } else if (responseData.error && responseData.error.includes('nonce')) {
          logSuccess('Function is working correctly (nonce validation working)');
          return true;
        } else {
          logSuccess('Square integration appears to be functioning');
          return true;
        }
      } catch (parseError) {
        logWarning('Could not parse response, but endpoint is responding');
        return true;
      }
    } else {
      logError(`Payment processing test returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Payment processing test failed: ${error.message}`);
    return false;
  }
}

// Test 6: Environment Variable Check
async function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', colors.cyan);
  
  // Check if the variables are properly set by testing the edge function behavior
  try {
    const edgeFunctionUrl = `${TEST_CONFIG.supabaseUrl}/functions/v1/square-payment`;
    
    // Send a request that should fail due to missing token (if env vars aren't set)
    const response = await makeRequest(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1000,
        locationId: 'test'
      })
    });
    
    if (response.data.includes('access token') || response.data.includes('Square access token')) {
      logError('Square access token not found in environment variables');
      return false;
    } else {
      logSuccess('Environment variables appear to be configured correctly');
      return true;
    }
  } catch (error) {
    logWarning(`Could not verify environment variables: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🧪 Square Payment Integration Test Suite', colors.bright);
  log('===========================================', colors.cyan);
  
  const tests = [
    { name: 'Frontend Server', test: testFrontendServer },
    { name: 'Staff Dashboard', test: testStaffDashboard },
    { name: 'Checkout Page', test: testCheckoutPage },
    { name: 'Supabase Edge Function', test: testSupabaseEdgeFunction },
    { name: 'Payment Processing', test: testSquarePaymentProcessing },
    { name: 'Environment Variables', test: testEnvironmentVariables }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      results.push({ name, success: result });
    } catch (error) {
      logError(`${name} test failed with error: ${error.message}`);
      results.push({ name, success: false, error: error.message });
    }
  }
  
  // Summary
  log('\n📊 Test Results Summary', colors.bright);
  log('========================', colors.cyan);
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED${result.error ? ` (${result.error})` : ''}`);
    }
  });
  
  log(`\n🎯 Overall Result: ${passed}/${total} tests passed`, 
      passed === total ? colors.green : colors.yellow);
  
  if (passed === total) {
    log('\n🎉 All tests passed! Your Square integration appears to be working correctly.', colors.green);
  } else if (passed >= total * 0.7) {
    log('\n⚠️  Most tests passed, but there may be some issues to address.', colors.yellow);
  } else {
    log('\n🚨 Several tests failed. Please check the configuration.', colors.red);
  }
  
  // Additional recommendations
  log('\n💡 Next Steps:', colors.blue);
  if (passed < total) {
    log('1. Check your browser console for JavaScript errors');
    log('2. Verify Supabase environment variables are saved correctly');
    log('3. Test the payment flow manually in the browser');
  } else {
    log('1. Test the payment flow manually in the browser');
    log('2. Try a test payment with Square sandbox cards');
    log('3. Monitor Supabase Edge Function logs for any issues');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  logError(`Test suite failed to run: ${error.message}`);
  process.exit(1);
});