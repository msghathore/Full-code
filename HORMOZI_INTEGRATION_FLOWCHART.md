# 🔄 Hormozi Features Integration Flow - Visual Diagram

## Current State: Broken Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     MARKETING FEATURES                          │
│                    (Data Producers)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Exit Intent     │  │  Lead Magnet     │  │ Grand Slam       │
│  Popup           │  │  Popup           │  │ Offers           │
│                  │  │                  │  │                  │
│ Stores:          │  │ Stores:          │  │ Queries:         │
│ • localStorage   │  │ • DB table       │  │ • packages       │
│   exit_intent_   │  │   lead_magnet_   │  │   table          │
│   email          │  │   downloads      │  │   ❌ NOT FOUND   │
│ • DB table       │  │ • sessionStorage │  │                  │
│   exit_intent_   │  │   leadMagnet     │  │ Navigates:       │
│   conversions    │  │   Shown          │  │ • /booking       │
│                  │  │                  │  │   (no params)    │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         │                     │                     │
         ▼                     ▼                     ▼
    ❌ BROKEN              ❌ BROKEN              ❌ BROKEN
    No retrieval          No retrieval          No data passed
         │                     │                     │
         └──────────────┬──────┴──────────────────┬─┘
                        │                         │
                        ▼                         ▼
         ┌──────────────────────────────────────────────┐
         │     BOOKING FLOW (Data Consumer)             │
         │                                              │
         │  ❌ Doesn't check localStorage               │
         │  ❌ Doesn't check URL params                 │
         │  ❌ Doesn't validate promo codes             │
         │  ❌ Doesn't apply discounts                  │
         │                                              │
         └──────────────────┬───────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────────┐
         │     CHECKOUT / CART                          │
         │                                              │
         │  ❌ No promo code input field                │
         │  ❌ No discount calculation                  │
         │  ❌ Full price always charged                │
         │                                              │
         └──────────────────────────────────────────────┘
