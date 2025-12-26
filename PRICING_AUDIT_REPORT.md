# 🔍 Zavira Pricing Audit Report

**Generated:** 2025-12-26
**Auditor:** Claude Code Analysis
**Scope:** Complete service pricing structure and display logic

---

## 📋 Executive Summary

This audit reviewed all service-related pricing across the Zavira Front-End application, including database structure, component logic, and display mechanisms.

### Key Findings:
- ✅ **Database pricing structure is solid** - All variant services have proper prices
- ⚠️ **Parent services have $0 prices by design** - This is intentional but could be confusing
- ⚠️ **Price display logic uses fallbacks** - Multiple `|| 0` fallbacks throughout codebase
- ⚠️ **Price calculation has safety checks** - Good defensive programming, but indicates possible trust issues

### Risk Level: **MEDIUM** ⚠️

---

## 🏗️ Database Structure Analysis

### Services Table Schema

**Location:** `supabase/migrations/20251222000001_seed_services_with_variants.sql`

#### Parent-Child Service Architecture

The database implements a **variant-based pricing model**:

1. **Parent Services** (`is_parent = true`)
   - Act as category headers
   - Have `price = 0.00` by design
   - Examples:
     - "Women's Haircut" → $0.00
     - "Manicure" → $0.00
     - "Facial Treatments" → $0.00

