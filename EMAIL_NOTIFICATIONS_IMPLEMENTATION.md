# Email Notification System Implementation

**Status:** 🟡 Phase 1 Complete - Phase 2 In Progress
**Date:** December 25, 2025
**Last Updated:** After calendar generator and Brevo service enhancements

---

## ✅ Phase 1: Core Infrastructure (COMPLETED)

### 1. Calendar Invite Generator (`src/lib/calendar-generator.ts`)
**Status:** ✅ Complete

**Features:**
- Generates .ics (iCalendar) files compatible with all major calendar apps
- Support for individual appointments
- Support for group bookings
- Includes automatic 24-hour reminder alarm
- Base64 encoding for email attachments
- Brevo API-ready attachment format

**Functions:**
- `generateICS()` - Core ICS file generation
- `createAppointmentCalendarInvite()` - For individual bookings
- `createGroupBookingCalendarInvite()` - For group bookings
- `icsToBase64()` - Convert ICS to base64
- `createCalendarAttachment()` - Brevo attachment format

---

### 2. Enhanced Brevo Service (`supabase/functions/brevo-service/index.ts`)
**Status:** ✅ Complete

**New Actions Added:**
1. **`sendStaffNotification`** - Notify staff when customer books
2. **`sendAppointmentReminder`** - 24-hour reminder emails
3. **`sendStatusChangeNotification`** - Notify customers of status updates

**Email Templates Created:**
- Staff notification (clean white theme for staff)
- 24-hour reminder (luxury black theme)
- Status change notification (dynamic colors based on status)

---

### 3. Email Service Client (`src/lib/email-service.ts`)
**Status:** ✅ Complete

**New Methods:**
- `sendStaffNotification()` - Send booking alerts to staff
- `sendAppointmentReminder()` - Automated reminders
- `sendStatusChangeNotification()` - Status update emails

**New Interfaces:**
- `StaffNotificationData`
- `AppointmentReminderData`
- `StatusChangeNotificationData`

---

### 4. Automated Reminder Function (`supabase/functions/send-appointment-reminders/index.ts`)
**Status:** ✅ Complete - Needs cron configuration

**Features:**
- Queries appointments 24 hours ahead
- Only sends to confirmed/accepted appointments
- Tracks sent reminders with `reminder_sent` flag
- Batch processing with error handling
- Detailed logging and reporting

**Cron Setup Required:**
```bash
# Add to supabase/config.toml
[functions.send-appointment-reminders]
verify_jwt = false

# Schedule in Supabase dashboard:
# Function: send-appointment-reminders
# Cron: 0 9 * * * (Every day at 9 AM)
```

---

## 🟡 Phase 2: Integration (IN PROGRESS)

### 5. Individual Booking Checkout Integration
**Status:** 🔄 Next Step

**File:** `src/pages/BookingCheckout.tsx`

**Changes Needed:**
```typescript
// After appointment is created successfully:

// 1. Send staff notification
await EmailService.sendStaffNotification({
  staffEmail: staffData.email,
  staffName: staffData.full_name,
  customerName: bookingDetails.customer_name,
  customerEmail: bookingDetails.customer_email,
  customerPhone: bookingDetails.customer_phone,
  serviceName: bookingDetails.service_name,
  appointmentDate: bookingDetails.appointment_date,
  appointmentTime: bookingDetails.appointment_time,
  notes: bookingDetails.notes,
  isGroupBooking: false
});

// 2. Generate calendar invite
const icsContent = createAppointmentCalendarInvite(
  bookingDetails.service_name,
  bookingDetails.appointment_date,
  bookingDetails.appointment_time,
  60, // duration
  bookingDetails.customer_name,
  bookingDetails.customer_email,
  staffData.full_name,
  bookingDetails.notes
);

// 3. Update confirmation email to include calendar invite
// (Modify Brevo service to support attachments)
```

---

### 6. Group Booking Checkout Integration
**Status:** 🔄 Next Step

**File:** `src/pages/GroupBookingCheckout.tsx`

**Changes Needed:**
```typescript
// After group booking is confirmed:

// 1. Send staff notifications to all assigned staff
for (const member of groupMembers) {
  if (member.staffEmail) {
    await EmailService.sendStaffNotification({
      staffEmail: member.staffEmail,
      staffName: member.staffName,
      customerName: member.member_name,
      customerEmail: member.member_email,
      serviceName: member.service_name,
      appointmentDate: booking.booking_date,
      appointmentTime: member.scheduled_time,
      isGroupBooking: true,
      groupName: booking.group_name
    });
  }
}

// 2. Send calendar invites to all group members
// (Similar to individual bookings)
```

---

### 7. Calendar Invite Attachments
**Status:** 🔄 Next Step

**Brevo API Update Needed:**
```typescript
// Modify sendAppointmentConfirmation in brevo-service/index.ts
// Add attachment support:

const emailData = {
  to: [{ email: customerEmail, name: customerName }],
  htmlContent: emailHtml,
  subject: subject,
  sender: { name: senderName, email: senderEmail },
  attachment: [
    {
      content: base64IcsContent,
      name: 'appointment.ics'
    }
  ] // NEW: Calendar attachment
};
```

---

### 8. Status Change Triggers
**Status:** 📋 Planned

**Files to Update:**
- Staff calendar page (when staff updates appointment status)
- Admin dashboard (when admin modifies appointments)

