# ✅ Hormozi Integration Fix Checklist

**Quick Reference Guide for Fixing Broken Integrations**

---

## 🔥 Critical Fixes (Must Do First)

### 1. Create Packages Table
- [ ] **File:** `supabase/migrations/YYYYMMDD_create_grand_slam_packages.sql`
- [ ] **Schema:** Match GrandSlamOffers.tsx interface
- [ ] **Seed Data:** Add sample packages (Hair Transformation, etc.)
- [ ] **Apply Migration:** Run `npx supabase db push`

**Schema Template:**
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  regular_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  savings_percentage INTEGER NOT NULL,
  included_services TEXT[] NOT NULL,
  -- ... (see full schema in main report)
);
```

---

### 2. Create Promo Code System
- [ ] **Table:** `promo_codes`
- [ ] **Table:** `promo_code_redemptions`
- [ ] **Seed:** Create `WELCOME20` promo code
- [ ] **UI:** Add promo code input in `Booking.tsx`
- [ ] **Logic:** Add validation function

**Quick Implementation:**
```typescript
// Booking.tsx - Add state
const [promoCode, setPromoCode] = useState('');
const [appliedPromo, setAppliedPromo] = useState(null);

// Add input field
<Input
  placeholder="Promo Code"
  value={promoCode}
  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
/>
<Button onClick={() => validatePromoCode(promoCode)}>
  Apply
</Button>
```

---

### 3. Fix Grand Slam Package Navigation
- [ ] **File:** `src/components/hormozi/GrandSlamOffers.tsx`
- [ ] **Change:** Line 89 - Pass package data
- [ ] **Update:** Navigation to include params

**Before:**
```typescript
onBook={() => navigate('/booking')}
```

**After:**
```typescript
onBook={() => {
  localStorage.setItem('selectedPackage', JSON.stringify(pkg));
  navigate(`/booking?package=${pkg.slug}`);
}}
```

---

### 4. Add Package Detection in Booking
- [ ] **File:** `src/pages/Booking.tsx`
- [ ] **Add:** useEffect to check URL params
- [ ] **Add:** Auto-select services from package
- [ ] **Add:** Apply package discount

**Implementation:**
```typescript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const packageSlug = params.get('package');

  if (packageSlug) {
    const pkg = JSON.parse(localStorage.getItem('selectedPackage'));
    setSelectedServices(pkg.included_services);
    setPackageDiscount(pkg.discounted_price);
    // Show banner: "Package applied!"
  }
}, [location.search]);
```

---

### 5. Add Exit Intent Discount Redemption
- [ ] **File:** `src/pages/Booking.tsx`
- [ ] **Add:** Check localStorage on mount
- [ ] **Add:** Auto-apply 20% discount
- [ ] **Add:** Auto-fill email field

**Implementation:**
```typescript
useEffect(() => {
  const exitEmail = localStorage.getItem('exit_intent_email');
  if (exitEmail) {
    setPromoCode('WELCOME20');
    validatePromoCode('WELCOME20');
    setEmail(exitEmail);
    toast({ title: 'Your 20% discount has been applied!' });
    localStorage.removeItem('exit_intent_email');
  }
}, []);
```

---

## ⚠️ High Priority Fixes

### 6. Store Upsell Discount Metadata
- [ ] **File:** `src/components/BookingUpsells.tsx`
- [ ] **Change:** Line 209 - Pass discount object instead of just ID
- [ ] **File:** `src/pages/Booking.tsx`
- [ ] **Update:** Store discount with service

**Before:**
```typescript
onAddService={(serviceId) => {
  setSelectedServices([...selectedServices, serviceId]);
}}
```

**After:**
```typescript
onAddService={(serviceData) => {
  setSelectedServices([...selectedServices, {
    id: serviceData.serviceId,
    discount: serviceData.discount,
    finalPrice: serviceData.discountedPrice
  }]);
}}
```

---

### 7. Update Cart Calculation
- [ ] **File:** `src/lib/posCalculations.ts`
- [ ] **Add:** Discount calculation logic
- [ ] **Handle:** Promo codes
- [ ] **Handle:** Upsell discounts
- [ ] **Handle:** Package pricing

**Add to calculateTotals:**
```typescript
export const calculateTotals = (
  cartItems: CartItem[],
  paymentMethods: PaymentMethod[],
  tipAmount: number,
  promoCode?: PromoCode,  // NEW
  packageDiscount?: number // NEW
) => {
  // ... existing logic

  // Apply promo code discount
  if (promoCode) {
    discount = promoCode.discount_type === 'percentage'
      ? subtotal * (promoCode.discount_value / 100)
      : promoCode.discount_value;
  }

  // Apply package discount
  if (packageDiscount) {
    subtotal = packageDiscount;
  }

  return { subtotal, discount, total: subtotal - discount };
};
```

---

### 8. Add Promo Code Input Field
- [ ] **File:** `src/pages/CheckoutPage.tsx`
- [ ] **Add:** State for promo code
- [ ] **Add:** Input field in UI
- [ ] **Add:** Validation function

**UI Addition:**
```typescript
<div className="flex gap-2">
  <Input
    placeholder="Promo Code"
    value={promoCode}
    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
  />
  <Button onClick={validatePromoCode}>Apply</Button>
</div>

{appliedPromo && (
  <div className="bg-emerald-500/20 p-2 rounded">
    ✓ {appliedPromo.code} applied - Save ${discount}
  </div>
)}
```

---

## 📊 Medium Priority Fixes

### 9. Enforce Countdown Timer Expiry
- [ ] **File:** `src/components/hormozi/GrandSlamOffers.tsx`
- [ ] **Add:** Check package `expires_at` before booking
- [ ] **Add:** Disable button if expired

**Implementation:**
```typescript
const isExpired = pkg.expires_at && new Date(pkg.expires_at) < new Date();

