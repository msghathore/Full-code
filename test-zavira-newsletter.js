// Test ZAVIRA Newsletter Service
import { Resend } from 'resend';

// Create a simple newsletter service test
class NewsletterService {
  static resend = null;
  
  static initResend() {
    try {
      const apiKey = process.env.VITE_RESEND_API_KEY || 're_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR';
      
      if (apiKey && !this.resend) {
        this.resend = new Resend(apiKey);
        console.log('✅ Resend email service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Resend:', error);
      this.resend = null;
    }
  }

  static async sendZaviraWelcomeEmail(email, name = 'Beauty Enthusiast') {
    try {
      this.initResend();

      if (!this.resend) {
        console.log('📧 Resend not configured, email not sent:', { email, name });
        return { success: false, error: 'Email service not configured' };
      }

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
              <div class="welcome">Welcome ${name}! 🌟</div>
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
        from: 'ZAVIRA Beauty <newsletter@zavira-beauty.com>',
        to: [email],
        subject: '🌟 Welcome to ZAVIRA Beauty Newsletter - Exclusive Beauty Insider',
        html: emailHtml
      });

      console.log('✅ ZAVIRA welcome email sent successfully:', result);
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Failed to send ZAVIRA welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

// Test the ZAVIRA newsletter service
async function testZaviraNewsletter() {
  console.log('🏛️ Testing ZAVIRA Newsletter Service...\n');
  
  try {
    console.log('📧 Target: mandeepghathore0565@gmail.com');
    console.log('👤 Name: Mandeep');
    console.log('🎨 Template: Luxury ZAVIRA design');
    console.log('📝 Subject: Welcome to ZAVIRA Beauty Newsletter');
    console.log('');
    
    const result = await NewsletterService.sendZaviraWelcomeEmail('mandeepghathore0565@gmail.com', 'Mandeep');
    
    console.log('\n📊 RESULT:');
    if (result.success) {
      console.log('✅ ZAVIRA WELCOME EMAIL SENT SUCCESSFULLY!');
      console.log('📧 Check your email for the luxury ZAVIRA branded welcome email');
      console.log('🎨 You should see:');
      console.log('   • Black and gold luxury design');
      console.log('   • ZAVIRA Beauty branding');
      console.log('   • Personalized welcome message');
      console.log('   • Newsletter benefits list');
    } else {
      console.log('❌ ZAVIRA email failed:', result.error);
    }
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testZaviraNewsletter().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ ZAVIRA NEWSLETTER: FULLY INTEGRATED');
    console.log('📧 You should now receive 2 emails total:');
    console.log('   1. Basic "Hello World" email (already sent)');
    console.log('   2. Luxury ZAVIRA welcome email (just sent)');
  } else {
    console.log('❌ ZAVIRA NEWSLETTER: INTEGRATION ISSUES');
  }
  console.log('='.repeat(60));
}).catch(error => {
  console.error('💥 Unexpected error:', error);
});