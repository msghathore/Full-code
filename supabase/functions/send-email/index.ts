/**
 * Supabase Edge Function: Send Email
 *
 * Sends automated email campaigns using React Email templates
 * Supports: Resend API for email delivery
 *
 * Usage:
 * POST /send-email
 * {
 *   "email_type": "welcome",
 *   "to": "customer@example.com",
 *   "data": { "customerName": "John" }
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FROM_EMAIL = 'Zavira Salon & Spa <hello@zavira.ca>';

// Email template configurations
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Zavira Salon & Spa!',
    component: 'WelcomeEmail',
  },
  appointment_confirmation: {
    subject: 'Your Appointment is Confirmed',
    component: 'AppointmentConfirmation',
  },
  appointment_reminder: {
    subject: 'Reminder: Your Appointment is Coming Up',
    component: 'AppointmentReminder',
  },
  abandoned_cart: {
    subject: 'Complete Your Booking & Save!',
    component: 'AbandonedCartEmail',
  },
  referral_invitation: {
    subject: 'Share Zavira & Earn Rewards',
    component: 'ReferralInvitation',
  },
};

interface EmailRequest {
  email_type: keyof typeof EMAIL_TEMPLATES;
  to: string;
  to_name?: string;
  subject?: string; // Override default subject
  data: Record<string, any>;
  campaign_id?: string;
  customer_id?: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request
    const {
      email_type,
      to,
      to_name,
      subject: customSubject,
      data,
      campaign_id,
      customer_id,
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!email_type || !to || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: email_type, to, data',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if email type exists
    const templateConfig = EMAIL_TEMPLATES[email_type];
    if (!templateConfig) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid email_type: ${email_type}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check email preferences (skip for transactional emails)
    const transactionalTypes = ['appointment_confirmation', 'appointment_reminder'];
    if (!transactionalTypes.includes(email_type)) {
      const { data: preferences } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('email', to)
        .single();

      if (preferences) {
        // Check subscription status based on email type
        if (email_type === 'abandoned_cart' && !preferences.subscribed_to_marketing) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Customer unsubscribed from marketing emails',
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    // Get email HTML from template
    const emailHtml = await renderEmailTemplate(email_type, data);

    // Get subject line
    const subject = customSubject || templateConfig.subject;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    // Log email send to database
    const emailLog = {
      customer_id: customer_id || null,
      recipient_email: to,
      recipient_name: to_name || data.customerName || null,
      email_type,
      subject,
      template_data: data,
      provider_message_id: resendData.id || null,
      provider_status: resendResponse.ok ? 'sent' : 'failed',
      provider_error: resendResponse.ok ? null : JSON.stringify(resendData),
      campaign_id: campaign_id || null,
      sent_at: new Date().toISOString(),
      delivered_at: resendResponse.ok ? new Date().toISOString() : null,
    };

    await supabase.from('email_logs').insert(emailLog);

    // Update campaign metrics if campaign_id provided
    if (campaign_id) {
      await supabase.rpc('increment', {
        table_name: 'email_campaigns',
        column_name: 'total_sent',
        row_id: campaign_id,
      });

      if (resendResponse.ok) {
        await supabase.rpc('increment', {
          table_name: 'email_campaigns',
          column_name: 'total_delivered',
          row_id: campaign_id,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: resendResponse.ok,
        message_id: resendData.id,
        data: resendData,
      }),
      {
        status: resendResponse.ok ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Render email template to HTML
 */
async function renderEmailTemplate(
  templateType: string,
  data: Record<string, any>
): Promise<string> {
  // For now, return simple HTML templates
  // In production, you would import React Email templates and render them
  // This requires a build step to compile React components

  const templates: Record<string, (data: any) => string> = {
    welcome: (d) => getWelcomeEmailHtml(d),
    appointment_confirmation: (d) => getAppointmentConfirmationHtml(d),
    appointment_reminder: (d) => getAppointmentReminderHtml(d),
    abandoned_cart: (d) => getAbandonedCartHtml(d),
    referral_invitation: (d) => getReferralInvitationHtml(d),
  };

  const templateFn = templates[templateType];
  if (!templateFn) {
    throw new Error(`Template not found: ${templateType}`);
  }

  return templateFn(data);
}

