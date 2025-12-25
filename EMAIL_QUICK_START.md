# Email Notifications - Quick Start Guide

**🎯 What's Been Implemented:**
✅ Calendar invite generator
✅ Staff notification emails
✅ 24-hour reminder emails
✅ Status change notification emails
✅ Automated reminder edge function
✅ Database migration for tracking

---

## 🚀 Deploy Now (3 Steps)

### Step 1: Apply Database Migration
```bash
npx supabase db push
```

This adds the `reminder_sent` column to track which appointments have received reminders.

---

### Step 2: Deploy Edge Functions
```bash
# Deploy updated Brevo service
npx supabase functions deploy brevo-service

# Deploy automated reminder function
npx supabase functions deploy send-appointment-reminders
```

---

### Step 3: Set Up Cron Job

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on **send-appointment-reminders**
3. Click **Add Cron Job**
4. Enter schedule: `0 9 * * *` (Every day at 9 AM)
5. Set timezone: **America/Winnipeg**
6. Save

**✅ Done!** The automated reminder system is now active.

---

## 🧪 Test Individual Components

### Test Staff Notification Email
```typescript
import { EmailService } from '@/lib/email-service';

await EmailService.sendStaffNotification({
  staffEmail: 'staff@zavira.ca',
  staffName: 'Sarah Johnson',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '(204) 555-0100',
  serviceName: 'Luxury Haircut',
  appointmentDate: '2025-12-26',
  appointmentTime: '14:00',
  notes: 'First time customer',
  isGroupBooking: false
});
```

---

### Test 24-Hour Reminder
```typescript
await EmailService.sendAppointmentReminder({
  customerEmail: 'john@example.com',
  customerName: 'John Doe',
  serviceName: 'Luxury Haircut',
  appointmentDate: '2025-12-26',
  appointmentTime: '14:00',
  staffName: 'Sarah Johnson'
});
```

---

### Test Status Change Notification
```typescript
await EmailService.sendStatusChangeNotification({
  customerEmail: 'john@example.com',
  customerName: 'John Doe',
  serviceName: 'Luxury Haircut',
  appointmentDate: '2025-12-26',
  appointmentTime: '14:00',
  oldStatus: 'pending',
  newStatus: 'confirmed',
  staffName: 'Sarah Johnson'
});
```

---

### Test Calendar Invite Generator
```typescript
import { createAppointmentCalendarInvite } from '@/lib/calendar-generator';

const icsContent = createAppointmentCalendarInvite(
  'Luxury Haircut',
  '2025-12-26',
  '14:00',
  60, // duration in minutes
  'John Doe',
  'john@example.com',
  'Sarah Johnson',
  'First time customer'
);

console.log(icsContent); // ICS file content
```

---

## 📋 What Still Needs Integration

### 1. Individual Booking Checkout (`src/pages/BookingCheckout.tsx`)

**Add after line 205 (after customer confirmation email):**

```typescript
// Send staff notification
try {
  const { data: staffData } = await supabase
    .from('staff')
    .select('email, full_name')
    .eq('id', appointmentData.staff_id)
    .single();

  if (staffData?.email) {
    await EmailService.sendStaffNotification({
      staffEmail: staffData.email,
      staffName: staffData.full_name,
      customerName: appointmentData.full_name,
      customerEmail: appointmentData.email,
      customerPhone: appointmentData.phone,
      serviceName: selectedService.name,
      appointmentDate: appointmentData.appointment_date,
      appointmentTime: appointmentData.appointment_time,
      notes: appointmentData.notes,
      isGroupBooking: false
    });
    console.log('✅ Staff notification sent');
  }
} catch (error) {
  console.error('⚠️ Failed to send staff notification:', error);
  // Don't fail the booking if email fails
}
```

---

### 2. Group Booking Checkout (`src/pages/GroupBookingCheckout.tsx`)

**Add after group confirmation emails:**

