# 🚀 Email Notifications - Deploy & Test Guide

**Status:** ✅ **READY TO DEPLOY**
**Compilation:** ✅ TypeScript compiles successfully
**Integrations:** ✅ All code integrated

---

## ✅ What's Been Completed

### Code Changes:
1. ✅ **Calendar invite generator** (`src/lib/calendar-generator.ts`)
2. ✅ **Enhanced Brevo service** with 3 new email types (`supabase/functions/brevo-service/index.ts`)
3. ✅ **Email service client** with new methods (`src/lib/email-service.ts`)
4. ✅ **Automated reminder function** (`supabase/functions/send-appointment-reminders/index.ts`)
5. ✅ **Individual booking integration** (`src/pages/BookingCheckout.tsx`)
6. ✅ **Group booking integration** (`src/pages/GroupBookingCheckout.tsx`)
7. ✅ **Database migration** (`supabase/migrations/20251225_add_reminder_tracking.sql`)

### Features Added:
- ✅ Staff receive email notifications when customers book
- ✅ 24-hour automated reminder emails
- ✅ Status change notifications (ready, not yet triggered)
- ✅ Calendar invite generation (ready for attachment support)
- ✅ Group booking support for all features

---

## 📋 Deployment Checklist

### Step 1: Apply Database Migration ⚠️ **REQUIRED**

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr
2. Click **SQL Editor**
3. Click **New Query**
4. Copy and paste from `supabase/migrations/20251225_add_reminder_tracking.sql`
5. Click **Run**
6. Verify success message

**Option B: Using Supabase CLI**
```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr

# Apply the migration
npx supabase db push
```

**Verify Migration:**
```sql
-- Run this in SQL Editor to verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'reminder_sent';
```

Expected result: Should show `reminder_sent | boolean | false`

---

### Step 2: Deploy Edge Functions ⚠️ **REQUIRED**

```bash
# Make sure you're logged in
npx supabase login

# Link to project if not already
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr

# Deploy updated Brevo service (has new email actions)
npx supabase functions deploy brevo-service

# Deploy automated reminder function
npx supabase functions deploy send-appointment-reminders
```

**Verify Deployment:**
1. Go to https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions
2. You should see both functions listed
3. Click each one and verify "Last Deployed" timestamp is recent

---

### Step 3: Configure Cron Job for Reminders ⚠️ **REQUIRED**

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on **send-appointment-reminders**
3. Click **"Add Cron Job"** or **"Cron Triggers"** tab
4. Add new trigger:
   - **Schedule:** `0 9 * * *`
   - **Timezone:** America/Winnipeg
   - **Description:** Send 24-hour appointment reminders
5. Click **Save**

**What this does:**
- Runs every day at 9:00 AM Central Time
- Finds appointments scheduled for tomorrow
- Sends reminder emails automatically
- Marks appointments as `reminder_sent = true`

---

### Step 4: Deploy Frontend to Vercel (Optional but Recommended)

```bash
# Commit your changes
git add .
git commit -m "feat: Add comprehensive email notification system

- Staff notifications when customers book
- 24-hour automated reminders
- Status change notifications
- Calendar invite generation
- Group booking support"

# Push to trigger Vercel deployment
git push
```

---

## 🧪 Testing Guide

### Test 1: Staff Notification Email

**Test booking checkout to trigger staff notification:**

1. Start dev server:
```bash
npm run dev
```

2. Go to https://zavira.ca/booking (or localhost:8080/booking)
3. Complete a booking:
   - Select a service
   - Choose a staff member
   - Pick a date/time
   - Enter customer details
   - Complete payment (use Square test card: `4111 1111 1111 1111`)

4. **Check Console Logs:**
Look for:
```
📧 Confirmation email sent
📧 Staff notification sent to: [staff-email]
```

5. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Edge Functions → brevo-service
   - Click **Logs** tab
   - Look for `sendStaffNotification` action
   - Verify success message

6. **Check Staff Email Inbox:**
   - Staff member should receive email with subject: "📅 New Appointment: [Service] - [Date]"
   - Email should have:
     - Professional white theme
     - Customer contact info
     - Appointment details
     - Notes if any were provided

---

### Test 2: Group Booking Staff Notifications

1. Create a group booking at `/group-booking`
2. Add members
3. Complete payment
4. Check console for:
```
✅ Staff notifications sent for X group members
```

5. Each staff member assigned to the group should receive an email
6. Emails should indicate "GROUP BOOKING" badge

---

### Test 3: Automated Reminder Function (Manual Trigger)

**Test the reminder function directly:**

1. Go to Supabase Dashboard → Edge Functions
2. Click **send-appointment-reminders**
3. Click **Invoke** button
4. Check the response:
```json
{
  "success": true,
  "summary": {
    "total": X,
    "sent": X,
    "failed": 0
  }
}
```

5. Check function logs for detailed output

**Create test appointment for tomorrow:**
```sql
-- Run in Supabase SQL Editor
INSERT INTO appointments (
  service_id,
  staff_id,
  appointment_date,
  appointment_time,
  status,
  full_name,
  email,
  phone,
  payment_status,
  total_amount,
  deposit_amount,
  reminder_sent
) VALUES (
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM staff LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00',
  'confirmed',
  'Test Customer',
  'your-test-email@example.com', -- Use your real email!
  '(204) 555-0100',
  'paid',
  100.00,
  50.00,
  false
);
```

