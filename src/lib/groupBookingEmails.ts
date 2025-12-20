// Group Booking Email Templates and Service
import { supabase } from '@/integrations/supabase/client';
import { GroupBooking, GroupMember, GROUP_TYPE_LABELS, GROUP_TYPE_ICONS } from '@/types/groupBooking';
import { format, parseISO } from 'date-fns';

// Email template types
type EmailType =
  | 'group_created'
  | 'group_confirmed'
  | 'member_joined'
  | 'member_reminder'
  | 'group_reminder'
  | 'group_cancelled';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Generate share link
export const getShareLink = (shareCode: string): string => {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://zavirabeauty.com';
  return `${baseUrl}/group-booking/join/${shareCode}`;
};

// Generate confirmation link
export const getConfirmationLink = (shareCode: string): string => {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://zavirabeauty.com';
  return `${baseUrl}/group-booking/confirmation/${shareCode}`;
};

// Email Templates
export const generateGroupCreatedEmail = (booking: GroupBooking): EmailData => {
  const shareLink = getShareLink(booking.share_code);
  const confirmationLink = getConfirmationLink(booking.share_code);
  const formattedDate = format(parseISO(booking.booking_date), 'MMMM d, yyyy');

  return {
    to: booking.lead_email,
    subject: `Your Group Booking at Zavira Beauty - ${booking.group_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; }
          .detail-value { font-weight: 600; }
          .cta-button { display: inline-block; background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
          .cta-button.secondary { background: #6b7280; }
          .share-box { background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #ec4899; }
          .share-link { background: white; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; margin-top: 10px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${GROUP_TYPE_ICONS[booking.group_type]} Group Booking Created!</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.lead_name},</p>
            <p>Your group booking at Zavira Beauty has been created! Here are the details:</p>

            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Group Name</span>
                <span class="detail-value">${booking.group_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value">${GROUP_TYPE_LABELS[booking.group_type]}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${booking.start_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Group Size</span>
                <span class="detail-value">${booking.total_members} people</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Confirmation Code</span>
                <span class="detail-value">${booking.share_code}</span>
              </div>
            </div>

            <div class="share-box">
              <strong>Share this link with your group:</strong>
              <p style="margin: 5px 0; font-size: 14px;">Send this link to your friends so they can join and add their details.</p>
              <div class="share-link">${shareLink}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" class="cta-button">View Booking Details</a>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Share the link above with your group members</li>
              <li>Each member can add their details and select their services</li>
              <li>Pay the 50% deposit to confirm your booking</li>
              <li>Arrive 15 minutes before your appointment</li>
            </ol>

            <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>

            <p>Best regards,<br>The Zavira Beauty Team</p>
          </div>
          <div class="footer">
            <p>Zavira Beauty | (431) 816-3330 | zavirasalonandspa@gmail.com</p>
            <p>This email was sent regarding your group booking.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Group Booking Created!

Hi ${booking.lead_name},

Your group booking at Zavira Beauty has been created!

Details:
- Group Name: ${booking.group_name}
- Type: ${GROUP_TYPE_LABELS[booking.group_type]}
- Date: ${formattedDate}
- Time: ${booking.start_time}
- Group Size: ${booking.total_members} people
- Confirmation Code: ${booking.share_code}

Share this link with your group:
${shareLink}

View your booking details:
${confirmationLink}

Next Steps:
1. Share the link above with your group members
2. Each member can add their details and select their services
3. Pay the 50% deposit to confirm your booking
4. Arrive 15 minutes before your appointment

Best regards,
The Zavira Beauty Team
    `,
  };
};

export const generateGroupConfirmedEmail = (booking: GroupBooking): EmailData => {
  const confirmationLink = getConfirmationLink(booking.share_code);
  const formattedDate = format(parseISO(booking.booking_date), 'MMMM d, yyyy');

  return {
    to: booking.lead_email,
    subject: `Booking Confirmed! ${booking.group_name} at Zavira Beauty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: 600; margin-bottom: 20px; }
          .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="success-badge">Payment Received</span>
            </div>

            <p>Hi ${booking.lead_name},</p>
            <p>Great news! Your group booking has been confirmed. We can't wait to see you and your group!</p>

            <div class="details-box">
              <h3 style="margin-top: 0;">${booking.group_name}</h3>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${booking.start_time}</p>
              <p><strong>Confirmation Code:</strong> ${booking.share_code}</p>
              <p><strong>Amount Paid:</strong> $${booking.deposit_paid?.toFixed(2)}</p>
              <p><strong>Balance Due:</strong> $${booking.balance_due?.toFixed(2)}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" class="cta-button">View Booking Details</a>
            </div>

            <p><strong>Reminders:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your appointment</li>
              <li>Remaining balance is due at your appointment</li>
              <li>Cancellations require 72 hours notice</li>
            </ul>

            <p>See you soon!</p>
            <p>The Zavira Beauty Team</p>
          </div>
          <div class="footer">
            <p>Zavira Beauty | (431) 816-3330 | zavirasalonandspa@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Booking Confirmed!

Hi ${booking.lead_name},

Great news! Your group booking has been confirmed.

${booking.group_name}
Date: ${formattedDate}
Time: ${booking.start_time}
Confirmation Code: ${booking.share_code}
Amount Paid: $${booking.deposit_paid?.toFixed(2)}
Balance Due: $${booking.balance_due?.toFixed(2)}

Reminders:
- Please arrive 15 minutes before your appointment
- Remaining balance is due at your appointment
- Cancellations require 72 hours notice

See you soon!
The Zavira Beauty Team
    `,
  };
};