// Simple HTML templates (matching React Email designs)
function getWelcomeEmailHtml(data: any): string {
  const { customerName = 'Valued Customer', customerEmail = '' } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255,255,255,0.8);">ZAVIRA</h1>
      <p style="color: #ffffff; font-size: 14px; margin: 5px 0 0; letter-spacing: 1px;">Salon & Spa</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
      <h2 style="color: #000000; font-size: 28px; text-align: center; margin: 0 0 30px;">Welcome to Zavira!</h2>

      <p style="color: #333333; font-size: 16px; line-height: 26px;">Hi ${customerName},</p>

      <p style="color: #333333; font-size: 16px; line-height: 26px;">
        Thank you for choosing Zavira Salon & Spa! We're thrilled to have you join our community.
      </p>

      <p style="color: #333333; font-size: 16px; line-height: 26px;">
        Your account has been created with: <strong>${customerEmail}</strong>
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="https://zavira.ca/booking" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 5px;">Book Your First Appointment</a>
      </div>

      <p style="color: #333333; font-size: 16px; line-height: 26px; margin-top: 32px;">
        Welcome aboard!<br>
        <strong>The Zavira Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f6f9fc; padding: 30px; border-top: 1px solid #e6e6e6; text-align: center;">
      <p style="color: #666666; font-size: 12px; margin: 8px 0;">
        Zavira Salon & Spa<br>
        283 Tache Avenue, Winnipeg, MB<br>
        (431) 816-3330
      </p>
      <p style="color: #666666; font-size: 12px; margin: 8px 0;">
        <a href="https://zavira.ca/unsubscribe" style="color: #666666;">Unsubscribe</a> •
        <a href="https://zavira.ca" style="color: #666666;">Visit Website</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getAppointmentConfirmationHtml(data: any): string {
  const {
    customerName = 'Valued Customer',
    serviceName = 'Service',
    staffName = 'Our Team',
    appointmentDate = 'TBD',
    appointmentTime = 'TBD',
    duration = 60,
    price = '$0.00',
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 36px; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.8);">ZAVIRA</h1>
      <p style="color: #ffffff; font-size: 14px; margin: 5px 0 0;">Salon & Spa</p>
    </div>

    <div style="padding: 40px;">
      <h2 style="color: #10b981; font-size: 28px; text-align: center;">Appointment Confirmed! ✓</h2>

      <p style="color: #333; font-size: 16px;">Hi ${customerName},</p>
      <p style="color: #333; font-size: 16px;">Your appointment is confirmed!</p>

      <div style="background: #f9fafb; border: 2px solid #10b981; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <table style="width: 100%;">
          <tr><td style="color: #666; padding: 8px 0;">Service:</td><td style="color: #000; font-weight: 500;">${serviceName}</td></tr>
          <tr><td style="color: #666; padding: 8px 0;">Staff:</td><td style="color: #000; font-weight: 500;">${staffName}</td></tr>
          <tr><td style="color: #666; padding: 8px 0;">Date:</td><td style="color: #000; font-weight: 500;">${appointmentDate}</td></tr>
          <tr><td style="color: #666; padding: 8px 0;">Time:</td><td style="color: #000; font-weight: 500;">${appointmentTime}</td></tr>
          <tr><td style="color: #666; padding: 8px 0;">Duration:</td><td style="color: #000; font-weight: 500;">${duration} min</td></tr>
          <tr><td style="color: #666; padding: 8px 0;">Price:</td><td style="color: #000; font-weight: 700;">${price}</td></tr>
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://zavira.ca/staff/calendar" style="display: inline-block; background: #10b981; color: #fff; padding: 14px 32px; border-radius: 5px; text-decoration: none;">View Appointment</a>
      </div>

      <p style="color: #333; margin-top: 32px;">See you soon!<br><strong>The Zavira Team</strong></p>
    </div>

    <div style="background: #f6f9fc; padding: 30px; border-top: 1px solid #e6e6e6; text-align: center;">
      <p style="color: #666; font-size: 12px;">Zavira Salon & Spa • 283 Tache Avenue, Winnipeg, MB</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getAppointmentReminderHtml(data: any): string {
  const {
    customerName = 'Valued Customer',
    serviceName = 'Service',
    appointmentDate = 'Tomorrow',
    appointmentTime = 'TBD',
    hoursUntil = 24,
  } = data;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #000; padding: 30px; text-align: center;">
      <h1 style="color: #fff; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.8);">ZAVIRA</h1>
    </div>
    <div style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: #10b981; color: #fff; border-radius: 50%; width: 140px; height: 140px; padding: 30px 20px;">
          <div style="font-size: 48px; font-weight: 700;">${hoursUntil}</div>
          <div style="font-size: 14px;">hours until<br>your appointment</div>
        </div>
      </div>
      <h2 style="text-align: center;">Appointment Reminder</h2>
      <p>Hi ${customerName},</p>
      <p>Your appointment is coming up soon!</p>
      <div style="background: #f9fafb; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://zavira.ca/staff/calendar" style="background: #10b981; color: #fff; padding: 14px 32px; border-radius: 5px; text-decoration: none; display: inline-block;">View Details</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getAbandonedCartHtml(data: any): string {
  const { customerName = 'Valued Customer', serviceName = 'Service', price = '$0.00' } = data;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f6f9fc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #000; padding: 30px; text-align: center;">
      <h1 style="color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.8);">ZAVIRA</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="text-align: center;">Your Booking is Waiting! ⏰</h2>
      <p>Hi ${customerName},</p>
      <p>We noticed you started booking but didn't finish.</p>
      <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <h3 style="margin: 0;">${serviceName}</h3>
        <p style="color: #10b981; font-size: 28px; font-weight: 700; margin: 12px 0;">${price}</p>
      </div>
      <div style="background: #10b981; color: #fff; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-size: 20px; font-weight: 700; margin: 0;">🎁 SPECIAL OFFER!</p>
        <p>Complete your booking in 24 hours for 10% OFF</p>
        <div style="background: #fff; color: #10b981; border-radius: 6px; padding: 16px; margin: 12px auto; max-width: 280px;">
          <p style="margin: 0; font-size: 12px; color: #666;">Use code:</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px;">COMPLETE10</p>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://zavira.ca/booking" style="background: #10b981; color: #fff; padding: 16px 40px; border-radius: 5px; text-decoration: none; display: inline-block; font-size: 18px;">Complete Your Booking</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getReferralInvitationHtml(data: any): string {
  const {
    customerName = 'Valued Customer',
    referralCode = 'ZAVIRA2025',
    customerDiscount = '$20',
    friendDiscount = '$20',
  } = data;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f6f9fc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #000; padding: 30px; text-align: center;">
      <h1 style="color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.8);">ZAVIRA</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="text-align: center;">Share the Beauty, Earn Rewards! 💎</h2>
      <p>Hi ${customerName},</p>
      <p>Share Zavira with friends and earn rewards!</p>
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
        <p style="color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 24px;">🎁 YOUR REFERRAL REWARDS</p>
        <div style="display: flex; justify-content: center; gap: 20px; margin: 24px 0;">
          <div style="flex: 1; max-width: 180px;">
            <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
            <div style="color: #fff; font-size: 36px; font-weight: 700;">${friendDiscount}</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 14px;">Your friend gets</div>
          </div>
          <div style="color: #fff; font-size: 32px; padding: 0 10px;">+</div>
          <div style="flex: 1; max-width: 180px;">
            <div style="font-size: 48px; margin-bottom: 12px;">⭐</div>
            <div style="color: #fff; font-size: 36px; font-weight: 700;">${customerDiscount}</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 14px;">You earn</div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">YOUR UNIQUE REFERRAL CODE</p>
        <div style="background: #f9fafb; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; margin: 12px auto; max-width: 300px;">
          <p style="color: #10b981; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 4px;">${referralCode}</p>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://zavira.ca/referral/${referralCode}" style="background: #10b981; color: #fff; padding: 16px 40px; border-radius: 5px; text-decoration: none; display: inline-block; font-size: 18px;">Share Your Link</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
