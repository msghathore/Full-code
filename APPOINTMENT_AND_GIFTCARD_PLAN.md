# Appointment & Gift Card Implementation Plan

## 1. Appointment Visibility on Staff Dashboard

### Current Status: YES - Appointments appear on staff dashboard

### How It Works Now

1. Customer books appointment on Booking page
2. Payment is processed via Square
3. Appointment is saved to Supabase `appointments` table
4. Staff dashboard reads from the same table using `useAppointments.ts` hook
5. Data appears when staff loads or refreshes the page

### Issue Found

There is NO real-time subscription. Staff must manually refresh the page to see new bookings.

### Recommended Fix

Add Supabase real-time listener so staff dashboard updates instantly when new appointments are created.

---

## 2. Appointment Create and Reschedule Logic

### Current Customer Booking Flow

| Step | Action |
|------|--------|
| Step 0 | Choose booking type (by staff, by service, or group) |
| Step 1 | Select date and time (30-minute slots from 9AM to 11:30PM) |
| Step 2 | Enter contact info (name, phone, email) |
| Step 3 | Review and confirm booking |
| Step 4 | Pay via Square - appointment is created in database |

### Key Files Involved

- `src/pages/Booking.tsx` - Customer booking wizard
- `src/pages/BookingCheckout.tsx` - Payment and appointment creation
- `src/hooks/useAppointments.ts` - Staff fetches appointments
- `src/components/CreateAppointmentDialog.tsx` - Staff creates/edits appointments

### Current Staff Reschedule Options

| Component | Purpose |
|-----------|---------|
| CreateAppointmentDialog | Full editing with overlap detection |
| MoveAppointmentDialog | Quick date/time/staff change |
| RebookAppointmentDialog | Create new booking from old one |

### What is Missing for Customers

- No customer self-reschedule page
- No way for customers to modify their booking after payment
- No cancellation flow for customers

### Recommended Customer Reschedule Flow

1. Customer receives booking confirmation email with reschedule link
2. Link goes to `/reschedule/:appointmentId` page
3. Customer verifies identity via email or phone number
4. System shows current booking details
5. Customer picks new date and time from available slots
6. System checks for conflicts/availability
7. System updates appointment in database
8. System sends new confirmation email with updated details

### Database Fields Used

```
appointments table:
- id (UUID)
- appointment_date (DATE)
- appointment_time (TIME)
- service_id (FK to services)
- staff_id (FK to staff)
- status (requested, accepted, confirmed, in_progress, completed, cancelled, no_show)
- full_name, email, phone
- total_amount, deposit_amount
- payment_status (pending, paid, refunded)
- notes
```

---

## 3. Gift Card Logic and Placement

### What Already Exists

| Item | Location | Status |
|------|----------|--------|
| GiftCardSystem component | `src/components/GiftCardSystem.tsx` | UI complete |
| gift_cards table | Supabase database | Schema ready |
| Shop integration | `src/pages/Shop.tsx` line 437 | Component is rendered |

### What is Missing

1. **Payment Processing** - No actual payment for buying gift cards
2. **Redemption System** - No "Apply Gift Card Code" field at checkout
3. **Backend Validation** - No Supabase functions to validate/redeem codes
4. **Email Delivery** - No system to email gift cards to recipients
5. **Admin Interface** - No way to manage/view gift cards sold

### Gift Card Database Schema (Already Exists)

```
gift_cards table:
- id (UUID)
- code (unique text like ZAVIRA-XXXXXX)
- purchaser_user_id
- recipient_email, recipient_name
- initial_balance, current_balance
- expires_at
- is_active
- message (personal message)
- used_at, used_by_user_id
```

### Where to Put Gift Cards

| Location | Purpose |
|----------|---------|
| Shop Page | Purchase gift cards (already there) |
| Booking Checkout | Add "Apply Gift Card Code" input field |
| Product Checkout | Add "Apply Gift Card Code" input field |
| Navigation Menu | Quick link to buy gift cards |
| Homepage | Promotional banner during holidays |
| Staff Dashboard | Allow staff to sell gift cards in person |

---

## 4. Implementation Plan

### Phase 1: Customer Reschedule Feature

**Files to Create:**
- `src/pages/RescheduleBooking.tsx` - New page for customer reschedule

**Files to Modify:**
- `src/App.tsx` - Add route `/reschedule/:id`
- `src/lib/email-service.ts` - Add reschedule link to confirmation emails

**Steps:**
1. Create RescheduleBooking page component
2. Add email/phone verification step
3. Reuse time slot fetching logic from Booking.tsx
4. Add UPDATE operation to appointments table
5. Send confirmation email with changes
6. Add reschedule link to booking confirmation emails

---

### Phase 2: Real-Time Staff Updates

**Files to Modify:**
- `src/hooks/useAppointments.ts` - Add real-time subscription

**Steps:**
1. Add Supabase real-time channel subscription
2. Listen for INSERT, UPDATE, DELETE on appointments table
3. Auto-refresh appointment list when changes occur
4. No manual page refresh needed

**Example Code:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('appointments-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      () => refetch()
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

---

### Phase 3: Complete Gift Card System

**Files to Create:**
- `supabase/functions/validate-gift-card/index.ts` - Validate gift card code
- `supabase/functions/redeem-gift-card/index.ts` - Apply gift card to purchase

**Files to Modify:**
- `src/pages/BookingCheckout.tsx` - Add gift card input field
- `src/pages/ShopCheckout.tsx` - Add gift card input field
- `src/components/GiftCardSystem.tsx` - Add actual payment processing
- `src/lib/email-service.ts` - Add gift card delivery email

**Steps:**
1. Create Supabase RPC functions for validation and redemption
2. Add "Apply Gift Card Code" input to checkout pages
3. Integrate gift card purchase with Square payment
4. Set up email delivery via Brevo for gift card recipients
5. Create admin view for gift card management

---

## 5. Priority Recommendation

| Priority | Feature | Reason |
|----------|---------|--------|
| HIGH | Real-time staff updates | Easy to implement, big impact |
| HIGH | Customer reschedule | Reduces support calls |
| MEDIUM | Gift card redemption | Revenue feature |
| LOW | Gift card purchase flow | Can be done manually for now |

---

## 6. Questions for You

1. Do you want customers to be able to reschedule themselves, or only through staff?

2. Should there be a time limit for rescheduling (e.g., 24 hours before appointment)?

3. For gift cards, do you want them redeemable for:
   - Services only?
   - Products only?
   - Both services and products?

4. Should gift cards have an expiration date?

5. Do you want real-time updates for staff dashboard (appointments appear instantly without refresh)?

---

Let me know which features you want me to implement first!