```typescript
// Send staff notifications for group booking
try {
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select(`
      *,
      services (name),
      staff (email, full_name)
    `)
    .eq('group_booking_id', booking.id);

  for (const member of groupMembers || []) {
    if (member.staff?.email) {
      await EmailService.sendStaffNotification({
        staffEmail: member.staff.email,
        staffName: member.staff.full_name,
        customerName: member.member_name,
        customerEmail: member.member_email,
        customerPhone: member.member_phone,
        serviceName: member.services.name,
        appointmentDate: booking.booking_date,
        appointmentTime: member.scheduled_time,
        isGroupBooking: true,
        groupName: booking.group_name
      });
    }
  }
  console.log('✅ Staff notifications sent for group booking');
} catch (error) {
  console.error('⚠️ Failed to send staff notifications:', error);
}
```

---

### 3. Status Change Triggers

**Add to any component that updates appointment status:**

```typescript
// When updating appointment status
const handleStatusChange = async (appointmentId: string, newStatus: string) => {
  // Get current appointment data
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      services (name),
      staff (full_name)
    `)
    .eq('id', appointmentId)
    .single();

  const oldStatus = appointment.status;

  // Update status
  await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId);

  // Send notification for important status changes
  const notifiableStatuses = ['confirmed', 'rescheduled', 'in_progress', 'completed'];

  if (notifiableStatuses.includes(newStatus) && newStatus !== oldStatus) {
    try {
      await EmailService.sendStatusChangeNotification({
        customerEmail: appointment.email,
        customerName: appointment.full_name,
        serviceName: appointment.services?.name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        oldStatus,
        newStatus,
        staffName: appointment.staff?.full_name
      });
      console.log('✅ Status change notification sent');
    } catch (error) {
      console.error('⚠️ Failed to send status notification:', error);
    }
  }
};
```

---

## 📧 Email Themes

### Customer Emails (Black Luxury Theme)
- **Used for:** Confirmations, reminders, status updates
- **Background:** Black (`#000000`)
- **Text:** White with glow effect
- **Style:** Luxury, elegant

### Staff Emails (White Professional Theme)
- **Used for:** Booking notifications
- **Background:** White (`#ffffff`)
- **Text:** Black
- **Accent:** Violet/Purple
- **Style:** Clean, professional

---

## 🔍 Verify Email Sending

### Check Supabase Function Logs:
1. Go to Supabase Dashboard → **Edge Functions**
2. Click on **brevo-service**
3. View **Logs** tab
4. Look for email success/error messages

### Check Brevo Dashboard:
1. Go to Brevo dashboard
2. **Statistics** → **Email**
3. Verify sent emails count

---

## ⚙️ Environment Variables

**Already configured in Supabase:**
```env
BREVO_API_KEY=<your-key>
BREVO_SENDER_EMAIL=noreply@zavira.ca
BREVO_SENDER_NAME=ZAVIRA Beauty
```

---

## 🎯 Current Email Flow Summary

### When Customer Books:
1. ✅ **Customer:** Receives confirmation email (existing)
2. 🔜 **Customer:** Will receive calendar invite (needs attachment support)
3. 🔜 **Staff:** Receives booking notification (needs integration)
4. ⏰ **24h before:** Customer receives automated reminder (ready after cron setup)

### When Staff Changes Status:
1. 🔜 **Customer:** Receives status update email (needs trigger integration)

### Group Bookings:
1. ✅ **Lead & Members:** Receive confirmations (existing)
2. 🔜 **All Members:** Will receive calendar invites
3. 🔜 **Assigned Staff:** Receive group booking notifications
4. ⏰ **24h before:** All members receive reminders

---

## ✅ Testing Checklist

- [ ] Deploy database migration
- [ ] Deploy edge functions
- [ ] Set up cron job for reminders
- [ ] Test staff notification email manually
- [ ] Test reminder email manually
- [ ] Test status change email manually
- [ ] Integrate staff notifications into booking checkout
- [ ] Integrate into group booking checkout
- [ ] Add status change triggers
- [ ] Test full booking flow end-to-end
- [ ] Verify cron job runs (check logs next day)

---

**Status:** Core infrastructure complete - Integration pending
**Ready for:** Deployment and testing
**Next:** Add integration code to booking checkouts
