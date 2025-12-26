# Email Template System Deployment Checklist

**Date:** December 26, 2025
**System:** Automated Email Campaigns for Zavira Salon & Spa

## Overview

This checklist guides you through deploying the complete email template system for automated customer engagement campaigns.

## Prerequisites

- [ ] Supabase project is set up and accessible
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Access to Zavira production environment
- [ ] Domain zavira.ca is configured

---

## Phase 1: Environment Setup

### 1.1 Install Dependencies

```bash
# Already completed ✅
npm install react-email @react-email/components @react-email/render
```

**Status:** ✅ Completed

### 1.2 Sign Up for Resend (Email Service Provider)

1. [ ] Visit https://resend.com and create an account
2. [ ] Verify your email address
3. [ ] Access the dashboard

### 1.3 Verify Domain with Resend

1. [ ] Go to Resend Dashboard → Domains
2. [ ] Add domain: `zavira.ca`
3. [ ] Copy DNS records provided by Resend
4. [ ] Add DNS records to your domain registrar:

```
Type: TXT
Name: @
Value: resend-verification=xxxxxxxxxxxxxxx

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

5. [ ] Wait for DNS propagation (5-30 minutes)
6. [ ] Click "Verify Domain" in Resend dashboard
7. [ ] Confirm status shows "Verified"

### 1.4 Get Resend API Key

1. [ ] Go to Resend Dashboard → API Keys
2. [ ] Click "Create API Key"
3. [ ] Name: `zavira-production`
4. [ ] Copy the API key (starts with `re_`)
5. [ ] Store securely - you won't see it again!

**API Key:** `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Phase 2: Database Setup

### 2.1 Apply Email Logs Migration

```bash
# Navigate to project directory
cd /path/to/Zavira-Front-End

# Apply migration to Supabase
npx supabase db push
```

**Or manually apply:**

```bash
# Using psql
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/20251226_email_logs.sql
```

### 2.2 Verify Tables Created

1. [ ] Open Supabase Dashboard → Table Editor
2. [ ] Confirm these tables exist:
   - [ ] `email_logs`
   - [ ] `email_campaigns`
   - [ ] `email_preferences`

### 2.3 Verify RLS Policies

1. [ ] Open Supabase Dashboard → Authentication → Policies
2. [ ] Confirm policies exist for all three tables
3. [ ] Test policy access from frontend

---

## Phase 3: Deploy Supabase Edge Function

### 3.1 Deploy the Function

```bash
# Deploy send-email function
npx supabase functions deploy send-email
```

**Expected output:**
```
Deploying function send-email...
Function deployed successfully!
URL: https://your-project.supabase.co/functions/v1/send-email
```

### 3.2 Set Environment Variables

```bash
# Set Resend API key
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Verify it's set
npx supabase secrets list
```

**Expected output:**
```
RESEND_API_KEY: re_xxxxx... (hidden)
```

### 3.3 Test Edge Function

```bash
# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_type": "welcome",
    "to": "test@zavira.ca",
    "data": {
      "customerName": "Test Customer",
      "customerEmail": "test@zavira.ca"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message_id": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Phase 4: Frontend Integration

### 4.1 Update Environment Variables

Add to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4.2 Test Email Service

Create a test file: `test-email.ts`

```typescript
import { EmailService } from './src/lib/email-service';

async function testWelcomeEmail() {
  const result = await EmailService.sendWelcomeEmail(
    'your-email@example.com',
    'Test User',
    'test-customer-id'
  );

  console.log('Result:', result);
}

testWelcomeEmail();
```

Run test:
```bash
npx tsx test-email.ts
```

### 4.3 Verify Email Received

1. [ ] Check inbox for welcome email
2. [ ] Verify branding (black header, white glow logo)
3. [ ] Test CTA button links
4. [ ] Check mobile rendering

---

## Phase 5: Integration Points

### 5.1 Customer Registration

**File:** `src/pages/auth/SignUp.tsx` (or similar)

Add after successful registration:

```typescript
// After customer created in database
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

