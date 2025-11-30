const http = require('http');

console.log('=== FINAL STAFF PAGE TEST ===');
console.log('Testing complete staff page functionality...');

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
  let data = '';
  
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== RESPONSE ANALYSIS ===');
    console.log('Content Length:', data.length);
    console.log('Contains StaffApp?', data.includes('StaffApp') || data.includes('staff'));
    console.log('Contains React?', data.includes('react'));
    console.log('Contains Vite client?', data.includes('@vite/client'));
    console.log('Title:', data.match(/<title>(.*?)<\/title>/)?.[1] || 'Not found');
    
    // Check for specific patterns that indicate staff app loaded
    const hasStaffContent = data.includes('Staff Dashboard') || 
                           data.includes('staff') || 
                           data.includes('StaffApp') ||
                           data.includes('salon-staff');
    
    const hasMainApp = data.includes('Zavira') && !hasStaffContent;
    
    console.log('\n=== DIAGNOSIS ===');
    if (hasStaffContent) {
      console.log('✅ SUCCESS: Staff application loaded correctly!');
    } else if (hasMainApp) {
      console.log('❌ FAILURE: Main application loaded instead of staff app');
      console.log('This suggests routing is not working correctly.');
    } else {
      console.log('❓ UNKNOWN: Unexpected content received');
    }
    
    console.log('\n=== PREVIEW (first 1000 chars) ===');
    console.log(data.substring(0, 1000));
    
    process.exit(hasStaffContent ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error('❌ REQUEST ERROR:', err.message);
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.log('❌ TIMEOUT: Request took too long');
  req.destroy();
  process.exit(1);
});

req.end();