export const generateMemberJoinedEmail = (booking: GroupBooking, member: GroupMember): EmailData => {
  const confirmationLink = getConfirmationLink(booking.share_code);
  const formattedDate = format(parseISO(booking.booking_date), 'MMMM d, yyyy');

  return {
    to: member.member_email || '',
    subject: `You've joined ${booking.group_name} at Zavira Beauty!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .cta-button { display: inline-block; background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're In!</h1>
          </div>
          <div class="content">
            <p>Hi ${member.member_name},</p>
            <p>You've successfully joined <strong>${booking.group_name}</strong>!</p>

            <div class="details-box">
              <p><strong>Group:</strong> ${booking.group_name}</p>
              <p><strong>Organized by:</strong> ${booking.lead_name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${booking.start_time}</p>
            </div>

            <p>The group organizer will finalize the booking and you'll receive another confirmation when everything is set.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" class="cta-button">View Group Details</a>
            </div>

            <p>See you soon!</p>
            <p>The Zavira Beauty Team</p>
          </div>
          <div class="footer">
            <p>Zavira Beauty | (431) 816-3330 | zavirasalonandspa@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You're In!

Hi ${member.member_name},

You've successfully joined ${booking.group_name}!

Group: ${booking.group_name}
Organized by: ${booking.lead_name}
Date: ${formattedDate}
Time: ${booking.start_time}

The group organizer will finalize the booking and you'll receive another confirmation when everything is set.

See you soon!
The Zavira Beauty Team
    `,
  };
};

// Notify lead when a member joins
export const generateMemberJoinedNotificationEmail = (booking: GroupBooking, member: GroupMember): EmailData => {
  const confirmationLink = getConfirmationLink(booking.share_code);

  return {
    to: booking.lead_email,
    subject: `${member.member_name} joined your group!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f0fdf4; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 1px solid #86efac; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #166534; margin: 0;">New Member Joined!</h2>
          </div>
          <div class="content">
            <p>Hi ${booking.lead_name},</p>
            <p><strong>${member.member_name}</strong> has joined your group booking "${booking.group_name}"!</p>
            <p>Your group now has ${booking.confirmed_members} of ${booking.total_members} members.</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${confirmationLink}" class="cta-button">View Group</a>
            </div>
          </div>
          <div class="footer">
            <p>Zavira Beauty</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Member Joined!

Hi ${booking.lead_name},

${member.member_name} has joined your group booking "${booking.group_name}"!

Your group now has ${booking.confirmed_members} of ${booking.total_members} members.

View your group: ${confirmationLink}

Zavira Beauty
    `,
  };
};

// Send email function (uses Edge Function)
export async function sendGroupBookingEmail(emailType: EmailType, booking: GroupBooking, member?: GroupMember): Promise<boolean> {
  let emailData: EmailData;

  switch (emailType) {
    case 'group_created':
      emailData = generateGroupCreatedEmail(booking);
      break;
    case 'group_confirmed':
      emailData = generateGroupConfirmedEmail(booking);
      break;
    case 'member_joined':
      if (!member || !member.member_email) return false;
      emailData = generateMemberJoinedEmail(booking, member);
      break;
    default:
      console.error('Unknown email type:', emailType);
      return false;
  }

  try {
    // Call the email edge function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', emailType);
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

// Send notifications to lead when member joins
export async function notifyLeadOfNewMember(booking: GroupBooking, member: GroupMember): Promise<boolean> {
  const emailData = generateMemberJoinedNotificationEmail(booking, member);

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      },
    });

    return !error;
  } catch (err) {
    console.error('Failed to notify lead:', err);
    return false;
  }
}
