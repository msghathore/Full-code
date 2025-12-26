# Exit Intent Popup - Final Deployment Checklist

## 🎯 Pre-Deployment Verification

### ✅ Code Complete
- [x] `ExitIntentPopup.tsx` component created
- [x] Integrated into `App.tsx`
- [x] TypeScript compiles with no errors
- [x] Brand colors compliance verified
- [x] Framer Motion animations implemented
- [x] Session storage logic implemented
- [x] Exclusion rules implemented

### ✅ Database Ready
- [x] Migration file created: `20250126000000_exit_intent_tracking.sql`
- [x] Table schema designed
- [x] RLS policies defined
- [x] Analytics view created
- [x] Indexes optimized
- [ ] **ACTION REQUIRED:** Apply migration in Supabase Dashboard

### ✅ Email System Ready
- [x] Edge Function created: `send-exit-intent-offer`
- [x] Branded HTML email template
- [x] Unique discount code generation
- [x] CORS configured
- [ ] **ACTION REQUIRED:** Deploy Edge Function
- [ ] **ACTION REQUIRED:** Set Resend API key

### ✅ Documentation Complete
- [x] `FEATURES.md` - Full feature documentation
- [x] `DEPLOY_EXIT_INTENT.md` - Deployment guide
- [x] `EXIT_INTENT_SUMMARY.md` - Implementation summary
- [x] `test-exit-intent.html` - Test suite
- [x] This checklist

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

**Time Required:** 2 minutes

```bash
# Option A: Via Supabase Dashboard (RECOMMENDED)
1. Go to https://supabase.com/dashboard
2. Select Zavira project
3. Go to SQL Editor
4. Create new query
5. Copy content from: supabase/migrations/20250126000000_exit_intent_tracking.sql
6. Click RUN
7. Verify: SELECT * FROM exit_intent_conversions LIMIT 1;
```

**Verification:**
```sql
-- Should return table name
SELECT table_name FROM information_schema.tables
WHERE table_name = 'exit_intent_conversions';

-- Should return view name
SELECT table_name FROM information_schema.views
WHERE table_name = 'exit_intent_analytics';
```

- [ ] Migration applied successfully
- [ ] Table exists
- [ ] View exists
- [ ] RLS policies active

---

### Step 2: Deploy Edge Function

**Time Required:** 3 minutes

```bash
# Deploy the function
npx supabase functions deploy send-exit-intent-offer

# Set Resend API key (if not already set)
npx supabase secrets set RESEND_API_KEY=your_resend_api_key

# Verify deployment
npx supabase functions list
```

**Test the function:**
```bash
curl -X POST https://sjawxfvgvcizjipjukni.supabase.co/functions/v1/send-exit-intent-offer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com"}'
```

- [ ] Function deployed
- [ ] API key set
- [ ] Test email sent successfully
- [ ] Unique code generated

---

### Step 3: Local Testing

**Time Required:** 5 minutes

```bash
# Dev server should already be running
# If not, start it:
npm run dev
```

**Test Procedure:**
1. Open http://localhost:8080
2. Open browser console (F12)
3. Wait 30 seconds on the page
4. Move mouse to very top of browser window
5. Popup should appear

**What to Check:**
- [ ] Popup appears after 30s + exit intent
- [ ] Black background
- [ ] White glowing text
- [ ] Emerald green accents
- [ ] Countdown timer works
- [ ] Email input validates
- [ ] Submit button works
- [ ] X button closes popup
- [ ] Click outside closes popup
- [ ] No console errors

**Test Session Storage:**
1. Open http://localhost:8080 (new tab)
2. Trigger popup
3. Close popup
4. Try to trigger again → Should NOT appear
5. Clear session storage: `sessionStorage.clear()`
6. Trigger again → Should appear

- [ ] Session storage works
- [ ] Popup shows only once per session

---

### Step 4: Test Email Flow

**Time Required:** 3 minutes

1. Trigger popup
2. Enter your real email
3. Click "Claim My Exclusive Offer"
4. Check email inbox
5. Verify email received
6. Check discount code format
7. Click booking link
8. Verify code is pre-applied

- [ ] Email received
- [ ] Branded template displays correctly
- [ ] Discount code present
- [ ] Booking link works
- [ ] Code format: WELCOME20-XXXXXX

---

### Step 5: Test Database Tracking

**Time Required:** 2 minutes

```sql
-- Check tracking
SELECT * FROM exit_intent_conversions
ORDER BY created_at DESC
LIMIT 10;

-- Check analytics
SELECT * FROM exit_intent_analytics
ORDER BY date DESC
LIMIT 5;
```

**Verify:**
- [ ] Popup show tracked (offer_claimed = false)
- [ ] Email capture tracked (offer_claimed = true)
- [ ] Customer email stored
- [ ] Timestamps correct
- [ ] Analytics view calculates correctly

---

### Step 6: Deploy to Production

**Time Required:** 5 minutes

