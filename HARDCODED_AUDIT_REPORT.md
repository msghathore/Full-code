# Hardcoded Data Audit Report

> **Project:** Zavira Salon & Spa
> **Audit Date:** December 20, 2025
> **Auditor:** Claude Code

---

## Executive Summary

This audit identified **23+ instances** of hardcoded data that should be migrated to the Supabase database for proper data management. The most critical issue is a **wrong address** displayed on customer receipts.

### Priority Levels
- **P0 (Critical):** Wrong data displayed to customers - FIX IMMEDIATELY
- **P1 (High):** Business-critical data that changes frequently
- **P2 (Medium):** Data that should be configurable
- **P3 (Low):** Sample/demo data for development

---

## P0 - CRITICAL ISSUES

### 1. Wrong Address on Receipts
**File:** `src/components/ReceiptConfirmationModal.tsx`
**Line:** ~119
**Current Value:** `123 Beauty Street, Toronto, ON`
**Should Be:** `283 Tache Avenue, Winnipeg, MB`

```tsx
// WRONG - Line 119
<p style="margin: 5px 0;">123 Beauty Street, Toronto, ON</p>

// CORRECT
<p style="margin: 5px 0;">283 Tache Avenue, Winnipeg, MB</p>
```

**Impact:** Customers receiving receipts see completely wrong business address.
**Fix:** Replace with correct address or fetch from business settings.

---

## P1 - HIGH PRIORITY

### 2. Contact Page - Business Information
**File:** `src/pages/Contact.tsx`

| Line | Field | Hardcoded Value |
|------|-------|-----------------|
| 80-81 | Address | 283 Tache Avenue, Winnipeg, MB |
| 92 | Phone | (431) 816-3330 |
| 102 | Email | zavirasalonandspa@gmail.com |
| 113 | Hours | Daily: 8:00 AM - 11:30 PM |

**Recommendation:** Create a `business_settings` table and fetch dynamically.

### 3. Booking Time Slots
**File:** `src/pages/Booking.tsx`
**Lines:** 355-386

```typescript
// Hardcoded business hours
const businessHours = {
  start: 9,  // 9 AM
  end: 23.5  // 11:30 PM
};
```

**Recommendation:**
- Store operating hours in database
- Support different hours per day of week
- Support staff-specific availability

### 4. Privacy Policy Contact Info
**File:** `src/pages/Privacy.tsx`

Contains hardcoded:
- Email addresses
- Phone numbers
- Business address

**Recommendation:** Use same business settings as Contact page.

### 5. SEO Metadata
**File:** `src/components/SEO.tsx`

Contains hardcoded:
- Business name
- Description
- Address for schema.org markup

**Recommendation:** Fetch from centralized business settings.

### 6. Animated Menu Address
**File:** `src/components/AnimatedMenu.tsx`

Contains hardcoded address in footer/menu area.

---

## P2 - MEDIUM PRIORITY

### 7. Loyalty Program Values
**File:** `src/pages/LoyaltyProgram.tsx`

| Hardcoded Item | Value |
|----------------|-------|
| Points per dollar | Hardcoded ratio |
| Reward thresholds | Static values |
| Reward descriptions | Fixed text |

**Recommendation:** Create `loyalty_settings` and `rewards` tables.

### 8. Receipt Modal - Business Details
**File:** `src/components/ReceiptConfirmationModal.tsx`

Besides the wrong address, also contains:
- Hardcoded business name
- Hardcoded phone number
- Static thank you message

### 9. About Page Content
**File:** `src/pages/About.tsx`

| Line | Content |
|------|---------|
| 37 | "Founded in 2020" |
| 37-40 | Company description |
| 45-49 | Philosophy text |
| 54-71 | "Why Choose Us" list |

**Recommendation:** Consider CMS integration for marketing content.

---

## P3 - LOW PRIORITY (Sample Data)

### 10. Reports - Sample Analytics
**File:** `src/pages/Reports.tsx`

Contains sample revenue data, metrics, and analytics for demonstration.

