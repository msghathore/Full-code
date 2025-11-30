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
   */
  static async subscribeToNewsletter(data: NewsletterData): Promise<EmailResponse> {
    const result = await this.callBrevoService('addToNewsletter', {
      email: data.email,
      name: data.name,
      source: data.source || 'website'
    });

    return result;
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