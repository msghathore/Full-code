// Newsletter service for ZAVIRA beauty website
// SECURITY: API keys must be configured via environment variables

// SECURITY: API key loaded from environment variables only
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL || 'email@zavira.ca';
const SENDER_NAME = 'Zavira Salon and Spa';

export interface NewsletterSubscription {
  id?: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  source: 'website' | 'popup';
  isActive: boolean;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
}

export class NewsletterService {
  private static subscribers: NewsletterSubscription[] = [];

  /**
   * Send ZAVIRA welcome email using Brevo API
   */
  private static async sendWelcomeEmail(email: string, name?: string) {
    try {
      // SECURITY: Only log in development mode, never log sensitive data
      if (import.meta.env.DEV) {
        console.log('Attempting to send email via Brevo');
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

      // Send email using Brevo API (transactional email)
      const emailData = {
        to: [{ email: email, name: name || 'Beauty Enthusiast' }],
        htmlContent: emailHtml,
        subject: '🌟 Welcome to ZAVIRA Beauty Newsletter - Exclusive Beauty Insider',
        sender: { name: SENDER_NAME, email: SENDER_EMAIL }
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Brevo API error:', result);
        return { success: false, error: result.message || 'Email sending failed' };
      }

      console.log('✅ Brevo email sent successfully!', result.messageId);
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Failed to send Brevo email:', error);
      return { success: false, error: error.message };
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

      // Check if email already exists
      const existingSubscriber = this.subscribers.find(
        sub => sub.email.toLowerCase() === email.toLowerCase() && sub.isActive
      );

      if (existingSubscriber) {
        return {
          success: false,
          message: 'This email is already subscribed to our newsletter.'
        };
      }

      // Create new subscriber
      const newSubscriber: NewsletterSubscription = {
        email: email.toLowerCase(),
        name: name?.trim() || undefined,
        subscribedAt: new Date(),
        source,
        isActive: true
      };

      // Add to local storage (in production, this would go to a database)
      this.subscribers.push(newSubscriber);

      console.log('📝 Brevo newsletter subscription attempt:', { email, name, source });

      // Send confirmation email using Brevo
      const emailResult = await this.sendWelcomeEmail(email, name);

      console.log('📧 Brevo email sending result:', emailResult);

      return {
        success: emailResult.success,
        message: emailResult.success 
          ? 'Thank you for subscribing! Check your email for a confirmation.'
          : `Subscription successful! ${emailResult.error || 'Email will be sent when service is available.'}`,
        subscriberId: `brevo_${Date.now()}`
      };

    } catch (error) {
      console.error('Brevo newsletter subscription error:', error);
      return {
        success: false,
        message: 'Something went wrong. Please try again later.'
      };
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   */
  static async unsubscribe(email: string): Promise<NewsletterResponse> {
    try {
      const subscriberIndex = this.subscribers.findIndex(
        sub => sub.email.toLowerCase() === email.toLowerCase()
      );

      if (subscriberIndex === -1) {
        return {
          success: false,
          message: 'Email not found in our newsletter list.'
        };
      }

      this.subscribers[subscriberIndex].isActive = false;

      return {
        success: true,
        message: 'You have been successfully unsubscribed.'
      };

    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
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

  /**
   * Get subscriber count (for testing)
   */
  static getSubscriberCount(): number {
    return this.subscribers.filter(sub => sub.isActive).length;
  }

  /**
   * Get all subscribers (for admin - should be protected in real implementation)
   */
  static getAllSubscribers(): NewsletterSubscription[] {
    return [...this.subscribers];
  }
}

export default NewsletterService;