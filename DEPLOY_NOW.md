# 🚀 Deploy Email Notifications - DO THIS NOW

**Follow these steps exactly - should take 10 minutes total**

---

## Step 1: Apply Database Migration (2 minutes)

### Option A: Supabase Dashboard (Recommended)

1. **Open this link**: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/sql/new

2. **Copy this SQL code**:
```sql
-- Add reminder tracking to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN appointments.reminder_sent IS 'Tracks whether 24-hour reminder email has been sent to customer';

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_lookup
ON appointments(appointment_date, status, reminder_sent)
WHERE status IN ('confirmed', 'accepted') AND reminder_sent = FALSE;

COMMENT ON INDEX idx_appointments_reminder_lookup IS 'Optimizes queries for finding appointments that need reminders';

-- Add index for appointment status changes
CREATE INDEX IF NOT EXISTS idx_appointments_status_tracking
ON appointments(id, status, updated_at);

COMMENT ON INDEX idx_appointments_status_tracking IS 'Helps track appointment status changes for notifications';
```

3. **Paste** into the SQL Editor

4. **Click "RUN"** button (bottom right)

5. **Verify Success** - You should see "Success. No rows returned"

---

## Step 2: Deploy Edge Functions (5 minutes)

### In your terminal (Command Prompt or PowerShell):

```bash
# 1. Login to Supabase
npx supabase login

# This will open your browser - login with your Supabase account

# 2. Link to your project (if not already linked)
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr

# 3. Deploy Brevo service (updated with new email actions)
npx supabase functions deploy brevo-service

# 4. Deploy automated reminder function
npx supabase functions deploy send-appointment-reminders
```

**Expected output for each deploy:**
```
Bundling brevo-service
Deploying brevo-service (project ref: jcbqrmxiwahtbugbdtqr)
Deployed brevo-service version: xxx
```

---

## Step 3: Set Up Cron Job (3 minutes)

1. **Open this link**: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions

2. **Click** on `send-appointment-reminders` function

3. **Look for** "Cron Jobs" or "Cron Triggers" section (might be a tab)

4. **Click** "Add Cron Job" or "New Cron Trigger"

5. **Enter these details**:
   - **Schedule**: `0 9 * * *`
   - **Timezone**: `America/Winnipeg`
   - **Description**: Send 24-hour appointment reminders

6. **Click** "Save" or "Create"

7. **Verify** - You should see the cron job listed with "Next run" time

---

## ✅ Verify Everything Deployed

### Check Edge Functions:
1. Go to: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions
2. You should see:
   - ✅ `brevo-service` - Recently deployed
   - ✅ `send-appointment-reminders` - Recently deployed with cron job

### Check Database:
1. Go to: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/sql/new
2. Run this SQL:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'reminder_sent';
```
3. Should return: `reminder_sent | boolean | false`

---

## 🧪 Quick Test After Deployment

### Test the reminder function manually:

1. Go to: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions/send-appointment-reminders

2. Click the **"Invoke"** button

3. You should see a response like:
```json
{
  "success": true,
  "message": "No reminders to send",
  "count": 0
}
```

4. Check the **Logs** tab - should show successful execution

---

## 🎉 You're Done!

Your email notification system is now **LIVE** and will:

- ✅ **Notify staff** when customers book (happens automatically)
- ✅ **Send 24h reminders** every day at 9 AM (automated)
- ✅ **Work for group bookings** (all integrated)

---

## 🧪 Test Live Booking (Optional - 5 minutes)

1. Go to: https://zavira.ca/booking

2. Complete a test booking:
   - Select any service
   - Choose a staff member
   - Pick tomorrow's date
   - Enter your email
   - Use test card: `4111 1111 1111 1111`

3. Check:
   - ✅ Browser console: `📧 Staff notification sent to: [email]`
   - ✅ Staff email inbox: Should receive booking notification
   - ✅ Your email: Should receive confirmation

4. Tomorrow at 9 AM:
   - ✅ You'll receive 24-hour reminder email

---

## ❓ Troubleshooting

### If edge function deploy fails:
```bash
# Make sure you're logged in
npx supabase login

# Try linking again
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr

# Deploy with debug flag
npx supabase functions deploy brevo-service --debug
```

### If SQL fails:
- Make sure you're in the SQL Editor
- Copy the entire SQL block (including comments)
- Click RUN, not Save

### If cron job isn't visible:
- Make sure you deployed `send-appointment-reminders` function first
- Refresh the functions page
- Look for "Cron Jobs" tab or section

---

## 📞 Need Help?

Check function logs:
- Go to: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions
- Click on function name
- Click "Logs" tab
- Look for errors or success messages

---

**Total time: ~10 minutes**
**Status after completion: 🟢 LIVE**
