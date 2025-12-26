# Zavira Features Documentation

## Exit Intent Popup System

**Location:** `src/components/hormozi/ExitIntentPopup.tsx`

### Overview
High-converting exit intent popup that captures abandoning visitors with an exclusive offer. Implements Hormozi-style conversion optimization tactics.

### Features

#### 1. Smart Exit Detection
- **Desktop:** Detects mouse leaving viewport at top edge
- **Mobile:** Detects back button navigation
- **Timing:** Only shows after 30 seconds on site
- **Session Control:** Shows once per session via sessionStorage

#### 2. Exclusion Rules
- ✅ Does not show if user has already booked an appointment
- ✅ Does not show on checkout/booking pages
- ✅ Does not show on staff/admin pages
- ✅ Respects session storage to avoid annoying users

#### 3. Offer Details
- **Primary Offer:** 20% off first booking
- **Alternative:** Free upgrade to premium services
- **Urgency:** 10-minute countdown timer
- **Trust Indicators:** "Join 2,000+ satisfied customers"

#### 4. Email Capture
- Validates email format
- Sends offer code via Supabase Edge Function
- Stores email in localStorage for booking pre-fill
- Tracks conversion in database

#### 5. Brand Compliance
- ✅ Black background (`#000000`)
- ✅ White glowing text with shadow effect
- ✅ Emerald accent color (`#10b981`)
- ✅ No purple, rose, or blue colors
- ✅ Framer Motion animations

### Database Schema

**Table:** `exit_intent_conversions`

```sql
CREATE TABLE exit_intent_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT,
  offer_claimed BOOLEAN DEFAULT false,
  shown_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Analytics View:** `exit_intent_analytics`

Provides daily conversion metrics:
- Total popups shown
- Total offers claimed
- Conversion rate percentage
- Unique emails captured

### Edge Function

**Function:** `send-exit-intent-offer`

**Endpoint:** `/functions/v1/send-exit-intent-offer`

**Request:**
```json
{
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "discountCode": "WELCOME20-ABCD1234",
  "emailId": "re_..."
}
```

**Email Content:**
- Branded HTML email with Zavira styling
- Unique discount code
- 10-minute expiry warning
- Direct booking link with code pre-applied
- Trust indicators and benefits

### Usage

The popup is automatically integrated site-wide in `App.tsx`:

```tsx
import { ExitIntentPopup } from './components/hormozi/ExitIntentPopup';

// In AppContent component
{!hideNavigation && <ExitIntentPopup />}
```

### Testing

**Test File:** `test-exit-intent.html`

Run comprehensive tests:
1. Component integration
2. Database schema
3. Exit intent detection
4. Email submission
5. Session storage
6. Brand colors

**Manual Testing:**
1. Open the site
2. Wait 30 seconds
3. Move mouse to top of browser window
4. Popup should appear
5. Enter email and submit
6. Check email for offer code

### Analytics Queries

**View daily conversion rate:**
```sql
SELECT * FROM exit_intent_analytics
ORDER BY date DESC
LIMIT 30;
```

**View recent conversions:**
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

**Calculate overall conversion rate:**
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

### Performance Metrics

**Expected Conversion Rate:** 8-15%
- Industry average: 2-5%
- Well-optimized: 8-15%
- Excellent: 15%+

**Key Metrics to Track:**
- Show rate (popups per visitor)
- Conversion rate (claimed / shown)
- Booking completion rate (codes used)
- Revenue per popup shown

### Optimization Tips

1. **A/B Test Headlines:**
   - Current: "WAIT! Don't Miss This Special Offer"
   - Test variations for higher conversions

2. **Adjust Timer:**
   - Current: 10 minutes
   - Test 5 minutes for more urgency
   - Test 15 minutes for less pressure

3. **Test Offers:**
   - 20% off vs. 25% off
   - Free upgrade vs. gift with service
   - BOGO offers for group bookings

4. **Timing Optimization:**
   - Current: 30 seconds minimum
   - Test 20 seconds (faster trigger)
   - Test 60 seconds (more engaged users)

### Integration Points

**Booking Flow:**
- Email from popup pre-fills booking form
- Discount code auto-applies at checkout
- Track which bookings came from exit intent

**Email Marketing:**
- Add captured emails to newsletter
- Send follow-up sequences
- Re-engagement campaigns

**Analytics:**
- Facebook Pixel tracks conversions
- Google Analytics event tracking
- Supabase database metrics

### Future Enhancements

**Planned Features:**
1. Dynamic offer personalization based on viewed services
2. Multi-step popup (build trust → show offer)
3. Social proof integration (show recent bookings)
4. Countdown to next available slot
5. Mobile-specific offer variations
6. Referral incentive popup variant

**Advanced Tactics:**
1. Segment by traffic source
2. Different offers for new vs. returning visitors
3. Service-specific offers
4. Time-based offers (weekend specials)
5. Membership tier offers

### Compliance

- ✅ GDPR compliant email capture
- ✅ Easy dismiss (X button, click outside)
- ✅ No dark patterns
- ✅ Clear value proposition
- ✅ Transparent terms

### Support

**Troubleshooting:**

**Popup not showing:**
- Check sessionStorage (clear if testing)
- Verify 30 seconds have passed
- Ensure not on excluded page
- Check browser console for errors

**Email not sending:**
- Verify Resend API key in Edge Function
- Check Supabase logs
- Test Edge Function directly

**Database not tracking:**
- Check RLS policies
- Verify migration applied
- Test insert permissions

**Files to Check:**
- `src/components/hormozi/ExitIntentPopup.tsx`
- `src/App.tsx` (integration)
- `supabase/migrations/20250126000000_exit_intent_tracking.sql`
- `supabase/functions/send-exit-intent-offer/index.ts`

---

*Last Updated: December 26, 2025*
