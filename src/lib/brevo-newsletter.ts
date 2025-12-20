// Brevo Newsletter Service - 9,000 Free Emails/Month!
// SECURITY: API keys must be configured via environment variables

import { TransactionalEmailsApi, SendSmtpEmail, SendSmtpEmailSender } from '@sendinblue/client';
import { secureLog } from './secureLogger';

export interface NewsletterResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
}

// Replace with your sender email (from Brevo dashboard)
const SENDER_EMAIL = 'your-email@example.com'; // Update this with your sender
const SENDER_NAME = 'ZAVIRA Beauty';

export class BrevoNewsletterService {
  private static transactionalApi: TransactionalEmailsApi | null = null;
  private static apiKey: string = '';

  /**
   * Initialize Brevo client
   */
  private static initClient() {
    try {
      // SECURITY: API key must come from environment variables only
      this.apiKey = import.meta.env.VITE_BREVO_API_KEY || '';

      if (!this.apiKey) {
        console.warn('Brevo API key not configured in environment variables');
        return;
      }

      if (!this.transactionalApi) {
        this.transactionalApi = new TransactionalEmailsApi();
        this.transactionalApi.apiClient.setApiKey(this.apiKey);
        // SECURITY: Don't log initialization in production
        if (import.meta.env.DEV) {
          console.log('Brevo email service initialized');
        }
      }
    } catch (error) {
      secureLog.error('Failed to initialize Brevo:', error);
      this.transactionalApi = null;
    }
  }

  /**
   * Send ZAVIRA welcome email using Brevo
   */
  private static async sendWelcomeEmail(email: string, name?: string) {
    try {
      this.initClient();

      if (!this.transactionalApi) {
        secureLog.warn('Brevo not configured, email not sent');
        return { success: false, error: 'Email service not configured' };
      }

      // SECURITY: Only log in development mode, never log sensitive data
      if (import.meta.env.DEV) {
        console.log('Attempting to send email');
      }

      // Create luxury ZAVIRA email template
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
              line-height: 1.6;
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

      // Create sender
      const sender: SendSmtpEmailSender = {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      };

      // Create email data
      const emailData: SendSmtpEmail = {
        to: [{ email: email, name: name || 'Beauty Enthusiast' }],
        htmlContent: emailHtml,
        subject: '🌟 Welcome to ZAVIRA Beauty Newsletter - Exclusive Beauty Insider',
        sender: sender
      };

      // Send email
      const result = await this.transactionalApi.sendTransacEmail(emailData);
      
      // SECURITY: Don't log results in production
      if (import.meta.env.DEV) {
        console.log('Email sent successfully');
      }
      
      return { success: true, result };
      
    } catch (error) {
      secureLog.error('Failed to send Brevo confirmation email:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Subscribe an email to the newsletter
   */
  static async subscribe(email: string, name?: string, source: 'website' | 'popup' = 'website'): Promise<NewsletterResponse> {
    try {
      // Basic email validation
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.'
        };
      }

      secureLog.debug('Newsletter subscription attempt');

      // Send real confirmation email using Brevo
      const emailResult = await this.sendWelcomeEmail(email, name);

      secureLog.debug('Email sending completed');

      return {
        success: emailResult.success,
        message: emailResult.success 
          ? 'Thank you for subscribing! Check your email for a confirmation.'
          : `Subscription failed: ${emailResult.error}`,
        subscriberId: `brevo_${Date.now()}`
      };

    } catch (error) {
      secureLog.error('Newsletter subscription error:', error);
      return {
        success: false,
        message: 'Something went wrong. Please try again later.'
      };
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default BrevoNewsletterService;