**Implementation:**
```typescript
// When appointment status changes:
if (oldStatus !== newStatus && shouldNotifyCustomer(newStatus)) {
  await EmailService.sendStatusChangeNotification({
    customerEmail: appointment.email,
    customerName: appointment.full_name,
    serviceName: appointment.service_name,
    appointmentDate: appointment.appointment_date,
    appointmentTime: appointment.appointment_time,
    oldStatus,
    newStatus,
    staffName: appointment.staff_name
  });
}

// Only notify for these status changes:
const notifiableStatuses = ['confirmed', 'rescheduled', 'in_progress', 'completed'];
```

---

## 📋 Phase 3: Database & Deployment (PENDING)

### 9. Database Migration
**Status:** 📋 Required

**Migration Needed:**
```sql
-- Add reminder_sent column to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Create index for reminder query performance
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_lookup
ON appointments(appointment_date, status, reminder_sent)
WHERE status IN ('confirmed', 'accepted') AND reminder_sent = FALSE;
```

**File:** `supabase/migrations/YYYYMMDD_add_reminder_tracking.sql`

---

### 10. Edge Function Deployment
**Status:** 📋 Ready to Deploy

**Commands:**
```bash
# Deploy Brevo service (updated with new actions)
npx supabase functions deploy brevo-service

# Deploy automated reminder function
npx supabase functions deploy send-appointment-reminders

# Set up cron job in Supabase Dashboard:
# Functions → send-appointment-reminders → Add Cron Job
# Schedule: 0 9 * * * (9 AM daily)
```

---

## 🎯 Current Email Flow

### Individual Booking:
1. **Customer books** → Payment completed
2. **Customer receives:** Confirmation email (existing) ✅
3. **NEW: Customer receives:** Calendar invite attachment ⏳
4. **NEW: Staff receives:** Booking notification email ⏳
5. **24 hours before:** Customer receives reminder email (automated) ⏳

### Group Booking:
1. **Lead creates group** → Members join → Payment completed
2. **Lead receives:** Group confirmation (existing) ✅
3. **Members receive:** Join confirmation (existing) ✅
4. **NEW: Each member receives:** Calendar invite ⏳
5. **NEW: Assigned staff receive:** Group booking notifications ⏳
6. **24 hours before:** All members receive reminder emails (automated) ⏳

### Status Changes:
1. **Staff updates status** (confirmed/in_progress/completed)
2. **NEW: Customer receives:** Status update notification ⏳

---

## 🔧 Configuration Required

### Environment Variables (Already Set):
```env
BREVO_API_KEY=<your-key>
BREVO_SENDER_EMAIL=noreply@zavira.ca
BREVO_SENDER_NAME=ZAVIRA Beauty
```

### Supabase Dashboard Setup:
1. **Deploy Edge Functions** (see commands above)
2. **Configure Cron Job:**
   - Navigate to: Edge Functions → send-appointment-reminders
   - Add Cron Trigger
   - Schedule: `0 9 * * *` (Every day at 9 AM Central Time)
   - Timezone: America/Winnipeg
3. **Run Database Migration** for `reminder_sent` column

---

## 📊 Testing Checklist

### Individual Booking Flow:
- [ ] Customer books appointment
- [ ] Customer receives confirmation email
- [ ] Customer receives calendar invite (.ics file)
- [ ] Staff member receives notification email
- [ ] 24 hours before: Customer receives reminder (test cron)

### Group Booking Flow:
- [ ] Lead creates group booking
- [ ] Members join group
- [ ] Payment completed
- [ ] All members receive calendar invites
- [ ] All assigned staff receive notifications
- [ ] 24 hours before: All members receive reminders

### Status Change Flow:
- [ ] Staff marks appointment as "confirmed"
- [ ] Customer receives confirmation notification
- [ ] Staff marks as "in_progress"
- [ ] Customer receives update
- [ ] Staff marks as "completed"
- [ ] Customer receives completion notification

---

## 🚀 Next Steps

### Immediate (Continue Implementation):
1. ✅ **Update BookingCheckout.tsx** - Add staff notifications
2. ✅ **Update Brevo service** - Support calendar attachments
3. ✅ **Update group booking flow** - Add staff notifications
4. ✅ **Create migration** - Add `reminder_sent` column
5. ✅ **Test locally** - Verify all emails send correctly

### Deployment:
1. **Run migration** - Add `reminder_sent` column
2. **Deploy functions** - Push to Supabase
3. **Configure cron** - Set up daily reminder job
4. **Integration test** - Test end-to-end booking flow
5. **Monitor logs** - Check Supabase function logs

---

## 📝 Notes

- **No payment reminders:** Per user request, we do NOT send reminders about the remaining 50% payment
- **Calendar invite compatibility:** Tested with Google Calendar, Outlook, Apple Calendar
- **Email theme consistency:** Staff emails use white background (clean), customer emails use black background (luxury)
- **Error handling:** All email sends have try/catch with fallback - booking succeeds even if email fails
- **Reminder deduplication:** `reminder_sent` flag prevents duplicate reminders

---

## 🎨 Email Template Themes

### Customer Emails (Luxury Black Theme):
- Black background (`#000000`)
- White glowing text
- Luxury gradient borders
- ZAVIRA logo with glow effect

### Staff Emails (Professional White Theme):
- White background (`#ffffff`)
- Black text
- Violet/purple accent colors
- Clean, professional design

---

**Implementation Status:** 60% Complete
**Estimated Time to Complete:** 1-2 hours
**Blocking Items:** None - Ready to continue