2. **Variant Services** (`parent_service_id` set)
   - Contain actual pricing
   - Examples:
     - "Short Hair" (under Women's Haircut) → $65.00
     - "Gel Manicure" → $50.00
     - "Anti-Aging Facial" → $135.00

3. **Standalone Services**
   - Have pricing directly
   - Examples:
     - "Ear Piercing" → $40.00
     - "Body Piercing" → $60.00

### ✅ Sample Database Prices (from migration seed data)

| Category | Service Name | Price | Type |
|----------|-------------|-------|------|
| Hair | Women's Haircut | $0.00 | Parent |
| Hair | Short Hair (variant) | $65.00 | Variant |
| Hair | Medium Hair (variant) | $75.00 | Variant |
| Hair | Long Hair (variant) | $85.00 | Variant |
| Nails | Manicure | $0.00 | Parent |
| Nails | Classic Manicure | $35.00 | Variant |
| Nails | Gel Manicure | $50.00 | Variant |
| Skin | Facial Treatments | $0.00 | Parent |
| Skin | Signature Facial | $95.00 | Variant |
| Skin | Deep Cleansing Facial | $110.00 | Variant |
| Massage | Massage Therapy | $0.00 | Parent |
| Massage | Swedish Massage (60 min) | $95.00 | Variant |
| Waxing | Facial Waxing | $0.00 | Parent |
| Waxing | Eyebrow Wax | $25.00 | Variant |
| Piercing | Ear Piercing | $40.00 | Standalone |
| Piercing | Body Piercing | $60.00 | Standalone |

**✅ FINDING:** All variant services have proper non-zero prices. Parent services are intentionally $0.

---

## 💻 Component Price Display Analysis

### 1. Services Page (`src/pages/Services.tsx`)

**Lines 279-293:** Price display for variants
```typescript
<PriceAnchoring
  regularPrice={variant.price * 1.3} // 30% markup for regular price
  currentPrice={variant.price}
  size="sm"
  badgeText="MEMBER PRICE"
  className="flex-1"
/>
```

**Lines 317-323:** Price display for standalone services
```typescript
<PriceAnchoring
  regularPrice={group.parent.price * 1.3} // 30% markup for regular price
  currentPrice={group.parent.price}
  size="sm"
  badgeText="MEMBER PRICE"
  className="flex-1"
/>
```

#### ⚠️ ISSUE IDENTIFIED:
**Parent services are filtered out correctly** - The code only displays:
- Variants (children of parents) → Show actual variant prices
- Standalone services → Show service price

**However:** If a parent service is accidentally displayed as standalone, it would show $0.

**Lines 140-154:** Logic handles this correctly:
```typescript
const standalone = categoryServices.filter(s => !s.is_parent && !s.parent_service_id);
```

✅ **VERDICT:** Services page displays pricing correctly.

---

### 2. Booking Page (`src/pages/Booking.tsx`)

**Multiple price calculation functions use fallbacks:**

**Line 800:** Single member service total
```typescript
return sum + (service?.price || 0);
```

**Line 823:** Group member service total
```typescript
return memberSum + (service?.price || 0);
```

**Line 881:** Selected services total
```typescript
return total + (service?.price || 0);
```

#### ⚠️ ISSUE IDENTIFIED:
**Why the fallback `|| 0`?**
- Defensive programming in case `service` is undefined
- Protects against missing service IDs in database
- **BUT:** Could mask real issues if services are deleted

**Recommendation:** Add logging when fallback is used:
```typescript
const service = services.find(s => s.id === serviceId);
if (!service) {
  console.warn(`Service ID ${serviceId} not found in database`);
}
return sum + (service?.price || 0);
```

---

### 3. Price Anchoring Component (`src/components/PriceAnchoring.tsx`)

**Lines 23-32:** Component receives prices as props
```typescript
export const PriceAnchoring = ({
  regularPrice,
  currentPrice,
  // ...
}) => {
  const savings = regularPrice - currentPrice;
  const savingsPercentage = Math.round((savings / regularPrice) * 100);
```

#### ⚠️ ISSUE IDENTIFIED:
**Division by zero risk** if `regularPrice = 0`:
```typescript
const savingsPercentage = Math.round((savings / regularPrice) * 100);
// If regularPrice = 0 → NaN or Infinity
```

**Example scenario:**
- Parent service accidentally passed to PriceAnchoring
- regularPrice = 0
- Result: NaN% savings badge

**Recommendation:** Add validation:
```typescript
const savingsPercentage = regularPrice > 0
  ? Math.round((savings / regularPrice) * 100)
  : 0;
```

---

### 4. Hardcoded Service Prices

**Found in multiple components:**

#### `src/components/ServiceRecommendations.tsx` (Lines 41-96)
```typescript
const allServices: Service[] = [
  {
    id: 'hair-styling',
    name: 'Hair Styling',
    price: 85, // HARDCODED
  },
  {
    id: 'nail-care',
    name: 'Nail Care',
    price: 45, // HARDCODED
  },
  // ... more hardcoded services
];
```

#### ⚠️ CRITICAL ISSUE:
**Mock data instead of database fetch!**
- These prices are NOT from the database
- Will become outdated if real prices change
- Component doesn't fetch from Supabase

**Impact:** Low (feature appears to be demo/placeholder)

---

#### `src/components/EditAppointmentDialog.tsx` (Lines 63-72)
```typescript
const MOCK_SERVICES = [
  { value: 'Hair Cut & Style', price: 65 },
  { value: 'Manicure', price: 40 },
  { value: 'Pedicure', price: 55 },
  { value: 'Facial Treatment', price: 120 },
  // ... more hardcoded
];
```

#### ⚠️ CRITICAL ISSUE:
**Dialog uses mock data!**
- Should fetch from `services` table
- Prices don't match migration seed data:
  - Mock: "Manicure" → $40
  - Database: "Classic Manicure" → $35
  - Mock: "Pedicure" → $55
  - Database: "Classic Pedicure" → $45

**Impact:** Medium (affects appointment editing)

---

#### `src/components/RebookAppointmentDialog.tsx` (Lines 62-71)
**Same issue as EditAppointmentDialog** - uses hardcoded mock services.

---

### 5. Services Management Admin Panel

**File:** `src/pages/ServicesManagement.tsx`

**Lines 29 & 69:** Default price value
```typescript
price: 0,
```

#### ℹ️ OBSERVATION:
Default price of 0 when creating new service is acceptable for:
- Parent services (intentional $0)
- Incomplete forms (admin will fill in)

**However:** Should warn admin if creating a non-parent service with $0 price.

---

## 🎯 Pricing Tiers System

**Location:** `supabase/migrations/20251226000010_create_pricing_tiers_retry.sql`

### Tier Structure

| Tier | Price Range | Example Services |
|------|-------------|------------------|
| Basic | $25 - $75 | Basic Manicure ($25), Basic Pedicure ($35) |
| Premium | $75 - $150 | Deluxe Manicure ($75), Premium Cut ($95) |
| Luxury | $150 - $500 | Microblading ($400), Full PMU ($500) |

**Component:** `src/components/hormozi/ServiceTiersDisplay.tsx`

**Lines 26-37:** Fetches from database
```typescript
const { data: tiers, isLoading } = useQuery({
  queryKey: ['pricing-tiers'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .order('tier_level', { ascending: true});

    if (error) throw error;
    return data as ServiceTier[];
  }
});
```

**Lines 218-226:** Price display
```typescript
<div className="flex items-baseline gap-2">
  <span className="text-4xl font-bold text-white">
    ${tier.min_price.toFixed(0)}
  </span>
  <span className="text-white/60">-</span>
  <span className="text-4xl font-bold text-white">
    ${tier.max_price.toFixed(0)}
  </span>
</div>
```

✅ **VERDICT:** Pricing tiers display correctly from database.

---

## 🔍 Potential Price Calculation Issues

### Issue 1: Optional Chaining with Fallback

**Pattern found throughout codebase:**
```typescript
service?.price || 0
```

**Files affected:**
- `src/pages/Booking.tsx` (Lines 800, 823, 881)
- `src/pages/GroupBooking.tsx` (Lines 141, 148)
- `src/pages/VagaroSchedule.tsx` (Lines 87, 220)
- `src/components/CreateAppointmentDialog.tsx` (Line 577)
- `src/components/EditAppointmentDialog.tsx` (Line 173)
- `src/components/RebookAppointmentDialog.tsx` (Line 161)

**Why this matters:**
1. **Masks database integrity issues** - If service IDs are invalid, calculation silently uses $0
2. **No error reporting** - User sees incorrect total, no warning shown
3. **Could affect revenue** - Undercounting if services are missing

**Recommendation:**
```typescript
// BEFORE (current)
const total = services.reduce((sum, id) => {
  const service = services.find(s => s.id === id);
  return sum + (service?.price || 0);
}, 0);

// AFTER (improved)
const total = services.reduce((sum, id) => {
  const service = services.find(s => s.id === id);
  if (!service) {
    console.error(`Service ${id} not found - price calculation may be incorrect`);
    // Optionally: throw error or show user warning
  }
  return sum + (service?.price || 0);
}, 0);
```

---

### Issue 2: Price Markup Calculation

**File:** `src/pages/Services.tsx`
**Lines:** 280, 318

```typescript
regularPrice={variant.price * 1.3} // 30% markup for regular price
```

**Questions:**
1. Is this 30% markup documented?
2. Where is this discount policy defined?
3. Should this be configurable (admin setting)?

**Current behavior:**
- Service price: $100
- "Regular price" shown: $130 (crossed out)
- "Member price" shown: $100
- Badge: "Save $30 (23% OFF)"

**Is this misleading?**
- Depends on whether "$130" is a real price or artificial anchor
- If services are never sold at $130, this could be considered misleading pricing

**Recommendation:**
- Document the pricing strategy in CLAUDE.md
- Consider fetching "regular price" from database instead of calculating
- Add `regular_price` column to services table

---

### Issue 3: Parent Service Display Risk

**Scenario:** Parent service accidentally displayed without variants

**File:** `src/pages/Services.tsx` (Lines 296-332)

**Current code:**
```typescript
{group.variants.length > 0 ? (
  // Show variants with prices
  group.variants.map((variant) => (
    <PriceAnchoring currentPrice={variant.price} />
  ))
) : (
  // Show standalone service
  <PriceAnchoring currentPrice={group.parent.price} />
)}
```

**Risk:**
If `group.parent` is a parent service (price = $0), standalone display would show $0.

**Current mitigation:**
```typescript
const standalone = categoryServices.filter(s => !s.is_parent && !s.parent_service_id);
```

✅ **VERDICT:** Risk is mitigated by filtering logic.

---

## 🛠️ Recommendations

### Priority 1: Critical Fixes

1. **Replace hardcoded prices in dialogs**
   - `EditAppointmentDialog.tsx`
   - `RebookAppointmentDialog.tsx`
   - Fetch from database instead of mock data

2. **Add price validation in ServiceManagement**
   - Warn if non-parent service has $0 price
   - Validate price > 0 for bookable services

3. **Fix division-by-zero in PriceAnchoring**
   - Handle `regularPrice = 0` case
   - Prevent NaN/Infinity in savings percentage

### Priority 2: Code Quality Improvements

4. **Add error logging for missing services**
   - Log when `service?.price || 0` fallback is used
   - Help diagnose data integrity issues

5. **Document pricing markup strategy**
   - Add to CLAUDE.md or separate pricing docs
   - Explain 30% "regular price" markup

6. **Consider database-driven regular pricing**
   - Add `regular_price` column to services
   - Remove hardcoded 1.3x multiplier

### Priority 3: Future Enhancements

7. **Add pricing history tracking**
   - Track price changes over time
   - Useful for analytics and refunds

8. **Implement dynamic pricing rules**
   - Holiday pricing
   - Promotional discounts
   - Member-only pricing

9. **Create pricing validation tests**
   - E2E tests for checkout flow
   - Verify totals calculate correctly

---

## 📊 Pricing Consistency Matrix

| Component | Data Source | Price Accuracy | Risk Level |
|-----------|-------------|----------------|------------|
| Services Page | ✅ Database | ✅ Accurate | 🟢 Low |
| ServiceTiersDisplay | ✅ Database | ✅ Accurate | 🟢 Low |
| Booking Page | ✅ Database | ✅ Accurate | 🟡 Medium (fallbacks) |
| EditAppointmentDialog | ❌ Hardcoded | ❌ Outdated | 🔴 High |
| RebookAppointmentDialog | ❌ Hardcoded | ❌ Outdated | 🔴 High |
| ServiceRecommendations | ❌ Hardcoded | ❌ Mock data | 🟡 Medium (demo only) |
| PriceAnchoring | ✅ Props | ⚠️ Calculation risk | 🟡 Medium (div by 0) |
| ServicesManagement | ✅ Database | ✅ Accurate | 🟡 Medium (no validation) |

---

## 🎯 Action Items Summary

### Immediate Actions (Fix in next deployment)
- [ ] Replace MOCK_SERVICES in EditAppointmentDialog with database fetch
- [ ] Replace MOCK_SERVICES in RebookAppointmentDialog with database fetch
- [ ] Add division-by-zero protection in PriceAnchoring component

### Short-term Actions (Fix within 1-2 weeks)
- [ ] Add error logging when service?.price || 0 fallback is triggered
- [ ] Add price validation in ServicesManagement admin panel
- [ ] Document pricing markup strategy in CLAUDE.md

### Long-term Actions (Consider for future releases)
- [ ] Add regular_price column to services table
- [ ] Implement pricing history tracking
- [ ] Create E2E tests for pricing calculations

---

## 📝 Conclusion

The Zavira pricing system is **generally well-structured** with proper database architecture. The main issues are:

1. **Hardcoded prices in dialogs** - Critical issue affecting data accuracy
2. **Defensive fallbacks** - Good practice but could mask real problems
3. **Price anchoring risks** - Mathematical edge cases need handling

**Overall Risk Assessment:** 🟡 **MEDIUM**

**Recommended Next Steps:**
1. Fix the 3 critical issues (dialogs + division-by-zero)
2. Add better error reporting/logging
3. Document pricing strategy

---

**Generated by:** Claude Code Autonomous Analysis
**Date:** December 26, 2025
**Version:** 1.0
