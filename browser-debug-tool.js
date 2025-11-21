// Browser Console Debug Tool for Newsletter Form
// Run this in your browser console at http://localhost:5173

console.log('🔍 BROWSER NEWSLETTER DEBUG TOOL');
console.log('=' .repeat(50));

// Test 1: Check if NewsletterService is available
console.log('\n1. Checking NewsletterService availability...');
try {
  if (typeof window !== 'undefined' && window.NewsletterService) {
    console.log('✅ NewsletterService found on window object');
  } else {
    console.log('⚠️ NewsletterService not found on window object');
  }
} catch (error) {
  console.log('❌ Error checking NewsletterService:', error.message);
}

// Test 2: Try to import the service
console.log('\n2. Testing service import...');
try {
  const script = document.createElement('script');
  script.innerHTML = `
    console.log('Testing NewsletterService in browser...');
    console.log('NewsletterService available:', typeof NewsletterService !== 'undefined');
    console.log('NewsletterService methods:', NewsletterService ? Object.getOwnPropertyNames(NewsletterService) : 'undefined');
  `;
  document.head.appendChild(script);
  document.head.removeChild(script);
} catch (error) {
  console.log('❌ Error testing import:', error.message);
}

// Test 3: Test email sending directly
console.log('\n3. Testing direct email send...');
async function testDirectEmail() {
  try {
    // Create a simple test
    const testEmail = 'mandeepghathore0565@gmail.com';
    console.log('📧 Testing with:', testEmail);
    
    // Check if we can access the service
    if (typeof NewsletterService === 'undefined') {
      console.log('❌ NewsletterService not available in browser');
      console.log('🔧 SOLUTION: The service needs to be imported in the browser context');
      return false;
    }
    
    const result = await NewsletterService.subscribe(testEmail, 'Debug Test', 'browser');
    console.log('📝 Result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS! Check your email for confirmation');
    } else {
      console.log('❌ FAILED:', result.message);
    }
    
    return result.success;
    
  } catch (error) {
    console.log('❌ Error testing email:', error.message);
    return false;
  }
}

// Test 4: Form submission test
console.log('\n4. Testing form interaction...');
function testFormSubmission() {
  try {
    const form = document.querySelector('form[role="form"]');
    if (form) {
      console.log('✅ Newsletter form found');
      console.log('📝 Form action:', form.action || 'No action');
      console.log('📝 Form method:', form.method || 'No method');
      
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput) {
        console.log('✅ Email input found');
        console.log('📝 Input value:', emailInput.value);
      } else {
        console.log('❌ Email input not found');
      }
      
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        console.log('✅ Submit button found');
        console.log('📝 Button text:', submitButton.textContent);
      } else {
        console.log('❌ Submit button not found');
      }
    } else {
      console.log('❌ Newsletter form not found');
    }
  } catch (error) {
    console.log('❌ Error testing form:', error.message);
  }
}

// Test 5: Network monitoring
console.log('\n5. Setting up network monitoring...');
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Network request:', args[0], args[1]);
  return originalFetch.apply(this, args);
};

// Run all tests
console.log('\n🚀 Running all tests...');
testFormSubmission();

console.log('\n💡 MANUAL TESTS TO RUN:');
console.log('1. Open browser console (F12)');
console.log('2. Go to http://localhost:5173');
console.log('3. Scroll to "Stay Informed" section');
console.log('4. Copy and paste this entire script into console');
console.log('5. Check for any red error messages');
console.log('6. Try entering email and submitting the form');
console.log('7. Look for network requests in console');

console.log('\n🔍 DEBUG SUMMARY:');
console.log('• If NewsletterService is undefined: Import issue');
console.log('• If form not found: Page not loaded correctly');
console.log('• If network requests show: Form is trying to submit');
console.log('• If no network requests: Form handler not working');