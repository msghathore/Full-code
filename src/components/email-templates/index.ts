/**
 * Email Templates for Zavira Salon & Spa
 *
 * All templates use React Email components for cross-client compatibility.
 * Each template follows Zavira branding: Black/White/Emerald colors.
 *
 * Usage:
 * import { WelcomeEmail } from '@/components/email-templates';
 * const html = render(<WelcomeEmail customerName="John" />);
 */

export { WelcomeEmail } from './WelcomeEmail';
export { AppointmentConfirmation } from './AppointmentConfirmation';
export { AppointmentReminder } from './AppointmentReminder';
export { AbandonedCartEmail } from './AbandonedCartEmail';
export { ReferralInvitation } from './ReferralInvitation';

// Email template types
export type EmailTemplateType =
  | 'welcome'
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'abandoned_cart'
  | 'referral_invitation';

// Email template props interface
export interface EmailTemplateProps {
  to: string;
  subject: string;
  templateType: EmailTemplateType;
  data: Record<string, any>;
}
