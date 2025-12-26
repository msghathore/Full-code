# Zavira Email Template System

Automated email campaign system using React Email templates and Supabase Edge Functions.

## Overview

This system provides 5 professional email templates for automated customer engagement:

1. **Welcome Email** - Sent when customers create an account
2. **Appointment Confirmation** - Sent when appointment is booked
3. **Appointment Reminder** - Sent 24 hours before appointment
4. **Abandoned Cart** - Recovery email with discount code
5. **Referral Invitation** - Invite customers to refer friends

## Email Templates

All templates are located in `src/components/email-templates/` and built with React Email components.

### Template Features

- **Zavira Branding**: Black/White/Emerald color scheme
- **Mobile Responsive**: Optimized for all devices
- **Professional Design**: Clean, modern layouts
- **Personalization**: Dynamic customer data
- **CTA Buttons**: Clear call-to-action links
- **Unsubscribe Links**: GDPR compliant

### Template Usage

```typescript
import { WelcomeEmail } from '@/components/email-templates';
import { render } from '@react-email/render';

// Render to HTML
const html = render(
  <WelcomeEmail
    customerName="John Smith"
    customerEmail="john@example.com"
  />
);
```

## Supabase Edge Function

The `send-email` Edge Function handles all email delivery via Resend API.

### Endpoint

```
POST /functions/v1/send-email
```

### Request Format

```json
{
  "email_type": "welcome",
  "to": "customer@example.com",
  "to_name": "John Smith",
  "data": {
    "customerName": "John Smith",
    "customerEmail": "customer@example.com"
  },
  "customer_id": "uuid-here",
  "campaign_id": "optional-campaign-id"
}
```

### Email Types

| Type | Template | Use Case |
|------|----------|----------|
| `welcome` | WelcomeEmail | New customer registration |
| `appointment_confirmation` | AppointmentConfirmation | Booking confirmed |
| `appointment_reminder` | AppointmentReminder | 24h before appointment |
| `abandoned_cart` | AbandonedCartEmail | Incomplete booking recovery |
| `referral_invitation` | ReferralInvitation | Referral program invite |

## Frontend Service

Use the `EmailService` class from `src/lib/email-service.ts` to send emails.

### Send Welcome Email

```typescript
import { EmailService } from '@/lib/email-service';

const result = await EmailService.sendWelcomeEmail(
  'customer@example.com',
  'John Smith',
  'customer-uuid'
);

if (result.success) {
  console.log('Welcome email sent!');
}
```

### Send Abandoned Cart Email

```typescript
const result = await EmailService.sendAbandonedCartEmail({
  customerEmail: 'customer@example.com',
  customerName: 'John Smith',
  serviceName: 'Premium Haircut',
  price: '$75.00',
  selectedDate: 'January 15, 2025',
  selectedTime: '2:00 PM',
  discountCode: 'COMPLETE10',
  customerId: 'customer-uuid',
});
```

### Send Referral Invitation

```typescript
const result = await EmailService.sendReferralInvitation({
  customerEmail: 'customer@example.com',
  customerName: 'John Smith',
  referralCode: 'ZAVIRA2025',
  customerDiscount: '$20',
  friendDiscount: '$20',
  customerId: 'customer-uuid',
});
```

## Database Schema

### `email_logs` Table

Tracks all email sends and engagement metrics.

**Columns:**
- `id` - UUID primary key
- `customer_id` - Reference to customers table
- `recipient_email` - Email address
- `email_type` - Type of email sent
- `subject` - Email subject line
- `template_data` - JSON data used in template
- `sent_at` - Timestamp when sent
- `delivered_at` - When delivered (from provider)
- `opened_at` - When customer opened email
- `clicked_at` - When customer clicked link
- `open_count` - Number of times opened
- `click_count` - Number of times clicked
- `provider_message_id` - ID from Resend
- `campaign_id` - Optional campaign tracking

### `email_campaigns` Table

Manages email marketing campaigns.

**Columns:**
- `id` - UUID primary key
- `name` - Campaign name
- `email_type` - Template type
- `subject_line` - Email subject
- `status` - draft/scheduled/sending/sent/cancelled
- `scheduled_at` - When to send
- `total_sent`, `total_delivered`, `total_opened`, `total_clicked` - Metrics

### `email_preferences` Table

Customer email subscription preferences.

**Columns:**
- `id` - UUID primary key
- `customer_id` - Reference to customers
- `email` - Email address (unique)
- `subscribed_to_marketing` - Marketing emails opt-in
- `subscribed_to_reminders` - Reminder emails opt-in
- `subscribed_to_newsletters` - Newsletter opt-in
- `unsubscribed_at` - When unsubscribed
- `unsubscribe_reason` - Why they unsubscribed

