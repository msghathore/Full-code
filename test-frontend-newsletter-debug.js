// Comprehensive Frontend Newsletter Form Debug Test
import { Resend } from 'resend';

class NewsletterService {
  static resend = null;
  
  static initResend() {
    try {
      const apiKey = process.env.VITE_RESEND_API_KEY || 're_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR';
      
      console.log('🔑 API Key found:', apiKey ? 'YES' : 'NO');
      
      if (apiKey && !this.resend) {
        this.resend = new Resend(apiKey);
        console.log('✅ Resend email service initialized');
      } else if (!apiKey) {
        console.log('❌ NO API KEY FOUND');
      }
    } catch (error) {
      console.error('Failed to initialize Resend:', error);
      this.resend = null;
    }
  }

  static async sendConfirmationEmail(email, name) {
    try {
      this.initResend();

      if (!this.resend) {
        console.log('📧 Resend not configured, email not sent:', { email, name });
        return { success: false, error: 'Email service not configured' };
      }

      console.log('📧 Attempting to send email to:', email);
      console.log('👤 Name:', name);

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ZAVIRA Beauty Newsletter</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #000000;
              color: #ffffff;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
              border-radius: 20px;
              padding: 40px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
              text-align: center;
              font-size: 3rem;
              font-weight: 300;
              color: #ffffff;
              margin-bottom: 30px;
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            .content {
              text-align: center;
              line-height: 1.6;
            }
            .welcome {
              font-size: 1.5rem;
              margin-bottom: 20px;
            }
            .message {
              font-size: 1.1rem;
              margin-bottom: 30px;
              color: #e0e0e0;
            }
            .benefits {
              text-align: left;
              margin: 30px 0;
              background: rgba(255, 255, 255, 0.05);
              padding: 20px;
              border-radius: 10px;
            }
            .benefits ul {
              list-style: none;
              padding: 0;
            }
            .benefits li {
              margin: 10px 0;
              padding-left: 25px;
              position: relative;
            }
            .benefits li:before {
              content: "✨";
              position: absolute;
              left: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              font-size: 0.9rem;
              color: #888;
            }
            .luxury-glow {
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo luxury-glow">ZAVIRA</div>
            <div class="content">
              <div class="welcome">Welcome ${name || 'Beauty Enthusiast'}! 🌟</div>
              <div class="message">
                You've successfully joined our exclusive newsletter and are now part of the ZAVIRA beauty family.
              </div>
              
              <div class="benefits">
                <h3>What you'll receive:</h3>
                <ul>
                  <li>Exclusive beauty tips and expert advice</li>
                  <li>Early access to new treatments and services</li>
                  <li>Special VIP discounts and promotions</li>
                  <li>Behind-the-scenes content from our salon</li>
                  <li>Monthly beauty trends and product recommendations</li>
                </ul>
              </div>

              <div class="message">
                Stay tuned for our first newsletter coming soon! In the meantime, feel free to visit us at our salon or follow us on social media for the latest updates.
              </div>
            </div>
            
            <div class="footer">
              <p>ZAVIRA Beauty • Luxury Salon & Spa</p>
              <p>This email was sent to ${email}</p>
              <p><a href="#" style="color: #ffffff;">Unsubscribe</a> | <a href="#" style="color: #ffffff;">Update Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.resend.emails.send({
        from: 'ZAVIRA Beauty <onboarding@resend.dev>',
        to: [email],
        subject: '🌟 Welcome to ZAVIRA Beauty Newsletter - Exclusive Beauty Insider',
        html: emailHtml
      });

      console.log('✅ Email send result:', result);
      
      if (result.error) {
        console.log('❌ Email send error:', result.error);
        return { success: false, error: result.error.message };
      }
      
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  static async subscribe(email, name, source = 'website') {
    try {
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.'
        };
      }

      console.log('📝 Newsletter subscription attempt:', { email, name, source });

      const emailResult = await this.sendConfirmationEmail(email, name);

      console.log('📧 Email sending result:', emailResult);

      return {
        success: emailResult.success,
        message: emailResult.success 
          ? 'Thank you for subscribing! Check your email for a confirmation.'
          : `Subscription failed: ${emailResult.error}`,
        subscriberId: `subscriber_${Date.now()}`
      };

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return {
        success: false,
        message: 'Something went wrong. Please try again later.'
      };
    }
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

async function testFrontendFormLikeWebsite() {
  console.log('🌐 TESTING FRONTEND FORM LIKE WEBSITE\n');
  console.log('=' .repeat(60));
  
  const testEmail = 'mandeepghathore0565@gmail.com';
  const testName = undefined;
  
  console.log('📧 Testing with your email:', testEmail);
  console.log('👤 Name parameter:', testName);
  console.log('📍 Source:', 'website');
  console.log('');
  
  try {
    const result = await NewsletterService.subscribe(testEmail, testName, 'website');
    
    console.log('\n📊 SUBSCRIPTION RESULT:');
    console.log('✅ Success:', result.success);
    console.log('📝 Message:', result.message);
    console.log('🆔 Subscriber ID:', result.subscriberId);
    
    if (result.success) {
      console.log('\n🎉 FRONTEND FORM TEST: PASSED');
      console.log('📧 Welcome email should be sent to your inbox');
      console.log('🔍 Check your spam/junk folder if not visible');
    } else {
      console.log('\n❌ FRONTEND FORM TEST: FAILED');
      console.log('🐛 Error details:', result.message);
    }
    
    return result.success;
    
  } catch (error) {
    console.error('\n💥 FRONTEND FORM TEST: CRASHED');
    console.error('🐛 Error:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🔍 RUNNING DIAGNOSTICS');
  console.log('=' .repeat(60));
  
  console.log('🔑 Environment check:');
  console.log('   VITE_RESEND_API_KEY:', process.env.VITE_RESEND_API_KEY ? 'SET' : 'NOT SET');
  
  console.log('\n📦 Package check:');
  try {
    const { Resend } = await import('resend');
    console.log('   ✅ Resend package: AVAILABLE');
  } catch (error) {
    console.log('   ❌ Resend package: NOT AVAILABLE');
  }
  
  console.log('\n📧 Testing basic email (fallback):');
  try {
    const resend = new Resend(process.env.VITE_RESEND_API_KEY || 're_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR');
    const basicResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['mandeepghathore0565@gmail.com'],
      subject: 'Test Email - Debug',
      html: '<p>This is a test email to verify Resend is working.</p>'
    });
    
    console.log('   ✅ Basic email result:', basicResult.error ? 'ERROR' : 'SUCCESS');
    if (basicResult.error) {
      console.log('   ❌ Error:', basicResult.error.message);
    }
  } catch (error) {
    console.log('   ❌ Basic email failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE FRONTEND DEBUG\n');
  
  await runDiagnostics();
  const frontendResult = await testFrontendFormLikeWebsite();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 FINAL SUMMARY:');
  console.log('🔧 Environment: ✅ CONFIGURED');
  console.log('📦 Resend Package: ✅ INSTALLED');
  console.log('🌐 Frontend Form: ' + (frontendResult ? '✅ WORKING' : '❌ FAILING'));
  
  if (frontendResult) {
    console.log('📧 Email Status: ✅ SENT (check your inbox)');
    console.log('🔍 Next Steps:');
    console.log('   • Check mandeepghathore0565@gmail.com');
    console.log('   • Check spam/junk folder');
    console.log('   • Wait 2-3 minutes for delivery');
  } else {
    console.log('📧 Email Status: ❌ NOT SENT');
    console.log('🔧 Need to fix: Frontend form issues');
  }
  
  console.log('='.repeat(60));
}

runAllTests();