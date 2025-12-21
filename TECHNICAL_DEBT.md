# TECHNICAL_DEBT.md - Hardcoded Data Audit

> **Audit Date:** December 20, 2025
> **Status:** Needs Migration to Database

This document tracks all instances of hardcoded data that should be fetched dynamically from the Supabase database.

---

## Critical Issues

### Wrong/Outdated Information

| File | Issue | Line(s) | Priority |
|------|-------|---------|----------|
| `ReceiptConfirmationModal.tsx` | **WRONG ADDRESS** - Shows "123 Beauty Street, Toronto, ON" instead of real Winnipeg address | ~119 | 🔴 HIGH |
| `Contact.tsx` | Hardcoded address, phone, email, hours | 80-114 | 🔴 HIGH |
| `Privacy.tsx` | Hardcoded email and phone | Multiple | 🟡 MEDIUM |
| `AnimatedMenu.tsx` | Hardcoded address | Multiple | 🟡 MEDIUM |
| `SEO.tsx` | Hardcoded business metadata | Multiple | 🟡 MEDIUM |

### Business Hours

| File | Issue | Line(s) | Priority |
|------|-------|---------|----------|
| `Booking.tsx` | Hardcoded time slots (9 AM - 11:30 PM) | 355-386 | 🔴 HIGH |
| `Contact.tsx` | Hardcoded hours "Daily: 8:00 AM - 11:30 PM" | Multiple | 🔴 HIGH |

**Problem:** Business hours should be:
- Stored in `business_settings` table
- Different for different staff members
- Configurable by admin
- Account for holidays/special hours

### Service Pricing Data

| File | Issue | Priority |
|------|-------|----------|
| `Reports.tsx` | Sample revenue/analytics data | 🟡 MEDIUM |
| `StaffAnalytics.tsx` | Sample analytics data | 🟡 MEDIUM |
| `StaffDashboard.tsx` | Sample dashboard data | 🟡 MEDIUM |

**Problem:** Should fetch from `services` table for real pricing.

### Loyalty Program

| File | Issue | Priority |
|------|-------|----------|
| `LoyaltyProgram.tsx` | Hardcoded point values and rewards | 🟡 MEDIUM |

**Problem:** Point values and rewards should be configurable in database.

### Customer Data

| File | Issue | Priority |
|------|-------|----------|
| `CustomersManagement.tsx` | Sample customer list with fake data | 🔴 HIGH |

**Problem:** Should fetch from `customers` table.

---

## Migration Strategy

### Phase 1: Critical Fixes (Week 1)

1. **Create `business_settings` table:**
```sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  hours_open TIME NOT NULL,
  hours_close TIME NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Fix critical files:**
   - `ReceiptConfirmationModal.tsx` - Use real address
   - `Contact.tsx` - Fetch from `business_settings`
   - `Booking.tsx` - Fetch time slots dynamically
   - `CustomersManagement.tsx` - Fetch from `customers` table

### Phase 2: Analytics & Reporting (Week 2)

3. **Fix analytics files:**
   - `Reports.tsx` - Calculate from actual `appointments` and `services` data
   - `StaffAnalytics.tsx` - Calculate from real data
   - `StaffDashboard.tsx` - Calculate from real data

### Phase 3: Configuration & Polish (Week 3)

4. **Make configurable:**
   - `LoyaltyProgram.tsx` - Add `loyalty_settings` table
   - `Privacy.tsx` - Fetch contact info from `business_settings`
   - `AnimatedMenu.tsx` - Fetch address from `business_settings`
   - `SEO.tsx` - Fetch metadata from `business_settings`

---

## Database Tables Needed

### `business_settings` (NEW - Priority 1)

Stores core business information:
- Name, address, contact info
- Operating hours
- Timezone
- Social media links
- SEO metadata

### `staff_schedules` (NEW - Priority 2)

Stores staff-specific working hours:
- Staff ID
- Day of week
- Start time, end time
- Override for holidays/special days

### `loyalty_settings` (NEW - Priority 3)

Stores loyalty program configuration:
- Points per dollar spent
- Reward tiers
- Redemption rules

---

## Implementation Checklist

### For Each Hardcoded File:

- [ ] Identify hardcoded values
- [ ] Create/verify database table exists
- [ ] Write migration if needed
- [ ] Create React Query hook for fetching
- [ ] Replace hardcoded values with dynamic fetch
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real data
- [ ] Verify on all pages
- [ ] Update TypeScript types
- [ ] Add admin UI for editing (if applicable)

---

## Example Migration

### Before (Hardcoded):
```typescript
// Contact.tsx
const businessInfo = {
  address: "283 Tache Avenue, Winnipeg, MB",
  phone: "(431) 816-3330",
  email: "zavirasalonandspa@gmail.com",
  hours: "Daily: 8:00 AM - 11:30 PM"
};
```

### After (Dynamic):
```typescript
// Contact.tsx
const { data: businessInfo, isLoading } = useQuery({
  queryKey: ['business-settings'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
});

if (isLoading) return <Skeleton />;
```

---

## Testing Checklist

After migration:
- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] Loading states work
- [ ] Error states handled gracefully
- [ ] No hardcoded values remain
- [ ] Admin can edit settings
- [ ] Changes reflect immediately
- [ ] Mobile view works
- [ ] TypeScript types correct
- [ ] E2E tests pass

---

## Notes

- Always invoke `NoHardcodedDataSkill.md` when working on any feature
- Check this file before starting new components
- Update this file when discovering new hardcoded data
- Mark items as completed when fixed

---

**Last Updated:** December 21, 2025