<Button
  onClick={onBook}
  disabled={isExpired}
  className={isExpired ? 'opacity-50 cursor-not-allowed' : ''}
>
  {isExpired ? 'OFFER EXPIRED' : 'CLAIM THIS OFFER NOW'}
</Button>
```

---

### 10. Track Limited Spots Inventory
- [ ] **File:** `src/components/hormozi/GrandSlamOffers.tsx`
- [ ] **Add:** Decrement `remaining_quantity` on booking
- [ ] **Add:** Disable booking when sold out

**Implementation:**
```typescript
const handleBooking = async () => {
  // Decrement remaining quantity
  await supabase
    .from('packages')
    .update({ remaining_quantity: pkg.remaining_quantity - 1 })
    .eq('id', pkg.id);

  navigate(`/booking?package=${pkg.slug}`);
};
```

---

### 11. Lead Magnet Follow-Up Offers
- [ ] **File:** Edge Function or Backend
- [ ] **Add:** Generate welcome promo after download
- [ ] **Add:** Email promo code to lead

---

## 🧪 Testing Checklist

### Exit Intent Flow
- [ ] User triggers exit intent popup
- [ ] User enters email and claims offer
- [ ] Navigate to `/booking`
- [ ] Verify 20% discount auto-applied
- [ ] Verify email auto-filled
- [ ] Complete booking
- [ ] Verify final price is 20% off

### Grand Slam Package Flow
- [ ] User clicks "CLAIM THIS OFFER NOW"
- [ ] Verify navigation to `/booking?package=slug`
- [ ] Verify services auto-selected
- [ ] Verify package discount shown
- [ ] Verify cart shows package price
- [ ] Complete booking
- [ ] Verify charged package price ($299, not $500)

### Upsell Discount Flow
- [ ] User selects haircut
- [ ] Upsell shows "Add color - 15% off"
- [ ] User clicks "Add to Booking"
- [ ] Verify color service added
- [ ] Verify cart shows discounted price ($42.50, not $50)
- [ ] Complete booking
- [ ] Verify final price includes discount

### Promo Code Flow
- [ ] User enters promo code "WELCOME20"
- [ ] Click "Apply"
- [ ] Verify discount applied to cart
- [ ] Verify discount shown in breakdown
- [ ] Complete booking
- [ ] Verify redemption tracked in database

---

## 📁 Files Modified Summary

### New Migration Files:
1. `supabase/migrations/YYYYMMDD_create_grand_slam_packages.sql`
2. `supabase/migrations/YYYYMMDD_create_promo_codes.sql`
3. `supabase/migrations/YYYYMMDD_create_promo_redemptions.sql`

### Updated Frontend Files:
1. `src/pages/Booking.tsx` - Add package/promo detection
2. `src/pages/CheckoutPage.tsx` - Add promo input
3. `src/components/hormozi/GrandSlamOffers.tsx` - Pass package data
4. `src/components/BookingUpsells.tsx` - Pass discount metadata
5. `src/lib/posCalculations.ts` - Add discount logic

---

## 🎯 Success Metrics

After fixes are complete, verify:
- [ ] Exit intent discount reduces final price by 20%
- [ ] Package booking charges $299, not $500
- [ ] Upsell discounts apply correctly in cart
- [ ] Promo codes validate and apply
- [ ] All promises to customers are kept
- [ ] No more "broken promise" user experience

---

## 🚀 Deployment Steps

1. **Database:**
   ```bash
   npx supabase db push
   ```

2. **Verify Tables:**
   ```sql
   SELECT * FROM packages;
   SELECT * FROM promo_codes;
   ```

3. **Seed Data:**
   ```sql
   INSERT INTO packages (...) VALUES (...);
   INSERT INTO promo_codes (code, discount_type, discount_value)
   VALUES ('WELCOME20', 'percentage', 20);
   ```

4. **Frontend:**
   ```bash
   npm run build
   vercel --prod
   ```

5. **Test End-to-End:**
   - Test each Hormozi feature
   - Verify discounts apply
   - Complete full booking flow
   - Check database tracking

---

## ⏱️ Time Estimates

| Task | Estimated Time |
|------|----------------|
| Create packages table | 30 min |
| Create promo code tables | 30 min |
| Fix GrandSlamOffers navigation | 15 min |
| Add package detection in Booking | 45 min |
| Add exit intent redemption | 30 min |
| Store upsell discount metadata | 30 min |
| Update cart calculation | 1 hour |
| Add promo code input/validation | 1 hour |
| Testing all flows | 1-2 hours |
| **TOTAL** | **5-6 hours** |

---

## 📞 Quick Reference - Where Data Lives

| Data | Storage Location | Retrieved By |
|------|------------------|--------------|
| Exit intent email | `localStorage.exit_intent_email` | Booking.tsx (needs fix) |
| Exit intent claim | `exit_intent_conversions` table | Analytics only |
| Lead magnet download | `lead_magnet_downloads` table | Not retrieved |
| Package selection | **MISSING** (should be localStorage) | Booking.tsx (needs fix) |
| Upsell discount | **MISSING** (should be in service state) | Cart (needs fix) |
| Promo codes | **MISSING** (needs `promo_codes` table) | Booking/Checkout (needs build) |

---

*Use this checklist as your implementation guide. Check off items as you complete them.*