### 11. Staff Analytics - Demo Data
**File:** `src/pages/staff/StaffAnalytics.tsx`

Contains sample performance metrics and statistics.

### 12. Staff Dashboard - Demo Data
**File:** `src/pages/staff/StaffDashboard.tsx`

Contains sample dashboard widgets with demo data.

### 13. Customers Management - Fake Customers
**File:** `src/pages/CustomersManagement.tsx`

Contains sample customer list with fake names and data.

---

## Database Schema Recommendations

### New Table: `business_settings`
```sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data
INSERT INTO business_settings (setting_key, setting_value) VALUES
  ('business_name', 'Zavira Salon & Spa'),
  ('address', '283 Tache Avenue, Winnipeg, MB, Canada'),
  ('phone', '(431) 816-3330'),
  ('email', 'zavirasalonandspa@gmail.com'),
  ('timezone', 'America/Winnipeg'),
  ('founded_year', '2020');
```

### New Table: `operating_hours`
```sql
CREATE TABLE operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data (Daily 8 AM - 11:30 PM)
INSERT INTO operating_hours (day_of_week, open_time, close_time) VALUES
  (0, '08:00', '23:30'),
  (1, '08:00', '23:30'),
  (2, '08:00', '23:30'),
  (3, '08:00', '23:30'),
  (4, '08:00', '23:30'),
  (5, '08:00', '23:30'),
  (6, '08:00', '23:30');
```

### New Table: `loyalty_rewards`
```sql
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Roadmap

### Phase 1: Critical Fix (Immediate)
1. Fix wrong address in ReceiptConfirmationModal.tsx
2. Create `business_settings` table
3. Update Contact.tsx to fetch from database

### Phase 2: Business Hours (1-2 days)
1. Create `operating_hours` table
2. Update Booking.tsx to use dynamic hours
3. Add admin UI to manage hours

### Phase 3: Content Migration (3-5 days)
1. Create content management structure
2. Migrate About page content
3. Migrate Privacy policy content
4. Update SEO component

### Phase 4: Features (1 week)
1. Create loyalty rewards table
2. Build admin interface for rewards
3. Remove sample data from production

---

## Files Requiring Changes

| File | Priority | Changes Needed |
|------|----------|----------------|
| `ReceiptConfirmationModal.tsx` | P0 | Fix address, add DB fetch |
| `Contact.tsx` | P1 | Fetch from business_settings |
| `Booking.tsx` | P1 | Fetch from operating_hours |
| `Privacy.tsx` | P1 | Fetch contact info |
| `SEO.tsx` | P1 | Fetch metadata |
| `AnimatedMenu.tsx` | P1 | Fetch address |
| `LoyaltyProgram.tsx` | P2 | Create rewards system |
| `About.tsx` | P2 | Consider CMS |
| `Reports.tsx` | P3 | Replace with real data |
| `StaffAnalytics.tsx` | P3 | Replace with real data |
| `StaffDashboard.tsx` | P3 | Replace with real data |
| `CustomersManagement.tsx` | P3 | Fetch from customers table |

---

## Verification Checklist

After implementing fixes:
- [ ] Receipt shows correct address (283 Tache Avenue, Winnipeg, MB)
- [ ] Contact page pulls from database
- [ ] Booking uses dynamic business hours
- [ ] SEO schema.org has correct address
- [ ] Privacy policy has correct contact info
- [ ] Admin can update business settings

---

## Appendix: Search Patterns Used

```bash
# Phone numbers
grep -rn "(431)" src/
grep -rn "816-3330" src/

# Email addresses
grep -rn "zavirasalonandspa" src/

# Addresses
grep -rn "Tache Avenue" src/
grep -rn "Beauty Street" src/
grep -rn "Toronto" src/

# Business hours
grep -rn "8:00 AM" src/
grep -rn "11:30 PM" src/

# Prices (sample data indicator)
grep -rn '\$[0-9]' src/
```

---

*Report generated by Claude Code on December 20, 2025*