## Email Tracking

### Track Opens

```typescript
import { EmailService } from '@/lib/email-service';

await EmailService.trackEmailOpen('email-log-uuid');
```

### Track Clicks

```typescript
await EmailService.trackEmailClick('email-log-uuid');
```

### Get Customer Email History

```typescript
const logs = await EmailService.getCustomerEmailLogs('customer-uuid');
console.log(logs); // Array of email logs
```

## Email Preferences

### Update Preferences

```typescript
await EmailService.updateEmailPreferences({
  customerId: 'customer-uuid',
  email: 'customer@example.com',
  subscribedToMarketing: true,
  subscribedToReminders: true,
  subscribedToNewsletters: false,
});
```

### Unsubscribe

```typescript
await EmailService.unsubscribeFromEmails(
  'customer@example.com',
  'Too many emails'
);
```

## Environment Variables

Add these to your `.env` file:

```env
# Resend API (for email delivery)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Supabase (already configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxx
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-email @react-email/components @react-email/render
```

### 2. Apply Database Migration

```bash
# Apply the email_logs migration
npx supabase db push
```

Or manually run the migration:

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/20251226_email_logs.sql
```

### 3. Deploy Edge Function

```bash
# Deploy the send-email function
npx supabase functions deploy send-email

# Set environment variables
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 4. Get Resend API Key

1. Sign up at https://resend.com
2. Verify your domain (zavira.ca)
3. Get API key from dashboard
4. Set as Supabase secret

### 5. Configure DNS (for zavira.ca)

Add these DNS records to verify domain with Resend:

```
TXT  @  resend-verification=xxxxxxxxxxxxx
```

## Testing Emails

### Test Welcome Email

```typescript
const result = await EmailService.sendWelcomeEmail(
  'test@zavira.ca',
  'Test Customer'
);

console.log(result);
```

### Preview Templates Locally

```bash
# Install React Email dev server
npm install -D @react-email/dev

# Add to package.json scripts:
"email:dev": "email dev"

# Run preview server
npm run email:dev
```

Visit http://localhost:3000 to preview templates.

## Campaign Analytics

### Get Campaign Metrics

```sql
SELECT * FROM get_campaign_metrics('campaign-uuid');
```

Returns:
- `total_sent` - Total emails sent
- `total_delivered` - Successfully delivered
- `total_opened` - Opened by recipients
- `total_clicked` - Clicked links
- `delivery_rate` - Percentage delivered
- `open_rate` - Percentage opened
- `click_rate` - Click-through rate

### Check Subscription Status

```sql
SELECT is_subscribed_to_emails('customer@example.com', 'marketing');
```

## Best Practices

1. **Always check preferences** before sending marketing emails
2. **Transactional emails** (confirmations, reminders) bypass preferences
3. **Track engagement** to improve email performance
4. **Test templates** before deploying to production
5. **Respect unsubscribes** - never re-subscribe automatically
6. **Monitor bounce rates** - clean your email list regularly
7. **A/B test** subject lines and CTAs
8. **Personalize** with customer data when possible

## Automation Ideas

### Welcome Email on Signup

```typescript
// In customer registration handler
const { data: customer } = await supabase
  .from('customers')
  .insert({ email, name })
  .select()
  .single();

// Send welcome email
await EmailService.sendWelcomeEmail(
  customer.email,
  customer.name,
  customer.id
);
```

### Abandoned Cart Recovery (24h Later)

```typescript
// Create a cron job or scheduled function
const abandonedCarts = await supabase
  .from('bookings')
  .select('*')
  .eq('status', 'draft')
  .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

for (const cart of abandonedCarts) {
  await EmailService.sendAbandonedCartEmail({
    customerEmail: cart.customer_email,
    customerName: cart.customer_name,
    serviceName: cart.service_name,
    price: cart.price,
  });
}
```

### Post-Service Referral Invitation

```typescript
// After appointment completion
await EmailService.sendReferralInvitation({
  customerEmail: customer.email,
  customerName: customer.name,
  referralCode: customer.referral_code,
});
```

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is set correctly
2. Verify domain is verified in Resend dashboard
3. Check Supabase Edge Function logs
4. Ensure customer hasn't unsubscribed

### Low Open Rates

1. Test different subject lines
2. Send at optimal times (Tue-Thu, 10 AM - 2 PM)
3. Improve sender reputation
4. Clean inactive subscribers

### Template Not Rendering

1. Check all required props are provided
2. Verify template syntax with `email:dev` preview
3. Test HTML in multiple email clients

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review `email_logs` table for delivery status
- Contact Resend support for delivery issues

---

**Last Updated:** December 26, 2025
**Version:** 1.0.0
