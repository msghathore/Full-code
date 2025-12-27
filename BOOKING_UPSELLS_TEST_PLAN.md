# Booking Upsells Test Plan

## How to Test

1. Navigate to http://localhost:8080/booking
2. Select services from each category below
3. Verify that the correct upsells appear
4. Verify color scheme: white glow everywhere, green ONLY on checkmarks

---

## Test Scenarios

### ✅ Scenario 1: Haircut Service
**Action:** Select any service with "haircut" or "cut" in the name

**Expected Upsells:**
1. **Color/Highlight Service** (Complementary)
   - Type: "PERFECT PAIRING"
   - Discount: 15%
   - Pitch: "Complete your transformation with [service name] - Perfect with your fresh cut!"

2. **Deep Conditioning Treatment** (Upgrade)
   - Type: "UPGRADE"
   - Discount: 20%
   - Pitch: "Protect your hair with [service name] - Leave healthier than you came!"

**Visual Check:**
- ✅ White glowing text on headings
- ✅ White badges with white glow (NO green backgrounds)
- ✅ Green checkmark ONLY on "Add to Booking" button
- ✅ White hover glow on card borders

---

### ✅ Scenario 2: Color/Highlight Service
**Action:** Select any service with "color", "highlight", "balayage", or "ombre"

**Expected Upsells:**
1. **Haircut Service** (Complementary - BIDIRECTIONAL!)
   - Type: "PERFECT PAIRING"
   - Discount: 15%
   - Pitch: "Get the perfect shape! Add [service name] to frame your new color."

2. **Toner/Gloss Service** (Add-on)
   - Type: "POPULAR ADD-ON"
   - Discount: 20%
   - Pitch: "Lock in your color! [service name] adds shine and longevity - Highly recommended!"

**Test Bidirectionality:**
- If you select HAIRCUT → You should see COLOR suggested
- If you select COLOR → You should see HAIRCUT suggested
- This proves bidirectional logic works!

---

### ✅ Scenario 3: Manicure Service
**Action:** Select any service with "manicure" in the name

**Expected Upsell:**
- **Pedicure Service** (Bundle)
  - Type: "BUNDLE & SAVE"
  - Discount: 25%
  - Pitch: "Complete the look! [service name] pairs perfectly with your manicure."

**Visual Check:**
- Badge should be white glow (NOT green)
- Bundle discount badge should be white text with white glow

---

### ✅ Scenario 4: Pedicure Service
**Action:** Select any service with "pedicure" in the name

**Expected Upsell:**
- **Manicure Service** (Bundle)
  - Type: "BUNDLE & SAVE"
  - Discount: 25%
  - Pitch: "Don't forget your hands! [service name] completes your spa experience."

**Test Bidirectionality:**
- Manicure → Pedicure ✓
- Pedicure → Manicure ✓

---

### ✅ Scenario 5: Facial Service
**Action:** Select any service with "facial" in the name

**Expected Upsells:**
1. **Massage Service** (Complementary)
   - Type: "PERFECT PAIRING"
   - Discount: 20%
   - Pitch: "Ultimate relaxation! [service name] extends your spa experience."

2. **Eyebrow/Lash Service** (Add-on)
   - Type: "POPULAR ADD-ON"
   - Discount: 25%
   - Pitch: "While you're here: Add [service name] to perfect your look!"

---

### ✅ Scenario 6: Massage Service
**Action:** Select any service with "massage" in the name

**Expected Upsell:**
- **Facial Service** (Complementary)
  - Type: "PERFECT PAIRING"
  - Discount: 20%
  - Pitch: "Complete rejuvenation! Add [service name] to your massage session."

---

### ✅ Scenario 7: Waxing Service
**Action:** Select any service with "wax" in the name

**Expected Upsells:**
- **Additional Waxing Areas** (up to 2 different services)
  - Type: "POPULAR ADD-ON"
  - Discount: 30%
  - Pitch: "While you're here: Add [service name] - Save time & money!"

**Note:** This should suggest OTHER waxing services (not the one selected)

---

### ✅ Scenario 8: Eyebrow/Lash Service
**Action:** Select any service with "eyebrow", "brow", or "lash" in the name

**Expected Upsell:**
- **Lip Wax or Tinting Service** (Add-on)
  - Type: "POPULAR ADD-ON"
  - Discount: 25%
  - Pitch: "Quick add-on: [service name] enhances your look - Takes just minutes!"

---

## 🎨 Color Scheme Verification Checklist

### ✅ Should Have White Glow:
- [ ] Main heading: "Frequently Added Together"
- [ ] Sparkles icon in header
- [ ] All badge labels ("BUNDLE & SAVE", "POPULAR ADD-ON", etc.)
- [ ] Service names in upsell cards
- [ ] Discounted prices
- [ ] "SAVE $X" badges
- [ ] Border hover effects

### ❌ Should NOT Have Green (except checkmark):
- [ ] Backgrounds should be white/10 (NOT emerald)
- [ ] Borders should be white/30 (NOT emerald)
- [ ] Text should be white (NOT emerald-400)
- [ ] Hover states should be white glow (NOT emerald glow)

### ✅ Green ONLY Here:
- [ ] Checkmark icon in "Add to Booking" button

---

## 🚫 What Should NOT Happen

1. **No Duplicate Upsells:** Same service should never appear twice
2. **No Already-Selected Services:** If you already added a service, it shouldn't be suggested again
3. **No Self-Suggestions:** A service shouldn't suggest itself
4. **No Green Backgrounds:** All backgrounds should be black/white only
5. **No Emerald Colors:** No emerald-500, emerald-400, etc. (except checkmark icon)

---

## 🔄 Advanced Test: Bidirectional Logic

### Test Case A: Haircut + Color
1. Add "Haircut" → Should see "Color" suggested
2. Add "Color" (from upsell)
3. Remove "Haircut"
4. Upsells should update → Now should see "Haircut" suggested (bidirectional!)

### Test Case B: Manicure + Pedicure
1. Add "Manicure" → Should see "Pedicure" suggested
2. Add "Pedicure" (from upsell)
3. Remove "Manicure"
4. Upsells should update → Now should see "Manicure" suggested

This proves the bidirectional logic is working correctly!

---

## 📱 Responsive Testing

1. **Desktop (1920x1080):**
   - Upsells should display in cards
   - All text should be readable
   - Hover effects should work

2. **Tablet (768px):**
   - Upsells should stack properly
   - Text should scale down appropriately

3. **Mobile (375px):**
   - Cards should be full-width
   - Prices should be readable
   - Buttons should be tappable (min 44px height)

---

## ✅ Success Criteria

- All upsells match the selected service category
- Bidirectional logic works (haircut ↔ color, mani ↔ pedi)
- Color scheme is correct (white glow + green checkmarks only)
- No duplicate suggestions
- No already-selected services appear as upsells
- Responsive on all screen sizes
- TypeScript compiles without errors

---

**Test Status:** Ready for manual testing at http://localhost:8080/booking