```

---

## Booking Upsells Flow (Partially Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│                  BOOKING UPSELLS COMPONENT                      │
│                                                                 │
│  User selects: Haircut ($50)                                   │
│                                                                 │
│  Component shows:                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Add Color - Save 15% - Only $42.50!                      │ │
│  │ [No thanks] [Add to Booking]                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         User clicks "Add to Booking"
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  onAddService(serviceId) called                                  │
│                                                                  │
│  ✅ WHAT'S PASSED: "service-id-123"                             │
│  ❌ WHAT'S MISSING:                                              │
│     • discount_percentage: 15                                   │
│     • original_price: 50                                        │
│     • discounted_price: 42.50                                   │
│     • upsell_type: "addon"                                      │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  BOOKING.TSX: setSelectedServices()                              │
│                                                                  │
│  Current State:                                                  │
│  selectedServices = [                                            │
│    "haircut-id",                                                 │
│    "color-id"  ← Only ID stored, no discount data               │
│  ]                                                               │
│                                                                  │
│  ❌ Should be:                                                   │
│  selectedServices = [                                            │
│    { id: "haircut-id", price: 50 },                             │
│    { id: "color-id", price: 50, discount: 15, finalPrice: 42.50 }│
│  ]                                                               │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  CART CALCULATION                                                │
│                                                                  │
│  Current calculation:                                            │
│  Haircut: $50.00                                                 │
│  Color:   $50.00  ← Full price charged                          │
│  ──────────────                                                  │
│  Total:   $100.00 ❌ WRONG                                       │
│                                                                  │
│  Should be:                                                      │
│  Haircut: $50.00                                                 │
│  Color:   $42.50  (15% off) ← Discount should apply             │
│  ──────────────                                                  │
│  Total:   $92.50  ✅ CORRECT                                     │
│  You save: $7.50                                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Grand Slam Offers Flow (Completely Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOMEPAGE                                   │
│                                                                 │
│  Component: <GrandSlamOffers />                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ HAIR TRANSFORMATION PACKAGE                               │ │
│  │                                                           │ │
│  │ Regular: $500  →  NOW: $299  (Save $201 - 40% OFF)       │ │
│  │                                                           │ │
│  │ Includes:                                                 │ │
│  │ • Premium Haircut                                         │ │
│  │ • Full Color Service                                      │ │
│  │ • Deep Conditioning Treatment                             │ │
│  │ • Styling                                                 │ │
│  │                                                           │ │
│  │ [CLAIM THIS OFFER NOW] ← User clicks                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         onClick={() => navigate('/booking')}
                       │
                       ▼
         ❌ NO DATA PASSED:
         • No package ID in URL
         • No localStorage set
         • No state passed via navigate()
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BOOKING PAGE                                 │
│                                                                  │
│  URL: /booking (clean, no params)                               │
│                                                                  │
│  ❌ Booking page has NO IDEA user selected a package            │
│                                                                  │
│  User sees:                                                      │
│  • Empty service selection (must start from scratch)            │
│  • No pre-selected services                                     │
│  • No package discount shown                                    │
│  • No mention of package name                                   │
│                                                                  │
│  If user manually selects same 4 services:                      │
│  • Haircut: $50                                                 │
│  • Color: $200                                                  │
│  • Treatment: $150                                              │
│  • Styling: $100                                                │
│  ──────────────                                                  │
│  • Total: $500  ← FULL PRICE, no $299 package discount!        │
│                                                                  │
│  ❌ User expected: $299                                         │
│  ❌ User pays: $500                                             │
│  ❌ Feels deceived → Abandons cart                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## What SHOULD Happen (Fixed Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│              GRAND SLAM OFFERS (Fixed)                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         User clicks "CLAIM THIS OFFER NOW"
                       │
                       ▼
    onClick={(pkg) => {
      localStorage.setItem('selectedPackage', JSON.stringify(pkg));
      navigate(`/booking?package=${pkg.slug}`);
    }}
                       │
                       ▼
         URL: /booking?package=hair-transformation
         localStorage: { packageId, name, services[], discountedPrice }
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 BOOKING PAGE (Fixed)                             │
│                                                                  │
│  useEffect(() => {                                               │
│    const params = new URLSearchParams(location.search);         │
│    const packageSlug = params.get('package');                   │
│                                                                  │
│    if (packageSlug) {                                            │
│      const pkg = JSON.parse(localStorage.getItem('selected...));│
│                                                                  │
│      // Auto-select services from package                       │
│      setSelectedServices(pkg.included_services);                │
│                                                                  │
│      // Lock services (can't be removed)                        │
│      setPackageMode(true);                                      │
│                                                                  │
│      // Apply package discount                                  │
│      setPackageDiscount({                                       │
│        type: 'package',                                         │
│        amount: pkg.savings_amount,                              │
│        finalPrice: pkg.discounted_price                         │
│      });                                                         │
│    }                                                             │
│  }, []);                                                         │
│                                                                  │
│  ✅ User sees:                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🎉 Hair Transformation Package Selected                    │ │
│  │                                                            │ │
│  │ Included Services (locked):                                │ │
│  │ ✓ Premium Haircut                                          │ │
│  │ ✓ Full Color Service                                       │ │
│  │ ✓ Deep Conditioning Treatment                              │ │
│  │ ✓ Styling                                                  │ │
│  │                                                            │ │
│  │ Regular Price: $500                                        │ │
│  │ Package Price: $299                                        │ │
│  │ YOU SAVE: $201 (40% OFF)                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 CHECKOUT / CART (Fixed)                          │
│                                                                  │
│  Hair Transformation Package:                                    │
│  • Premium Haircut ($50)                                         │
│  • Full Color Service ($200)                                     │
│  • Deep Conditioning ($150)                                      │
│  • Styling ($100)                                                │
│  ──────────────────────────                                      │
│  Subtotal: $500.00                                               │
│  Package Discount: -$201.00                                      │
│  ──────────────────────────                                      │
│  Total: $299.00 ✅ CORRECT                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Exit Intent Discount Flow (Should Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXIT INTENT POPUP                              │
│                                                                 │
│  User claims "20% OFF first booking"                           │
│                                                                 │
│  Stores:                                                        │
│  • localStorage.setItem('exit_intent_email', email)            │
│  • localStorage.setItem('exit_intent_promo', 'WELCOME20')      │
│  • DB: exit_intent_conversions (offer_claimed = true)          │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         User navigates to /booking
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 BOOKING PAGE (Fixed)                             │
│                                                                  │
│  useEffect(() => {                                               │
│    const promoCode = localStorage.getItem('exit_intent_promo'); │
│    const email = localStorage.getItem('exit_intent_email');     │
│                                                                  │
│    if (promoCode) {                                              │
│      // Auto-apply promo code                                   │
│      setPromoCode(promoCode);                                   │
│      validateAndApplyPromo(promoCode);                          │
│                                                                  │
│      // Auto-fill email                                         │
│      setEmail(email);                                           │
│                                                                  │
│      // Show success banner                                     │
│      showBanner('Your 20% discount has been applied!');         │
│                                                                  │
│      // Clear localStorage (one-time use)                       │
│      localStorage.removeItem('exit_intent_promo');              │
│      localStorage.removeItem('exit_intent_email');              │
│    }                                                             │
│  }, []);                                                         │
│                                                                  │
│  ✅ User sees:                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🎉 YOUR 20% DISCOUNT HAS BEEN APPLIED!                     │ │
│  │                                                            │ │
│  │ Promo Code: WELCOME20 ✓                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CART (Fixed)                                │
│                                                                  │
│  Selected Services:                                              │
│  • Haircut: $50.00                                               │
│  • Color: $200.00                                                │
│  ──────────────────────────                                      │
│  Subtotal: $250.00                                               │
│  Promo Code (WELCOME20): -$50.00 (20% off)                      │
│  ──────────────────────────                                      │
│  Total: $200.00 ✅ CORRECT                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Needed

```sql
-- MISSING TABLE: packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  package_type TEXT, -- 'combo', 'seasonal', 'limited_time'
  regular_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  savings_percentage INTEGER NOT NULL,
  included_services TEXT[] NOT NULL, -- Array of service IDs
  bonus_items TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  limited_quantity INTEGER,
  remaining_quantity INTEGER,
  expires_at TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MISSING TABLE: promo_codes
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MISSING TABLE: promo_code_redemptions
CREATE TABLE promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES promo_codes(id),
  customer_id UUID,
  customer_email TEXT,
  appointment_id UUID REFERENCES appointments(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Summary: Data Flow Breakdown

### ✅ What Works:
- Hormozi components render correctly
- UI shows discounts, timers, spots
- Database tracking stores analytics data
- Visual presentation is polished

### ❌ What's Broken:
- Marketing features → Booking flow (NO connection)
- Upsell discounts → Cart calculation (metadata lost)
- Package selection → Service auto-select (no data passed)
- Exit intent offer → Promo application (localStorage orphaned)
- Grand Slam packages → Database (table doesn't exist)
- Promo codes → Input/validation (system doesn't exist)

### 🎯 Fix Strategy:
1. Create missing database tables
2. Pass data through navigation (URL params or state)
3. Add promo code input field
4. Store discount metadata with services
5. Update cart calculation to apply discounts
6. Connect all data producers to consumers

---

*End of Flowchart*
