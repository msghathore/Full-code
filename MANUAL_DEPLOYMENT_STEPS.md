# 🎯 EXACT DEPLOYMENT STEPS - Follow These Precisely

**I cannot deploy via CLI due to authentication requirements. Here's exactly what YOU need to do:**

---

## ⚠️ CRITICAL: Do These 3 Steps in Order

### Step 1: Database Migration (MUST DO FIRST) ⏱️ 2 minutes

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/sql/new

**Copy and paste this EXACT SQL:**

```sql
-- Add reminder_sent column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Create index for fast reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_lookup
ON appointments(appointment_date, status, reminder_sent)
WHERE status IN ('confirmed', 'accepted') AND reminder_sent = FALSE;

-- Create index for status tracking
CREATE INDEX IF NOT EXISTS idx_appointments_status_tracking
ON appointments(id, status, updated_at);
```

**Click: RUN**

**Expected result:** "Success. No rows returned"

---

### Step 2: Deploy Edge Functions ⏱️ 5 minutes

**Open Command Prompt or PowerShell in this folder:**
```
C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End
```

**Run these commands ONE AT A TIME:**

```bash
# 1. Login (will open browser)
npx supabase login

# 2. Link to project
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr

# 3. Deploy Brevo service
npx supabase functions deploy brevo-service

# 4. Deploy reminder function
npx supabase functions deploy send-appointment-reminders
```

**Expected output for each deploy:**
```
✓ Deployed function send-appointment-reminders
```

---

### Step 3: Setup Cron Job ⏱️ 2 minutes

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions/send-appointment-reminders

**Click:** "Cron Jobs" or "Add Cron Trigger"

**Enter:**
- **Expression:** `0 9 * * *`
- **Timezone:** `America/Winnipeg`

**Click:** Save

---

## ✅ Verify Deployment

### Check #1: Database Column Added

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/sql/new

**Run:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'reminder_sent';
```

**Should return:** `reminder_sent | boolean`

---

### Check #2: Functions Deployed

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions

**Should see:**
- ✅ brevo-service (deployed recently)
- ✅ send-appointment-reminders (deployed recently)

---

### Check #3: Cron Job Active

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions/send-appointment-reminders

**Should see:** Cron job listed with next run time

---

## 🧪 TEST EVERYTHING

### Test 1: Manual Reminder Function

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions/send-appointment-reminders

**Click:** "Invoke" button

**Expected Response:**
```json
{
  "success": true,
  "message": "No reminders to send",
  "count": 0
}
```

---

### Test 2: Create Test Appointment for Tomorrow

**Go to:** https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/sql/new

**Run this SQL** (replace YOUR_EMAIL with your actual email):
```sql
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
  'YOUR_EMAIL_HERE@example.com',
  '(204) 555-0100',
  'paid',
  100.00,
  50.00,
  false
);
```

**Then invoke the reminder function again:**
- Go to functions → send-appointment-reminders
- Click "Invoke"
- **Check your email** - you should receive a reminder!

---

### Test 3: Live Booking Flow

**Go to:** https://zavira.ca/booking

**Complete a booking:**
1. Select a service
2. Choose a staff member
3. Pick a date/time
4. Enter customer details
5. Use test card: `4111 1111 1111 1111`
6. Complete payment

**Open browser console (F12) and look for:**
```
📧 Confirmation email sent
📧 Staff notification sent to: [email address]
```

**Check staff member's email inbox** - should receive notification

---

### Test 4: Group Booking

**Go to:** https://zavira.ca/group-booking

**Create a group booking:**
1. Select group type
2. Add members
3. Complete payment with test card

**Check console for:**
```
✅ Staff notifications sent for X group members
```

**Each assigned staff should receive email**

---

## 🎯 Success Checklist

After completing all steps above, verify:

- [ ] Database migration applied (reminder_sent column exists)
- [ ] Both edge functions deployed
- [ ] Cron job configured (9 AM daily)
- [ ] Reminder function responds when invoked
- [ ] Test appointment receives reminder email
- [ ] Live booking sends staff notification
- [ ] Staff receives email in inbox
- [ ] Group booking sends multiple staff notifications
- [ ] Console shows success messages
- [ ] No errors in Supabase function logs

---

## 📊 What's Working Now

After deployment, this is what happens automatically:

### When Customer Books (Individual):
1. ✅ Customer confirmation email sent (existing)
2. ✅ **NEW:** Staff notification email sent
3. ⏰ **NEW:** 24h before appointment, reminder sent automatically

### When Group Books:
1. ✅ Lead & members get confirmations (existing)
2. ✅ **NEW:** All staff members get notifications
3. ⏰ **NEW:** All members get reminders 24h before

### Every Day at 9 AM:
1. ⏰ Cron job runs automatically
2. ⏰ Finds all appointments for tomorrow
3. ⏰ Sends reminder emails
4. ⏰ Marks them as `reminder_sent = true`

---

## ❓ Troubleshooting

### "Unauthorized" error when deploying:
```bash
# Make sure you're logged in
npx supabase login

# Should open browser for authentication
```

### Functions not showing in dashboard:
- Refresh the page
- Check you're in the right project
- Verify deploy command succeeded

### Reminder function returns error:
- Check function logs in Supabase dashboard
- Verify BREVO_API_KEY is set in function secrets
- Check that reminder_sent column exists

### Staff notification not sending:
- Verify staff member has valid email in database
- Check Supabase function logs for brevo-service
- Verify BREVO_API_KEY environment variable is set

---

## 🆘 If Something Fails

**Check Logs:**
1. Supabase Dashboard → Functions → [function-name] → Logs
2. Look for error messages
3. Common issues:
   - Missing BREVO_API_KEY
   - Staff email not in database
   - Database migration not applied

**Function Secrets:**
Make sure these are set in Supabase:
- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- BREVO_SENDER_NAME

---

**Once you complete these steps, EVERYTHING will be working!** 🚀
