# 🚀 Exit Intent Popup - Quick Start Guide

## Test It NOW (2 Minutes)

### Step 1: Open the Dev Server
The dev server is already running at: **http://localhost:8080**

### Step 2: Trigger the Popup
1. Open http://localhost:8080 in your browser
2. **Wait 30 seconds** (watch the clock)
3. Move your mouse cursor to the **very top** of the browser window
4. **The popup should appear!** 🎉

### Step 3: Test the Flow
1. Enter an email address (use a real one to test email delivery)
2. Click "Claim My Exclusive Offer"
3. Watch for success toast notification
4. Check your email inbox

---

## What You'll See

### The Popup
- **Background:** Pure black with emerald border
- **Text:** White with glowing effect
- **Headline:** "WAIT! Don't Miss This Special Offer"
- **Offer:** 20% OFF first booking OR free upgrade
- **Timer:** Countdown showing time remaining
- **Form:** Email input field
- **CTA:** Green "Claim My Exclusive Offer" button

### The Email
- **From:** Zavira Salon & Spa
- **Subject:** 🎁 Your Exclusive 20% Off Code - Limited Time!
- **Content:** Branded HTML email with your unique discount code
- **Format:** WELCOME20-XXXXXX

---

## Quick Tests

### Test 1: Basic Functionality ✅
```bash
# Already done - dev server is running
# Just open http://localhost:8080
```

### Test 2: Session Storage ✅
1. Trigger popup once
2. Close it
3. Try to trigger again
4. **Expected:** Should NOT appear (session storage working)

### Test 3: Clear Session ✅
1. Open browser console (F12)
2. Type: `sessionStorage.clear()`
3. Refresh page
4. Wait 30s and trigger
5. **Expected:** Should appear (session cleared)

### Test 4: Excluded Pages ✅
1. Go to http://localhost:8080/booking
2. Wait 30 seconds
3. Try to trigger
4. **Expected:** Should NOT appear (booking page excluded)

---

## Manual Deployment (5 Minutes)

### 1. Apply Database Migration
```bash
# Open Supabase Dashboard
https://supabase.com/dashboard

# Go to SQL Editor
# Paste this file content:
supabase/migrations/20250126000000_exit_intent_tracking.sql

# Click RUN
```

### 2. Deploy Edge Function
```bash
npx supabase functions deploy send-exit-intent-offer

# Set API key (if needed)
npx supabase secrets set RESEND_API_KEY=your_key_here
```

### 3. Deploy to Production
```bash
git add .
git commit -m "Feat: Add exit intent popup system"
git push origin main

# Vercel will auto-deploy to https://zavira.ca
```

---

## Verify Everything Works

### ✅ Component Integration
```bash
grep -n "ExitIntentPopup" src/App.tsx
# Should show lines 18 and 168
```

### ✅ TypeScript Compiles
```bash
npx tsc --noEmit
# Should show no errors
```

### ✅ Files Exist
```bash
ls -la src/components/hormozi/ExitIntentPopup.tsx
ls -la supabase/migrations/20250126000000_exit_intent_tracking.sql
ls -la supabase/functions/send-exit-intent-offer/index.ts
```

---

## Troubleshooting

### Popup Not Showing?
1. **Wait the full 30 seconds** (common mistake!)
2. Check session storage: `sessionStorage.getItem('exit_intent_shown')`
3. If set, clear it: `sessionStorage.clear()`
4. Make sure you're moving mouse to the TOP edge
5. Check browser console for errors (F12)

### Email Not Sending?
1. Verify Edge Function is deployed
2. Check Resend API key is set
3. Look at Supabase function logs
4. Try a test curl request

### Colors Wrong?
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear browser cache
3. Check for Tailwind conflicts

---

## Brand Colors Reference

### ✅ CORRECT (Used)
- Black: `#000000`, `bg-black`, `bg-slate-950`
- White: `#ffffff` with glow effect
- Emerald: `#10b981` (emerald-500)
- Amber: `#fbbf24` (timer only)

### ❌ FORBIDDEN (Not Used)
- Purple/Violet
- Rose/Pink
- Blue

---

## Files Created

### Component
- `src/components/hormozi/ExitIntentPopup.tsx` ✅
- `src/components/hormozi/index.ts` ✅

### Database
- `supabase/migrations/20250126000000_exit_intent_tracking.sql` ✅

### Edge Function
- `supabase/functions/send-exit-intent-offer/index.ts` ✅

### Documentation
- `FEATURES.md` ✅
- `DEPLOY_EXIT_INTENT.md` ✅
- `EXIT_INTENT_SUMMARY.md` ✅
- `DEPLOYMENT_CHECKLIST.md` ✅
- `test-exit-intent.html` ✅
- This guide ✅

---

## Next Steps

### Immediate (Now)
1. ✅ Test locally (you can do this right now!)
2. ⏳ Apply database migration
3. ⏳ Deploy Edge Function
4. ⏳ Push to production

### Short Term (This Week)
1. Monitor conversion rate
2. Test email delivery
3. Gather user feedback
4. Check analytics

### Long Term (This Month)
1. A/B test variations
2. Optimize conversion rate
3. Segment by traffic source
4. Add personalization

---

## Analytics Queries

### View Conversions
```sql
-- Run in Supabase SQL Editor
SELECT * FROM exit_intent_conversions
ORDER BY created_at DESC
LIMIT 20;
```

### View Analytics
```sql
SELECT * FROM exit_intent_analytics
ORDER BY date DESC
LIMIT 7;
```

### Calculate Conversion Rate
```sql
SELECT
  COUNT(*) as total_shown,
  COUNT(*) FILTER (WHERE offer_claimed = true) as claimed,
  ROUND(
    (COUNT(*) FILTER (WHERE offer_claimed = true)::DECIMAL / COUNT(*)) * 100,
    2
  ) as conversion_rate_percent
FROM exit_intent_conversions;
```

---

## Expected Results

### Conservative Estimate
- **Conversion Rate:** 8-10%
- **Monthly Captures:** 50-100 emails
- **Bookings:** 5-10 per month
- **Revenue:** $400-$800/month

### Optimistic Estimate (Optimized)
- **Conversion Rate:** 15-20%
- **Monthly Captures:** 100-200 emails
- **Bookings:** 10-25 per month
- **Revenue:** $800-$2,000/month

---

## Support

**Need Help?**
- Check `FEATURES.md` for detailed documentation
- Check `DEPLOY_EXIT_INTENT.md` for deployment steps
- Check `DEPLOYMENT_CHECKLIST.md` for full checklist
- Check browser console for errors

**Everything Working?**
🎉 Great! Now deploy to production and start converting those abandoning visitors!

---

*Quick Start Guide - December 26, 2025*
*Get testing in 2 minutes! 🚀*
