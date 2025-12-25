// Unified Email Service for ZAVIRA Beauty
// Handles all email communications through Supabase edge function

import { supabase } from '@/integrations/supabase/client';

export interface EmailResponse {
  success: boolean;
  message: string;
  data?: {
    messageId?: string;
    subscriberId?: string;
    appointmentId?: string;
  };
  error?: string;
}

export interface NewsletterData {
  email: string;
  name?: string;
  source?: 'website' | 'popup' | 'admin';
}

export interface AppointmentConfirmationData {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName?: string;
}

export interface CancellationData {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface ReceiptData {
  email: string;
  transactionId: string;
  totalAmount: number;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customerName?: string;
}

export interface StaffNotificationData {
  staffEmail: string;
  staffName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  isGroupBooking?: boolean;
  groupName?: string;
}

export interface AppointmentReminderData {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName?: string;
}

export interface StatusChangeNotificationData {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  oldStatus?: string;
  newStatus: string;
  staffName?: string;
}

export class EmailService {
  private static async callBrevoService(action: string, data: any): Promise<EmailResponse> {
    try {
      console.log('📧 Calling Brevo service:', { action, data });

      const { data: result, error } = await supabase.functions.invoke('brevo-service', {
        body: {
          action,
          data
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        return {
          success: false,
          message: 'Failed to send email',
          error: error.message
        };
      }

      if (result.success) {
        console.log('✅ Email sent successfully:', result);
        return {
          success: true,
          message: result.message || 'Email sent successfully',
          data: result.data
        };
      } else {
        console.error('❌ Email service error:', result.error);
        return {
          success: false,
          message: result.message || 'Failed to send email',
          error: result.error
        };
      }
    } catch (error: any) {
      console.error('❌ Email service exception:', error);
      return {
        success: false,
        message: 'An error occurred while sending email',
        error: error.message
      };
    }
  }

  /**
   * Subscribe user to newsletter and send welcome email
   * Stores subscription in Supabase first, then sends email via Brevo (best effort)
   */
  static async subscribeToNewsletter(data: NewsletterData): Promise<EmailResponse> {
    try {
      // Validate email
      if (!data.email || !this.isValidEmail(data.email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.',
          error: 'Invalid email format'
        };
      }

      const email = data.email.toLowerCase().trim();

      // Step 1: Check if already subscribed in Supabase
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        if (existingSubscriber.is_active) {
          return {
            success: false,
            message: 'This email is already subscribed to our newsletter.',
            error: 'Already subscribed'
          };
        } else {
          // Reactivate subscription
          await supabase
            .from('newsletter_subscribers')
            .update({ is_active: true, unsubscribed_at: null })
            .eq('id', existingSubscriber.id);
        }
      } else {
        // Step 2: Store new subscription in Supabase
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: email,
            name: data.name?.trim() || null,
            source: data.source || 'website',
            is_active: true,
            email_sent: false
          });

        if (insertError) {
          console.error('❌ Failed to store subscription:', insertError);
          // Continue anyway to try sending email
        } else {
          console.log('✅ Subscription stored in database:', email);
        }
      }

      // Step 3: Try to send welcome email via Brevo (best effort)
      let emailSent = false;
      try {
        const brevoResult = await this.callBrevoService('addToNewsletter', {
          email: email,
          name: data.name,
          source: data.source || 'website'
        });

        if (brevoResult.success) {
          emailSent = true;
          // Update database to mark email as sent
          await supabase
            .from('newsletter_subscribers')
            .update({ email_sent: true })
            .eq('email', email);
        }
      } catch (brevoError) {
        console.warn('⚠️ Brevo email failed (non-critical):', brevoError);
      }

      return {
        success: true,
        message: emailSent
          ? 'Thank you for subscribing! Check your email for a welcome message.'
          : 'Thank you for subscribing! You\'ll hear from us soon.',
        data: {
          subscriberId: `sub_${Date.now()}`
        }
      };

    } catch (error: any) {
      console.error('❌ Newsletter subscription error:', error);
      return {
        success: false,
        message: 'Something went wrong. Please try again later.',
        error: error.message
      };
    }
  }

  /**
   * Send appointment confirmation email
   */
  static async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendAppointmentConfirmation', {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      serviceName: data.serviceName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      staffName: data.staffName
    });

    return result;
  }

  /**
   * Send appointment cancellation email
   */
  static async sendCancellationEmail(data: CancellationData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendCancellationEmail', {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      serviceName: data.serviceName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime
    });

    return result;
  }

  /**
   * Send receipt email
   */
  static async sendReceiptEmail(data: ReceiptData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendTransactionalEmail', {
      email: data.email,
      subject: `🧾 Receipt - Transaction #${data.transactionId}`,
      templateData: {
        transactionId: data.transactionId,
        totalAmount: data.totalAmount,
        cartItems: data.cartItems,
        customerName: data.customerName
      }
    });

    return result;
  }

  /**
   * Send custom transactional email
   */
  static async sendCustomEmail(email: string, subject: string, templateData: any): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendTransactionalEmail', {
      email,
      subject,
      templateData
    });

    return result;
  }

  /**
   * Send staff notification email when customer books
   */
  static async sendStaffNotification(data: StaffNotificationData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendStaffNotification', {
      staffEmail: data.staffEmail,
      staffName: data.staffName,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      serviceName: data.serviceName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      notes: data.notes,
      isGroupBooking: data.isGroupBooking,
      groupName: data.groupName
    });

    return result;
  }

  /**
   * Send 24-hour appointment reminder
   */
  static async sendAppointmentReminder(data: AppointmentReminderData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendAppointmentReminder', {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      serviceName: data.serviceName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      staffName: data.staffName
    });

    return result;
  }

  /**
   * Send status change notification
   */
  static async sendStatusChangeNotification(data: StatusChangeNotificationData): Promise<EmailResponse> {
    const result = await this.callBrevoService('sendStatusChangeNotification', {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      serviceName: data.serviceName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      staffName: data.staffName
    });

    return result;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Extract email from user or booking data
   */
  static extractEmail(userData: any, fallbackEmail?: string): string | null {
    // Try various email fields
    const email = userData?.email || 
                  userData?.user?.email || 
                  userData?.user_metadata?.email ||
                  userData?.user_metadata?.full_email ||
                  userData?.customerEmail ||
                  fallbackEmail;

    return email && this.isValidEmail(email) ? email : null;
  }

  /**
   * Extract customer name from user or booking data
   */
  static extractCustomerName(userData: any, fallbackName?: string): string | null {
    const name = userData?.name || 
                 userData?.fullName || 
                 userData?.customerName ||
                 userData?.user?.user_metadata?.full_name ||
                 userData?.user?.user_metadata?.first_name ?
                   `${userData.user.user_metadata.first_name} ${userData.user.user_metadata.last_name || ''}`.trim() :
                 userData?.user_metadata?.first_name ||
                 fallbackName;

    return name && name.trim() ? name.trim() : null;
  }
}

export default EmailService;