# Exit Intent Popup - Deployment Guide

## ✅ Files Created

### 1. React Component
- **File:** `src/components/hormozi/ExitIntentPopup.tsx`
- **Status:** ✅ Created and integrated into App.tsx
- **Description:** Exit intent popup with email capture, countdown timer, and conversion tracking

### 2. Database Migration
- **File:** `supabase/migrations/20250126000000_exit_intent_tracking.sql`
- **Status:** ⏳ Ready to apply
- **Description:** Creates `exit_intent_conversions` table and analytics view

### 3. Edge Function
- **File:** `supabase/functions/send-exit-intent-offer/index.ts`
- **Status:** ⏳ Ready to deploy
- **Description:** Sends offer email with discount code via Resend API

### 4. Documentation
- **File:** `FEATURES.md`
- **Status:** ✅ Created
- **Description:** Complete feature documentation with testing guide

### 5. Test Page
- **File:** `test-exit-intent.html`
- **Status:** ✅ Created
- **Description:** Comprehensive test suite for all functionality

---

## 📋 Deployment Steps

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your Zavira project
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy and paste the contents of `supabase/migrations/20250126000000_exit_intent_tracking.sql`
6. Click **Run**
7. Verify table created:
```sql
SELECT * FROM exit_intent_conversions LIMIT 5;
```

**Option B: Via Supabase CLI**
```bash
# This might fail due to migration history mismatch
# If it fails, use Option A instead
npx supabase db push
```

### Step 2: Deploy Edge Function

```bash
# Deploy the send-exit-intent-offer function
npx supabase functions deploy send-exit-intent-offer

# Set the Resend API key (if not already set)
npx supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 3: Verify Integration

```bash
# Start dev server
npm run dev

# Open http://localhost:8080
# Wait 30 seconds
# Move mouse to top of browser
# Popup should appear
```

### Step 4: Test Email Function

```bash
# Test the Edge Function directly
curl -X POST https://sjawxfvgvcizjipjukni.supabase.co/functions/v1/send-exit-intent-offer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com"}'
```

---

## 🔍 Verification Checklist

- [ ] **Database Migration Applied**
  ```sql
  -- Run in Supabase SQL Editor
  SELECT table_name FROM information_schema.tables
  WHERE table_name = 'exit_intent_conversions';
  ```

- [ ] **Edge Function Deployed**
  ```bash
  npx supabase functions list
  # Should show: send-exit-intent-offer
  ```

- [ ] **Component Renders**
  - Open dev server
  - Check browser console for errors
  - Verify no TypeScript errors

- [ ] **Exit Intent Triggers**
  - Wait 30 seconds on site
  - Move mouse to top
  - Popup appears

- [ ] **Email Capture Works**
  - Enter email in popup
  - Submit form
  - Check for success toast
  - Verify database entry

- [ ] **Analytics View Works**
  ```sql
  SELECT * FROM exit_intent_analytics;
  ```

---

## 🎨 Brand Compliance Check

✅ **Colors Used:**
- Black background (`#000000`, `#020617`)
- White glowing text
- Emerald accents (`#10b981`)
- Amber timer (`#fbbf24`)

❌ **Forbidden Colors (NOT USED):**
- Purple ❌
- Rose/Pink ❌
- Blue ❌

---

## 📊 Analytics Queries

### Daily Conversion Rate
```sql
SELECT * FROM exit_intent_analytics
ORDER BY date DESC
LIMIT 30;
```

### Overall Performance
```sql
SELECT
  COUNT(*) as total_shown,
  COUNT(*) FILTER (WHERE offer_claimed = true) as total_claimed,
  ROUND(
    (COUNT(*) FILTER (WHERE offer_claimed = true)::DECIMAL / COUNT(*)) * 100,
    2
  ) as conversion_rate
FROM exit_intent_conversions;
```

### Recent Conversions
```sql
SELECT
  customer_email,
  offer_claimed,
  shown_at,
  claimed_at
FROM exit_intent_conversions
WHERE shown_at > now() - interval '7 days'
ORDER BY shown_at DESC;
```

---

## 🐛 Troubleshooting

### Popup Not Showing
1. Clear sessionStorage: `sessionStorage.clear()`
2. Wait 30 seconds on page
3. Check excluded pages (not on /booking, /checkout)
4. Check console for errors

### Email Not Sending
1. Verify Resend API key is set
2. Check Supabase function logs
3. Test function directly with curl
4. Check Edge Function deployment status

### Database Not Tracking
1. Verify migration applied
2. Check RLS policies
3. Test insert manually:
```sql
INSERT INTO exit_intent_conversions (customer_email, offer_claimed)
VALUES ('test@example.com', true);
```

---

## 🚀 Next Steps

### 1. A/B Testing
- Test different headlines
- Test different timer durations
- Test different offers (20% vs 25%)

### 2. Integration
- Connect to email marketing platform
- Add to Facebook Pixel events
- Track booking completion rate

### 3. Optimization
- Segment by traffic source
- Personalize by viewed services
- Add social proof

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are in correct locations
3. Review FEATURES.md for detailed documentation
4. Test with test-exit-intent.html page

---

*Deployment guide created: December 26, 2025*
