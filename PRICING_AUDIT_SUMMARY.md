# Zavira Pricing Audit - Executive Summary

**Date:** December 26, 2025
**Status:** 🟡 Medium Risk - Action Required

---

## 🎯 Key Findings

### ✅ What's Working Well

1. **Database Structure is Solid**
   - All variant services have proper pricing
   - Parent-child service architecture works correctly
   - Pricing tiers ($25-$500 range) properly configured

2. **Main Customer-Facing Pages**
   - Services page displays prices correctly from database
   - Booking flow calculates totals accurately
   - ServiceTiersDisplay component works properly

### ⚠️ Issues Requiring Immediate Attention

#### 1. Hardcoded Prices in Admin Dialogs 🔴 HIGH PRIORITY

**Files affected:**
- `src/components/EditAppointmentDialog.tsx` (Lines 63-72)
- `src/components/RebookAppointmentDialog.tsx` (Lines 62-71)

**Problem:**
```typescript
// These use HARDCODED prices instead of database
const MOCK_SERVICES = [
  { value: 'Hair Cut & Style', price: 65 },  // Wrong!
  { value: 'Manicure', price: 40 },          // Doesn't match DB ($35)
  { value: 'Pedicure', price: 55 },          // Doesn't match DB ($45)
  // ...
];
```

**Impact:** Staff editing/rebooking appointments see incorrect prices

**Fix:** Replace with database fetch from `services` table

---

#### 2. Division-by-Zero Risk 🟡 MEDIUM PRIORITY

**File:** `src/components/PriceAnchoring.tsx` (Line 32)

**Problem:**
```typescript
const savingsPercentage = Math.round((savings / regularPrice) * 100);
// If regularPrice = 0 → NaN or Infinity
```

**Impact:** If parent service (price=$0) passed in, displays "NaN% OFF"

**Fix:** Add validation
```typescript
const savingsPercentage = regularPrice > 0
  ? Math.round((savings / regularPrice) * 100)
  : 0;
```

---

#### 3. Silent Price Fallbacks 🟡 MEDIUM PRIORITY

**Multiple files use:**
```typescript
return sum + (service?.price || 0);
```

**Problem:** If service is missing, silently adds $0 instead of warning

**Files affected:**
- `src/pages/Booking.tsx` (Lines 800, 823, 881)
- `src/pages/GroupBooking.tsx` (Lines 141, 148)
- `src/components/CreateAppointmentDialog.tsx` (Line 577)
- 3 more files

**Impact:** Could mask data integrity issues, incorrect totals

**Fix:** Add logging
```typescript
if (!service) {
  console.error(`Service ${serviceId} not found - price may be incorrect`);
}
return sum + (service?.price || 0);
```

---

## 📋 Quick Action Checklist

### Critical (Fix Now)
- [ ] Replace hardcoded MOCK_SERVICES in EditAppointmentDialog
- [ ] Replace hardcoded MOCK_SERVICES in RebookAppointmentDialog
- [ ] Add division-by-zero protection in PriceAnchoring

### Important (Fix This Week)
- [ ] Add error logging for missing service fallbacks
- [ ] Add price validation in ServicesManagement (warn if $0 for non-parent)
- [ ] Document 30% markup pricing strategy in CLAUDE.md

### Nice to Have (Future)
- [ ] Add `regular_price` column to services table
- [ ] Create E2E pricing tests
- [ ] Implement pricing history tracking

---

## 💡 Database Pricing Architecture

**Parent Services** (Headers - $0 price)
```
Women's Haircut → $0.00
  ├─ Short Hair → $65.00
  ├─ Medium Hair → $75.00
  └─ Long Hair → $85.00
```

**Standalone Services** (Direct pricing)
```
Ear Piercing → $40.00
Body Piercing → $60.00
```

**✅ This structure is correct and working as designed**

---

## 🎨 Price Display Strategy

**Current approach:**
```typescript
regularPrice = currentPrice * 1.3  // 30% markup
```

**Example:**
- Service actual price: $100
- Shows as "Regular: $130" (crossed out)
- Shows as "Member Price: $100"
- Badge: "Save $30 (23% OFF)"

**Question:** Is $130 a real price or artificial anchor?

**Recommendation:** Document this pricing strategy or switch to database-driven regular prices

---

## 📊 Component Risk Matrix

| Component | Risk | Issue | Priority |
|-----------|------|-------|----------|
| EditAppointmentDialog | 🔴 High | Hardcoded prices | Fix now |
| RebookAppointmentDialog | 🔴 High | Hardcoded prices | Fix now |
| PriceAnchoring | 🟡 Medium | Div by zero | Fix now |
| Booking.tsx | 🟡 Medium | Silent fallbacks | Add logging |
| ServiceRecommendations | 🟡 Low | Mock data (demo only) | Low priority |
| Services.tsx | 🟢 Low | Working correctly | No action |
| ServiceTiersDisplay | 🟢 Low | Working correctly | No action |

---

## 📈 Sample Pricing from Database

| Service | Category | Price | Type |
|---------|----------|-------|------|
| Classic Manicure | Nails | $35.00 | Variant |
| Gel Manicure | Nails | $50.00 | Variant |
| Classic Pedicure | Nails | $45.00 | Variant |
| Short Hair (Women) | Hair | $65.00 | Variant |
| Medium Hair (Women) | Hair | $75.00 | Variant |
| Signature Facial | Skin | $95.00 | Variant |
| Swedish Massage (60min) | Massage | $95.00 | Variant |
| Eyebrow Wax | Waxing | $25.00 | Variant |

**All variant prices are correct in database ✅**

---

## 🔧 Code Examples for Fixes

### Fix 1: Replace MOCK_SERVICES
```typescript
// BEFORE (EditAppointmentDialog.tsx)
const MOCK_SERVICES = [
  { value: 'Manicure', price: 40 },
];

// AFTER
const { data: services } = useQuery({
  queryKey: ['services'],
  queryFn: async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);
    return data;
  }
});
```

### Fix 2: Division Protection
```typescript
// BEFORE (PriceAnchoring.tsx)
const savingsPercentage = Math.round((savings / regularPrice) * 100);

// AFTER
const savingsPercentage = regularPrice > 0
  ? Math.round((savings / regularPrice) * 100)
  : 0;
```

### Fix 3: Add Logging
```typescript
// BEFORE (Booking.tsx)
return sum + (service?.price || 0);

// AFTER
const price = service?.price || 0;
if (!service) {
  console.warn(`Service ID ${serviceId} not found in database`);
}
return sum + price;
```

---

## 📞 Next Steps

1. **Review this summary** with development team
2. **Prioritize fixes** based on risk level
3. **Test thoroughly** after implementing fixes
4. **Verify** no services show $0 incorrectly

**Full details:** See `PRICING_AUDIT_REPORT.md`

---

**Report prepared by:** Claude Code Autonomous Analysis
**Review recommended by:** Project maintainers before next deployment
