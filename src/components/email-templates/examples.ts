/**
 * Email Template Usage Examples
 *
 * This file demonstrates how to use the Zavira email template system
 * in various scenarios throughout the application.
 */

import { EmailService } from '@/lib/email-service';

/**
 * Example 1: Send Welcome Email on Customer Registration
 */
export async function exampleWelcomeEmail() {
  // After customer creates account
  const customerEmail = 'john.smith@example.com';
  const customerName = 'John Smith';
  const customerId = 'customer-uuid-from-database';

  const result = await EmailService.sendWelcomeEmail(
    customerEmail,
    customerName,
    customerId
  );

  if (result.success) {
    console.log('✅ Welcome email sent successfully!');
    console.log('Message ID:', result.data?.messageId);
  } else {
    console.error('❌ Failed to send welcome email:', result.error);
  }

  return result;
}

/**
 * Example 2: Send Appointment Confirmation
 */
export async function exampleAppointmentConfirmation() {
  // After customer books an appointment
  const result = await EmailService.sendAppointmentConfirmation({
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
    serviceName: 'Premium Haircut & Style',
    staffName: 'Sarah Johnson',
    appointmentDate: 'January 15, 2025',
    appointmentTime: '2:00 PM',
    duration: 60,
    price: '$75.00',
    notes: 'Please arrive 10 minutes early',
  });

  if (result.success) {
    console.log('✅ Confirmation email sent!');
  }

  return result;
}

/**
 * Example 3: Send Appointment Reminder (24 hours before)
 */
export async function exampleAppointmentReminder() {
  // Typically called by a scheduled job 24 hours before appointment
  const result = await EmailService.sendAppointmentReminder({
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
    serviceName: 'Premium Haircut & Style',
    staffName: 'Sarah Johnson',
    appointmentDate: 'Tomorrow',
    appointmentTime: '2:00 PM',
    duration: 60,
    hoursUntil: 24,
  });

  return result;
}

/**
 * Example 4: Send Abandoned Cart Recovery Email
 */
export async function exampleAbandonedCart() {
  // Send to customers who started booking but didn't complete
  const result = await EmailService.sendAbandonedCartEmail({
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
    serviceName: 'Premium Haircut & Style',
    price: '$75.00',
    selectedDate: 'January 15, 2025',
    selectedTime: '2:00 PM',
    discountCode: 'COMPLETE10', // 10% off discount code
    customerId: 'customer-uuid',
  });

  if (result.success) {
    console.log('✅ Abandoned cart email sent with 10% discount!');
  }

  return result;
}

/**
 * Example 5: Send Referral Invitation
 */
export async function exampleReferralInvitation() {
  // Send after customer completes their first appointment
  const result = await EmailService.sendReferralInvitation({
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
    referralCode: 'JOHN2025', // Unique referral code
    customerDiscount: '$20', // Customer earns $20
    friendDiscount: '$20', // Friend gets $20 off
    customerId: 'customer-uuid',
  });

  if (result.success) {
    console.log('✅ Referral invitation sent!');
  }

  return result;
}

/**
 * Example 6: Track Email Opens and Clicks
 */
export async function exampleEmailTracking() {
  const emailLogId = 'email-log-uuid-from-database';

  // Track when customer opens email
  await EmailService.trackEmailOpen(emailLogId);

  // Track when customer clicks a link
  await EmailService.trackEmailClick(emailLogId);

  console.log('✅ Email engagement tracked');
}

/**
 * Example 7: Get Customer Email History
 */
export async function exampleGetEmailHistory() {
  const customerId = 'customer-uuid';

  const logs = await EmailService.getCustomerEmailLogs(customerId);

  console.log(`Customer has received ${logs.length} emails:`);
  logs.forEach((log) => {
    console.log(`- ${log.email_type} (${log.sent_at})`);
    console.log(`  Opened: ${log.opened_at ? 'Yes' : 'No'}`);
    console.log(`  Clicked: ${log.clicked_at ? 'Yes' : 'No'}`);
  });

  return logs;
}

/**
 * Example 8: Update Email Preferences
 */
export async function exampleUpdatePreferences() {
  const result = await EmailService.updateEmailPreferences({
    customerId: 'customer-uuid',
    email: 'john.smith@example.com',
    subscribedToMarketing: true, // Marketing emails
    subscribedToReminders: true, // Appointment reminders
    subscribedToNewsletters: false, // Newsletters
  });

  if (result) {
    console.log('✅ Email preferences updated');
  }

  return result;
}

/**
 * Example 9: Unsubscribe Customer
 */
export async function exampleUnsubscribe() {
  const email = 'john.smith@example.com';
  const reason = 'Too many emails';

  const result = await EmailService.unsubscribeFromEmails(email, reason);

  if (result) {
    console.log('✅ Customer unsubscribed from all emails');
  }

  return result;
}