### 5.2 Appointment Booking

**File:** `src/components/booking/BookingConfirmation.tsx` (or similar)

Add after booking confirmed:

```typescript
// After appointment created
await EmailService.sendAppointmentConfirmation({
  customerEmail: appointment.customer_email,
  customerName: appointment.customer_name,
  serviceName: appointment.service_name,
  staffName: appointment.staff_name,
  appointmentDate: formatDate(appointment.date),
  appointmentTime: formatTime(appointment.time),
  duration: appointment.duration,
  price: `$${appointment.price}`,
});
```

### 5.3 Abandoned Cart Tracking

Create new file: `src/lib/abandonedCartTracker.ts`

```typescript
export function trackBookingStart(bookingData: any) {
  // Store in localStorage or database
  localStorage.setItem('pendingBooking', JSON.stringify({
    ...bookingData,
    startedAt: new Date().toISOString(),
  }));
}

export function clearBookingTracker() {
  localStorage.removeItem('pendingBooking');
}
```

Create scheduled job to check and send recovery emails.

---

## Phase 6: Automated Campaigns Setup

### 6.1 Create Appointment Reminder Scheduler

**Option A: Supabase Cron (Recommended)**

Create file: `supabase/functions/send-appointment-reminders/index.ts`

```typescript
// Already exists! Just verify it's calling the new email function
```

Deploy:
```bash
npx supabase functions deploy send-appointment-reminders
```

**Option B: External Cron (Alternative)**

Use a service like Vercel Cron or GitHub Actions.

### 6.2 Create Abandoned Cart Recovery Job

Create file: `supabase/functions/abandoned-cart-recovery/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find bookings started 24 hours ago, not completed
  const { data: abandonedBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'draft')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .is('completed_at', null);

  // Send recovery emails
  for (const booking of abandonedBookings || []) {
    await supabase.functions.invoke('send-email', {
      body: {
        email_type: 'abandoned_cart',
        to: booking.customer_email,
        data: {
          customerName: booking.customer_name,
          serviceName: booking.service_name,
          price: `$${booking.price}`,
        },
      },
    });
  }

  return new Response(JSON.stringify({ sent: abandonedBookings?.length || 0 }));
});
```

Deploy:
```bash
npx supabase functions deploy abandoned-cart-recovery
```

### 6.3 Schedule Jobs with Supabase Cron

```sql
-- In Supabase SQL Editor
-- Run appointment reminders daily at 9 AM
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 9 * * *', -- Every day at 9 AM
  $$ SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-appointment-reminders',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) $$
);

-- Run abandoned cart recovery every 6 hours
SELECT cron.schedule(
  'abandoned-cart-recovery',
  '0 */6 * * *', -- Every 6 hours
  $$ SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/abandoned-cart-recovery',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) $$
);
```

---

## Phase 7: Testing & Quality Assurance

### 7.1 Test All Email Templates

- [ ] Welcome Email
  - [ ] Renders correctly on desktop
  - [ ] Renders correctly on mobile
  - [ ] CTA buttons work
  - [ ] Unsubscribe link works

- [ ] Appointment Confirmation
  - [ ] All appointment details display
  - [ ] Renders correctly
  - [ ] View/Reschedule buttons work

- [ ] Appointment Reminder
  - [ ] Countdown badge shows correctly
  - [ ] Details accurate
  - [ ] Links work

- [ ] Abandoned Cart
  - [ ] Service details correct
  - [ ] Discount code displays
  - [ ] CTA works

- [ ] Referral Invitation
  - [ ] Referral code shows
  - [ ] Reward amounts correct
  - [ ] Share buttons work

### 7.2 Test Email Tracking

1. [ ] Send test email
2. [ ] Open email
3. [ ] Click link in email
4. [ ] Verify `email_logs` table updated:
   - [ ] `opened_at` timestamp set
   - [ ] `clicked_at` timestamp set
   - [ ] `open_count` incremented
   - [ ] `click_count` incremented