```bash
# Commit changes
git add .
git commit -m "Feat: Add exit intent popup with email capture and conversion tracking

- Create ExitIntentPopup component with Hormozi-style conversion tactics
- Add database tracking with exit_intent_conversions table
- Implement email system with Resend Edge Function
- Add 10-minute countdown timer and urgency tactics
- Integrate site-wide with exclusion rules
- Brand compliant: black bg, white glow, emerald accents

Features:
- Exit intent detection (desktop + mobile)
- 30-second minimum time on site
- Session storage (show once)
- Email capture with validation
- Unique discount code generation
- Analytics dashboard view
- RLS security policies"

# Push to production
git push origin main
```

**Vercel will auto-deploy:**
- [ ] Git push successful
- [ ] Vercel deployment started
- [ ] Build completed
- [ ] Deployment live

---

### Step 7: Production Verification

**Time Required:** 5 minutes

**Test on https://zavira.ca:**
1. Open in incognito/private window
2. Wait 30 seconds
3. Trigger exit intent
4. Test full flow

- [ ] Popup appears on production
- [ ] Email submission works
- [ ] Database tracking works
- [ ] Email sent successfully
- [ ] Brand colors correct
- [ ] No console errors
- [ ] Mobile responsive

---

## 🧪 Testing Scenarios

### Scenario 1: New Visitor
1. Open site (never visited)
2. Browse for 30+ seconds
3. Move mouse to exit
4. **Expected:** Popup appears

### Scenario 2: Returning Visitor (Same Session)
1. Trigger popup once
2. Close it
3. Try to trigger again
4. **Expected:** Does NOT appear

### Scenario 3: Returning Visitor (New Session)
1. Trigger popup
2. Close browser
3. Open new browser/incognito
4. Trigger popup
5. **Expected:** Appears (new session)

### Scenario 4: User on Booking Page
1. Navigate to /booking
2. Wait 30 seconds
3. Try to trigger
4. **Expected:** Does NOT appear

### Scenario 5: User with Existing Booking
1. Log in as customer with booking
2. Browse site
3. Try to trigger
4. **Expected:** Does NOT appear

### Scenario 6: Email Submission
1. Trigger popup
2. Enter email
3. Submit
4. **Expected:**
   - Success toast
   - Popup closes
   - Database entry created
   - Email sent
   - Discount code generated

---

## 📊 Post-Deployment Monitoring

### Day 1 Checks
- [ ] Monitor conversion rate
- [ ] Check for JavaScript errors
- [ ] Verify email delivery rate
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Week 1 Metrics
- [ ] Total popups shown
- [ ] Total emails captured
- [ ] Conversion rate %
- [ ] Booking completion rate
- [ ] Email engagement rate

### Optimization Opportunities
- [ ] A/B test headline
- [ ] Test different timer durations
- [ ] Test offer amounts
- [ ] Segment by traffic source
- [ ] Add social proof

---

## 🐛 Common Issues & Solutions

### Issue: Popup not appearing
**Solutions:**
1. Check session storage: `sessionStorage.getItem('exit_intent_shown')`
2. Clear storage: `sessionStorage.clear()`
3. Wait full 30 seconds
4. Check you're not on excluded page
5. Check browser console for errors

### Issue: Email not sending
**Solutions:**
1. Verify Resend API key is set
2. Check Supabase Edge Function logs
3. Test function directly with curl
4. Verify email address format
5. Check spam folder

### Issue: Database not tracking
**Solutions:**
1. Verify migration applied
2. Check RLS policies
3. Test manual insert
4. Check Supabase project status
5. Verify network requests in dev tools

### Issue: Wrong colors showing
**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check CSS specificity
4. Verify Tailwind classes
5. Check for conflicting styles

---

## ✅ Final Checklist

### Before Going Live
- [ ] All code changes committed
- [ ] TypeScript compiles
- [ ] Migration applied
- [ ] Edge Function deployed
- [ ] Local testing passed
- [ ] Email flow tested
- [ ] Database tracking verified
- [ ] Brand colors verified
- [ ] Documentation complete

### After Going Live
- [ ] Production test passed
- [ ] Mobile test passed
- [ ] Email delivery confirmed
- [ ] Analytics tracking
- [ ] No console errors
- [ ] Performance acceptable
- [ ] User feedback positive

---

## 🎉 Success Criteria

**MVP Launch:** All checkboxes above completed
**Optimization Phase:** Conversion rate 8%+
**Mature Product:** Conversion rate 15%+

---

## 📈 Expected Results

**Week 1:**
- 10-50 email captures
- 8-12% conversion rate
- 0-5 bookings from offer

**Month 1:**
- 50-200 email captures
- 10-15% conversion rate
- 5-25 bookings from offer
- $400-$2,000 revenue

**Month 3:**
- 150-600 email captures
- 12-18% conversion rate (optimized)
- 15-75 bookings from offer
- $1,200-$6,000 revenue

---

*Ready for deployment: December 26, 2025*
*All systems GO ✅*