/**
 * Example 10: Automated Abandoned Cart Recovery Campaign
 *
 * This would typically run as a scheduled job (cron) every hour
 */
export async function exampleAutomatedAbandonedCartCampaign() {
  // This would be a Supabase Edge Function or cron job
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Query for abandoned bookings
  // (This is pseudo-code - actual implementation would use Supabase client)
  const abandonedBookings = [
    {
      customer_email: 'john@example.com',
      customer_name: 'John Smith',
      service_name: 'Premium Haircut',
      price: '$75.00',
      selected_date: 'January 15, 2025',
      selected_time: '2:00 PM',
      customer_id: 'uuid-1',
    },
    // ... more abandoned bookings
  ];

  console.log(`Found ${abandonedBookings.length} abandoned carts`);

  // Send recovery email to each
  for (const booking of abandonedBookings) {
    const result = await EmailService.sendAbandonedCartEmail({
      customerEmail: booking.customer_email,
      customerName: booking.customer_name,
      serviceName: booking.service_name,
      price: booking.price,
      selectedDate: booking.selected_date,
      selectedTime: booking.selected_time,
      discountCode: 'COMPLETE10',
      customerId: booking.customer_id,
    });

    if (result.success) {
      console.log(`✅ Sent to ${booking.customer_email}`);
    } else {
      console.error(`❌ Failed to send to ${booking.customer_email}`);
    }

    // Rate limit: Wait 100ms between sends
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Example 11: Post-Appointment Referral Campaign
 *
 * Send referral invitation after completed appointments
 */
export async function examplePostAppointmentReferralCampaign() {
  // Query for recently completed appointments
  const completedAppointments = [
    {
      customer_email: 'sarah@example.com',
      customer_name: 'Sarah Wilson',
      customer_id: 'uuid-2',
      referral_code: 'SARAH2025',
    },
    // ... more completed appointments
  ];

  console.log(`Sending referral invites to ${completedAppointments.length} customers`);

  for (const appointment of completedAppointments) {
    const result = await EmailService.sendReferralInvitation({
      customerEmail: appointment.customer_email,
      customerName: appointment.customer_name,
      referralCode: appointment.referral_code,
      customerDiscount: '$20',
      friendDiscount: '$20',
      customerId: appointment.customer_id,
    });

    if (result.success) {
      console.log(`✅ Referral invite sent to ${appointment.customer_email}`);
    }

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Example 12: Integration with Customer Registration Flow
 */
export async function exampleCustomerRegistrationIntegration(
  email: string,
  name: string
) {
  try {
    // Step 1: Create customer in database
    // (Pseudo-code - use actual Supabase client)
    const customer = {
      id: 'new-customer-uuid',
      email: email,
      name: name,
    };

    console.log('✅ Customer created in database');

    // Step 2: Create email preferences
    await EmailService.updateEmailPreferences({
      customerId: customer.id,
      email: customer.email,
      subscribedToMarketing: true,
      subscribedToReminders: true,
      subscribedToNewsletters: true,
    });

    console.log('✅ Email preferences initialized');

    // Step 3: Send welcome email
    const emailResult = await EmailService.sendWelcomeEmail(
      customer.email,
      customer.name,
      customer.id
    );

    if (emailResult.success) {
      console.log('✅ Welcome email sent');
    }

    return {
      success: true,
      customer,
    };
  } catch (error) {
    console.error('❌ Registration flow error:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Example 13: Check Email Engagement Metrics
 */
export async function exampleCheckEngagementMetrics(campaignId: string) {
  // This would use SQL function get_campaign_metrics()
  // (Pseudo-code - actual implementation would use Supabase client)

  console.log(`Campaign Metrics for ${campaignId}:`);
  console.log('- Total Sent: 1,000');
  console.log('- Delivered: 980 (98%)');
  console.log('- Opened: 450 (45.9%)');
  console.log('- Clicked: 120 (26.7%)');

  return {
    totalSent: 1000,
    delivered: 980,
    opened: 450,
    clicked: 120,
    deliveryRate: 98.0,
    openRate: 45.9,
    clickRate: 26.7,
  };
}

// Export all examples
export const emailExamples = {
  welcomeEmail: exampleWelcomeEmail,
  appointmentConfirmation: exampleAppointmentConfirmation,
  appointmentReminder: exampleAppointmentReminder,
  abandonedCart: exampleAbandonedCart,
  referralInvitation: exampleReferralInvitation,
  emailTracking: exampleEmailTracking,
  getEmailHistory: exampleGetEmailHistory,
  updatePreferences: exampleUpdatePreferences,
  unsubscribe: exampleUnsubscribe,
  automatedAbandonedCartCampaign: exampleAutomatedAbandonedCartCampaign,
  postAppointmentReferralCampaign: examplePostAppointmentReferralCampaign,
  customerRegistrationIntegration: exampleCustomerRegistrationIntegration,
  checkEngagementMetrics: exampleCheckEngagementMetrics,
};