### 7.3 Test Email Preferences

1. [ ] Update preferences via frontend
2. [ ] Verify `email_preferences` table updated
3. [ ] Test unsubscribe link
4. [ ] Confirm marketing emails blocked after unsubscribe
5. [ ] Confirm transactional emails still sent

### 7.4 Test Spam Score

Use https://www.mail-tester.com:

1. [ ] Send test email to address provided by mail-tester
2. [ ] Check spam score (aim for 9/10 or higher)
3. [ ] Fix any issues flagged

---

## Phase 8: Monitoring & Analytics

### 8.1 Set Up Email Metrics Dashboard

Create file: `src/pages/admin/EmailMetrics.tsx`

Display:
- Total emails sent (by type)
- Delivery rate
- Open rate
- Click-through rate
- Unsubscribe rate

### 8.2 Set Up Alerts

Create alerts for:
- [ ] Delivery failures > 5%
- [ ] Bounce rate > 2%
- [ ] Unsubscribe rate > 1%

### 8.3 Monitor Resend Dashboard

Weekly checks:
- [ ] Email sending volume
- [ ] Bounce rates
- [ ] Complaint rates
- [ ] Domain reputation

---

## Phase 9: Production Rollout

### 9.1 Gradual Rollout

**Week 1:**
- [ ] Enable welcome emails only
- [ ] Monitor for 7 days
- [ ] Check metrics

**Week 2:**
- [ ] Enable appointment confirmations
- [ ] Enable appointment reminders
- [ ] Monitor for 7 days

**Week 3:**
- [ ] Enable abandoned cart recovery
- [ ] Monitor closely

**Week 4:**
- [ ] Enable referral invitations
- [ ] Full system live

### 9.2 Customer Communication

- [ ] Update privacy policy with email communication details
- [ ] Add email preferences to customer account page
- [ ] Provide clear unsubscribe options

---

## Phase 10: Post-Launch Optimization

### 10.1 A/B Testing (Month 2+)

Test variations of:
- [ ] Subject lines
- [ ] Send times
- [ ] CTA button text
- [ ] Email copy
- [ ] Discount amounts

### 10.2 Regular Reviews

Monthly:
- [ ] Review email metrics
- [ ] Analyze engagement trends
- [ ] Clean inactive subscribers
- [ ] Update templates as needed

Quarterly:
- [ ] Review email strategy
- [ ] Survey customer feedback
- [ ] Update content and offers

---

## Troubleshooting

### Issue: Emails not sending

**Check:**
1. Resend API key is correct
2. Domain is verified in Resend
3. Edge function is deployed
4. Supabase secrets are set
5. Check Edge Function logs

### Issue: Low open rates

**Solutions:**
1. Test different subject lines
2. Send at optimal times (Tue-Thu 10 AM - 2 PM)
3. Verify sender reputation
4. Check spam score

### Issue: Emails in spam folder

**Solutions:**
1. Verify SPF/DKIM/DMARC records
2. Improve email content (less sales-y)
3. Avoid spam trigger words
4. Warm up domain gradually

---

## Success Metrics

Track these KPIs:

| Metric | Target | Current |
|--------|--------|---------|
| Delivery Rate | >98% | ___ |
| Open Rate | >25% | ___ |
| Click-through Rate | >5% | ___ |
| Unsubscribe Rate | <0.5% | ___ |
| Bounce Rate | <2% | ___ |

---

## Completion Checklist

- [ ] All dependencies installed
- [ ] Domain verified with Resend
- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] Email templates tested
- [ ] Integration points implemented
- [ ] Automated campaigns scheduled
- [ ] Monitoring dashboard created
- [ ] Production rollout complete
- [ ] Team trained on system

---

## Support Resources

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Email Marketing Best Practices:** https://www.campaignmonitor.com/resources/

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

🎉 **Email Template System Deployment Complete!**
