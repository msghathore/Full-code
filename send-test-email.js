// Send First Test Email using Resend API
// This will send the "Hello World" email as requested

import { Resend } from 'resend';

// Initialize Resend with the API key from environment
const resend = new Resend(process.env.VITE_RESEND_API_KEY || 're_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR');

async function sendTestEmail() {
  console.log('📧 Sending your first email with Resend...\n');
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mandeepghathore0565@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });

    console.log('✅ SUCCESS! Your email was sent successfully!');
    console.log('📊 Email ID:', result.id);
    console.log('📧 Status: Email delivered to mandeepghathore0565@gmail.com');
    console.log('🔗 View details in Resend dashboard: https://resend.com/dashboard');
    
    return true;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('📋 Full error:', error);
    return false;
  }
}

// Simple test with just the basic email
async function runBasicTest() {
  console.log('🚀 Starting Basic Email Test...\n');
  console.log('📧 Target: mandeepghathore0565@gmail.com');
  console.log('🔑 API Key: re_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR');
  console.log('📝 From: onboarding@resend.dev');
  console.log('📋 Subject: Hello World');
  console.log('');
  
  const success = await sendTestEmail();
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Check your email: mandeepghathore0565@gmail.com');
    console.log('🔗 View in Resend dashboard: https://resend.com/dashboard');
  } else {
    console.log('❌ EMAIL FAILED TO SEND');
  }
  console.log('='.repeat(50));
  
  return success;
}

// Execute the test
runBasicTest();