Then invoke the function and check your email!

---

### Test 4: Calendar Invite Generation (Code Test)

**Test calendar invite in browser console:**

1. Go to any page on your site
2. Open browser console (F12)
3. Paste this code:
```javascript
// Import the function (replace with actual import in your code)
const { createAppointmentCalendarInvite } = await import('/src/lib/calendar-generator.ts');

const icsContent = createAppointmentCalendarInvite(
  'Luxury Haircut',
  '2025-12-30',
  '14:00',
  60,
  'John Doe',
  'john@example.com',
  'Sarah Johnson',
  'First time customer'
);

console.log(icsContent);

// Download the .ics file to test
const blob = new Blob([icsContent], { type: 'text/calendar' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'test-appointment.ics';
a.click();
```

4. Open the downloaded .ics file
5. Verify it imports into Google Calendar/Outlook/Apple Calendar
6. Check that it shows:
   - Correct date/time
   - Service name
   - Location: 283 Tache Avenue, Winnipeg, MB
   - 24-hour reminder alarm

---

## 🔍 Verification Checklist

### After Deployment:

- [ ] Database migration applied successfully
- [ ] `reminder_sent` column exists in appointments table
- [ ] Both edge functions deployed
- [ ] Cron job configured (9 AM daily)
- [ ] Frontend deployed to Vercel (if applicable)

### Test Results:

- [ ] Individual booking sends customer confirmation email
- [ ] Individual booking sends staff notification email
- [ ] Group booking sends staff notifications to all members
- [ ] Manual reminder function invocation works
- [ ] Calendar invite generates valid .ics file
- [ ] Emails use correct themes (black for customers, white for staff)
- [ ] No TypeScript errors in console
- [ ] No runtime errors in Supabase logs

---

## 📧 Email Templates Overview

### Customer Emails (Black Luxury Theme):
- **Appointment Confirmation** - Existing, works
- **Appointment Reminder** - New, 24h before
- **Status Change Notification** - Ready (triggers TBD)
- **Cancellation** - Existing, works

### Staff Emails (White Professional Theme):
- **New Booking Notification** - New, on every booking
- **Group Booking Notification** - New, for group bookings

---

## 🐛 Troubleshooting

### Staff notification not sending:
1. Check console logs for error messages
2. Verify staff member has valid email in database:
```sql
SELECT id, full_name, email FROM staff WHERE id = 'staff-id-here';
```
3. Check Supabase function logs for brevo-service
4. Verify BREVO_API_KEY is set in Supabase edge function secrets

### Reminder function not sending:
1. Verify cron job is configured correctly
2. Check if `reminder_sent = false` on test appointment
3. Verify appointment date is exactly tomorrow
4. Check appointment status is 'confirmed' or 'accepted'
5. Look at function logs for execution history

### Calendar invite not working:
1. Verify time zone handling (currently uses UTC)
2. Check that all required fields are provided
3. Test with different calendar apps
4. Validate ICS format using online validators

### TypeScript errors:
1. Run `npx tsc --noEmit` to check for errors
2. Verify all imports are correct
3. Check that EmailService types match usage

---

## 🎯 Current State of Features

| Feature | Status | Location |
|---------|--------|----------|
| Staff Notifications (Individual) | ✅ Integrated | `BookingCheckout.tsx:221-251` |
| Staff Notifications (Group) | ✅ Integrated | `GroupBookingCheckout.tsx:67-106` |
| 24h Reminders | ✅ Ready | Requires cron setup |
| Calendar Invites | ✅ Generated | Needs attachment support |
| Status Notifications | ⏳ Ready | Needs trigger integration |
| Database Migration | ✅ Created | Needs manual apply |
| Edge Functions | ✅ Created | Needs deployment |

---

## 📝 Next Steps (Optional Enhancements)

### Short Term:
1. **Calendar Invite Attachments** - Add .ics file to confirmation emails
2. **Status Change Triggers** - Add to staff calendar when status updates
3. **Rescheduling Notifications** - Email when appointments are rescheduled
4. **SMS Reminders** - Add Twilio integration for text reminders

### Medium Term:
1. **Email Templates in Database** - Make emails customizable
2. **A/B Testing** - Test different email subject lines
3. **Email Analytics** - Track open rates, click rates
4. **Unsubscribe Management** - Allow customers to opt out of reminders

---

## 🆘 Need Help?

### Check Logs:
1. **Browser Console** - F12 in browser
2. **Supabase Logs** - Dashboard → Edge Functions → Logs
3. **Vercel Logs** - vercel.com dashboard
4. **Email Status** - Brevo dashboard → Statistics

### Common Issues:
- **"Email not sent"** - Check Brevo API key and quota
- **"Function timeout"** - Increase timeout in function config
- **"Database error"** - Verify migration applied correctly
- **"No staff email"** - Update staff records with valid emails

---

**✅ Everything is ready to deploy!**

Once you complete Steps 1-3 above, your email notification system will be fully operational.

**Estimated deployment time:** 10-15 minutes
**Testing time:** 15-20 minutes
**Total:** ~30 minutes to full functionality
