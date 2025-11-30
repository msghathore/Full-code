const http = require('http');

console.log('Testing staff page at http://localhost:8080/staff...');

const req = http.get('http://localhost:8080/staff', (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received successfully!');
    console.log('Response preview (first 500 chars):');
    console.log(data.substring(0, 500));
    
    if (data.includes('ZAVIRA')) {
      console.log('✅ SUCCESS: Staff page loaded correctly!');
    } else {
      console.log('❌ FAILURE: Staff page did not load correctly');
    }
    
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ ERROR:', err.message);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.log('❌ TIMEOUT: Request took too long');
  req.destroy();
  process.exit(1);
});