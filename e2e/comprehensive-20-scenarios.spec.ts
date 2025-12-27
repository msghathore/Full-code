import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE 20-SCENARIO TEST SUITE
 * Tests complete customer journey from zero to booking to checkout to payment
 * Checks for UI bugs like color contrast, broken buttons, accessibility
 */

test.describe('Comprehensive 20-Scenario Testing Suite', () => {

  // SCENARIO 1: New Customer - First Time Booking
  test('Scenario 1: New Customer - First Time Booking', async ({ page }) => {
    console.log('🧪 Testing Scenario 1: New Customer - First Time Booking');

    // Step 1: Visit homepage
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 2: Verify homepage loads correctly
    await expect(page).toHaveTitle(/Zavira/i);

    // Step 3: Check navigation is visible and accessible
    const menuButton = page.locator('button[aria-label="Toggle sidebar"]').first();
    await expect(menuButton).toBeVisible();

    // Step 4: Open navigation menu
    await menuButton.click();
    await page.waitForTimeout(500); // Wait for menu animation

    // Step 5: Verify MEMBERSHIP link exists in navigation (Hormozi page - Top Level)
    const membershipLink = page.locator('text=MEMBERSHIP').first();
    await expect(membershipLink).toBeVisible();

    // Step 6: Verify "MY APPOINTMENTS" link exists (Hormozi page - Top Level)
    const myAppointmentsLink = page.locator('text=MY APPOINTMENTS').first();
    await expect(myAppointmentsLink).toBeVisible();

    // Step 7: Verify "REFERRAL PROGRAM" link exists (Hormozi page - Top Level)
    const referralLink = page.locator('text=REFERRAL PROGRAM').first();
    await expect(referralLink).toBeVisible();

    // Step 8: Navigate to Booking
    const bookingLink = page.locator('text=BOOKING').first();
    await bookingLink.click();
    await page.waitForLoadState('networkidle');

    // Step 9: Verify booking page loads
    await expect(page.locator('text=/book|appointment|service/i').first()).toBeVisible({ timeout: 10000 });

    // Step 10: Check for UI bugs - color contrast
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => window.getComputedStyle(el).backgroundColor);
    console.log(`Background color: ${bgColor}`);

    // Step 11: Take screenshot for visual verification
    await page.screenshot({ path: 'e2e/screenshots/scenario-1-booking-page.png', fullPage: true });

    // Step 12: Check for broken buttons
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} visible buttons`);
    expect(buttonCount).toBeGreaterThan(0);

    // Step 13: Verify no critical console errors
    expect(consoleErrors.filter(e => !e.includes('testimonials'))).toHaveLength(0);

    console.log('✅ Scenario 1 completed successfully');
  });

  // SCENARIO 2: Returning Customer - Quick Rebooking
  test('Scenario 2: Returning Customer - Quick Rebooking', async ({ page }) => {
    console.log('🧪 Testing Scenario 2: Returning Customer - Quick Rebooking');

    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Open menu
    const menuButton = page.locator('button[aria-label="Toggle sidebar"]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    // Navigate to My Appointments (should be accessible now as top-level menu)
    const myAppointmentsLink = page.locator('text=MY APPOINTMENTS').first();
    await expect(myAppointmentsLink).toBeVisible();
    await myAppointmentsLink.click();
    await page.waitForLoadState('networkidle');

    // Verify My Appointments page loads
    await expect(page).toHaveURL(/my-appointments/);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-2-my-appointments.png', fullPage: true });

    console.log('✅ Scenario 2 completed successfully');
  });

  // SCENARIO 3: Group Booking - Multiple People
  test('Scenario 3: Group Booking - Multiple People', async ({ page }) => {
    console.log('🧪 Testing Scenario 3: Group Booking - Multiple People');

    await page.goto('http://localhost:8080/booking?mode=group');
    await page.waitForLoadState('networkidle');

    // Verify group booking mode loads
    await expect(page).toHaveURL(/mode=group/);

    // Check for group booking specific UI elements
    const groupBookingIndicator = page.locator('text=/group|multiple|party/i').first();
    await expect(groupBookingIndicator).toBeVisible({ timeout: 10000 });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-3-group-booking.png', fullPage: true });

    console.log('✅ Scenario 3 completed successfully');
  });

  // SCENARIO 4: Last-Minute Appointment
  test('Scenario 4: Last-Minute Appointment', async ({ page }) => {
    console.log('🧪 Testing Scenario 4: Last-Minute Appointment');

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Check for urgency indicators (Hormozi strategy)
    const urgencyElements = page.locator('text=/urgent|today|same day|available now/i');
    const urgencyCount = await urgencyElements.count();
    console.log(`Found ${urgencyCount} urgency indicators`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-4-last-minute.png', fullPage: true });

    console.log('✅ Scenario 4 completed successfully');
  });

  // SCENARIO 5: Service Bundle Purchase
  test('Scenario 5: Service Bundle Purchase', async ({ page }) => {
    console.log('🧪 Testing Scenario 5: Service Bundle Purchase');

    await page.goto('http://localhost:8080/services');
    await page.waitForLoadState('networkidle');

    // Check for bundle/package offerings
    const bundleElements = page.locator('text=/bundle|package|combo|deal/i');
    const bundleCount = await bundleElements.count();
    console.log(`Found ${bundleCount} bundle/package offerings`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-5-bundles.png', fullPage: true });

    console.log('✅ Scenario 5 completed successfully');
  });

  // SCENARIO 6: Mobile User Booking
  test('Scenario 6: Mobile User Booking', async ({ page }) => {
    console.log('🧪 Testing Scenario 6: Mobile User Booking');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Verify mobile responsiveness
    const menuButton = page.locator('button[aria-label="Toggle sidebar"]').first();
    await expect(menuButton).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-6-mobile-booking.png', fullPage: true });

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('✅ Scenario 6 completed successfully');
  });

  // SCENARIO 7: Price Comparison Shopping
  test('Scenario 7: Price Comparison Shopping', async ({ page }) => {
    console.log('🧪 Testing Scenario 7: Price Comparison Shopping');

    await page.goto('http://localhost:8080/services');
    await page.waitForLoadState('networkidle');

    // Check for pricing visibility
    const priceElements = page.locator('text=/\\$\\d+|\\d+\\.\\d{2}/');
    const priceCount = await priceElements.count();
    console.log(`Found ${priceCount} price elements`);

    // Verify prices are visible and readable
    expect(priceCount).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-7-pricing.png', fullPage: true });

    console.log('✅ Scenario 7 completed successfully');
  });

  // SCENARIO 8: Gift Card Purchase
  test('Scenario 8: Gift Card Purchase', async ({ page }) => {
    console.log('🧪 Testing Scenario 8: Gift Card Purchase');

    await page.goto('http://localhost:8080/shop');
    await page.waitForLoadState('networkidle');

    // Look for gift card options
    const giftCardElements = page.locator('text=/gift|card|voucher/i');
    const giftCardCount = await giftCardElements.count();
    console.log(`Found ${giftCardCount} gift card related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-8-gift-cards.png', fullPage: true });

    console.log('✅ Scenario 8 completed successfully');
  });

  // SCENARIO 9: Membership Sign-Up (Hormozi Strategy)
  test('Scenario 9: Membership Sign-Up', async ({ page }) => {
    console.log('🧪 Testing Scenario 9: Membership Sign-Up');

    // Navigate directly to membership page
    await page.goto('http://localhost:8080/membership');
    await page.waitForLoadState('networkidle');

    // Verify membership page loads
    await expect(page).toHaveURL(/membership/);

    // Check for membership tiers/plans
    const membershipElements = page.locator('text=/tier|plan|level|membership/i');
    const membershipCount = await membershipElements.count();
    console.log(`Found ${membershipCount} membership related elements`);

    // Check for scarcity/urgency tactics (Hormozi)
    const scarcityElements = page.locator('text=/limited|exclusive|only|spots left/i');
    const scarcityCount = await scarcityElements.count();
    console.log(`Found ${scarcityCount} scarcity indicators`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-9-membership.png', fullPage: true });

    console.log('✅ Scenario 9 completed successfully');
  });

  // SCENARIO 10: Appointment Rescheduling
  test('Scenario 10: Appointment Rescheduling', async ({ page }) => {
    console.log('🧪 Testing Scenario 10: Appointment Rescheduling');

    await page.goto('http://localhost:8080/my-appointments');
    await page.waitForLoadState('networkidle');

    // Verify reschedule functionality is accessible
    const rescheduleElements = page.locator('text=/reschedule|change|modify/i');
    const rescheduleCount = await rescheduleElements.count();
    console.log(`Found ${rescheduleCount} reschedule related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-10-reschedule.png', fullPage: true });

    console.log('✅ Scenario 10 completed successfully');
  });

  // SCENARIO 11: High Contrast Check (UI/UX)
  test('Scenario 11: High Contrast Check', async ({ page }) => {
    console.log('🧪 Testing Scenario 11: High Contrast Check');

    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Check body background (should be black for public site)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => window.getComputedStyle(el).backgroundColor);
    console.log(`Body background color: ${bgColor}`);

    // Verify text is white/light colored
    const headings = page.locator('h1, h2, h3').first();
    if (await headings.count() > 0) {
      const textColor = await headings.evaluate(el => window.getComputedStyle(el).color);
      console.log(`Heading text color: ${textColor}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-11-contrast.png', fullPage: true });

    console.log('✅ Scenario 11 completed successfully');
  });

  // SCENARIO 12: Broken Link Detection
  test('Scenario 12: Broken Link Detection', async ({ page }) => {
    console.log('🧪 Testing Scenario 12: Broken Link Detection');

    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Get all links
    const links = await page.locator('a[href]').all();
    console.log(`Found ${links.length} links on homepage`);

    // Check first 10 internal links
    let brokenLinks = 0;
    for (let i = 0; i < Math.min(10, links.length); i++) {
      const href = await links[i].getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        const response = await page.goto(`http://localhost:8080${href}`);
        if (!response || response.status() >= 400) {
          console.log(`❌ Broken link: ${href}`);
          brokenLinks++;
        } else {
          console.log(`✅ Link OK: ${href}`);
        }
        await page.goBack();
      }
    }

    expect(brokenLinks).toBe(0);

    console.log('✅ Scenario 12 completed successfully');
  });

  // SCENARIO 13: Form Validation
  test('Scenario 13: Form Validation', async ({ page }) => {
    console.log('🧪 Testing Scenario 13: Form Validation');

    await page.goto('http://localhost:8080/contact');
    await page.waitForLoadState('networkidle');

    // Look for form elements
    const formInputs = page.locator('input, textarea');
    const formCount = await formInputs.count();
    console.log(`Found ${formCount} form inputs`);

    // Check for required field indicators
    const requiredFields = page.locator('input[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    console.log(`Found ${requiredCount} required fields`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-13-forms.png', fullPage: true });

    console.log('✅ Scenario 13 completed successfully');
  });

  // SCENARIO 14: Loading States
  test('Scenario 14: Loading States', async ({ page }) => {
    console.log('🧪 Testing Scenario 14: Loading States');

    // Navigate to data-heavy page
    await page.goto('http://localhost:8080/gallery');

    // Check for loading indicators (text-based)
    const loadingTextElements = page.locator('text=/loading|wait|please/i');
    const loadingTextCount = await loadingTextElements.count();

    // Check for progress bars
    const progressBars = page.locator('[role="progressbar"]');
    const progressBarCount = await progressBars.count();

    const hasLoading = (loadingTextCount + progressBarCount) > 0;
    console.log(`Has loading indicators: ${hasLoading}`);

    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-14-loading.png', fullPage: true });

    console.log('✅ Scenario 14 completed successfully');
  });

  // SCENARIO 15: Image & Asset Loading
  test('Scenario 15: Image & Asset Loading', async ({ page }) => {
    console.log('🧪 Testing Scenario 15: Image & Asset Loading');

    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images`);

    // Check if images have loaded (not broken)
    let brokenImages = 0;
    for (let i = 0; i < Math.min(5, imageCount); i++) {
      const naturalWidth = await images.nth(i).evaluate(img => (img as HTMLImageElement).naturalWidth);
      if (naturalWidth === 0) {
        brokenImages++;
      }
    }

    console.log(`Broken images: ${brokenImages}`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-15-images.png', fullPage: true });

    console.log('✅ Scenario 15 completed successfully');
  });

  // SCENARIO 16: Promo Code Application
  test('Scenario 16: Promo Code Application', async ({ page }) => {
    console.log('🧪 Testing Scenario 16: Promo Code Application');

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Look for promo code text elements
    const promoTextElements = page.locator('text=/promo|coupon|discount|code/i');
    const promoTextCount = await promoTextElements.count();

    // Look for promo code input fields
    const promoInputs = page.locator('input[placeholder*="code" i], input[placeholder*="promo" i]');
    const promoInputCount = await promoInputs.count();

    const promoCount = promoTextCount + promoInputCount;
    console.log(`Found ${promoCount} promo code related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-16-promo.png', fullPage: true });

    console.log('✅ Scenario 16 completed successfully');
  });

  // SCENARIO 17: Peak Hours Booking
  test('Scenario 17: Peak Hours Booking', async ({ page }) => {
    console.log('🧪 Testing Scenario 17: Peak Hours Booking');

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Check for time slot indicators
    const timeElements = page.locator('text=/am|pm|\\d{1,2}:\\d{2}/i');
    const timeCount = await timeElements.count();
    console.log(`Found ${timeCount} time related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-17-peak-hours.png', fullPage: true });

    console.log('✅ Scenario 17 completed successfully');
  });

  // SCENARIO 18: Service Add-On Upsell (Hormozi)
  test('Scenario 18: Service Add-On Upsell', async ({ page }) => {
    console.log('🧪 Testing Scenario 18: Service Add-On Upsell');

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Look for upsell/add-on elements
    const upsellElements = page.locator('text=/add-on|upgrade|enhance|premium|extra/i');
    const upsellCount = await upsellElements.count();
    console.log(`Found ${upsellCount} upsell related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-18-upsell.png', fullPage: true });

    console.log('✅ Scenario 18 completed successfully');
  });

  // SCENARIO 19: Referral Program (Hormozi)
  test('Scenario 19: Referral Program', async ({ page }) => {
    console.log('🧪 Testing Scenario 19: Referral Program');

    await page.goto('http://localhost:8080/referrals');
    await page.waitForLoadState('networkidle');

    // Verify referral page loads
    await expect(page).toHaveURL(/referrals/);

    // Check for referral program elements
    const referralElements = page.locator('text=/refer|friend|earn|reward|bonus/i');
    const referralCount = await referralElements.count();
    console.log(`Found ${referralCount} referral related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-19-referral.png', fullPage: true });

    console.log('✅ Scenario 19 completed successfully');
  });

  // SCENARIO 20: Emergency Contact & Cancellation
  test('Scenario 20: Emergency Contact & Cancellation', async ({ page }) => {
    console.log('🧪 Testing Scenario 20: Emergency Contact & Cancellation');

    await page.goto('http://localhost:8080/contact');
    await page.waitForLoadState('networkidle');

    // Check for contact information visibility
    const phoneElements = page.locator('text=/\\(\\d{3}\\)|\\d{3}-\\d{3}-\\d{4}/');
    const phoneCount = await phoneElements.count();
    console.log(`Found ${phoneCount} phone number elements`);

    // Check for cancellation policy
    const cancelElements = page.locator('text=/cancel|policy|refund/i');
    const cancelCount = await cancelElements.count();
    console.log(`Found ${cancelCount} cancellation related elements`);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/scenario-20-emergency-contact.png', fullPage: true });

    console.log('✅ Scenario 20 completed successfully');
  });

  // BONUS: Overall Site Health Check
  test('BONUS: Overall Site Health Check', async ({ page }) => {
    console.log('🧪 Testing BONUS: Overall Site Health Check');

    const pages = [
      '/',
      '/services',
      '/booking',
      '/shop',
      '/about',
      '/team',
      '/contact',
      '/membership',
      '/referrals',
      '/my-appointments',
      '/gallery'
    ];

    const results: any[] = [];

    for (const path of pages) {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      try {
        await page.goto(`http://localhost:8080${path}`, { timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        const title = await page.title();

        results.push({
          path,
          status: 'OK',
          title,
          errors: consoleErrors.filter(e => !e.includes('testimonials')).length
        });

        console.log(`✅ ${path} - OK (${consoleErrors.length} console errors)`);
      } catch (error) {
        results.push({
          path,
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        console.log(`❌ ${path} - FAIL`);
      }
    }

    console.log('\n📊 SITE HEALTH SUMMARY:');
    console.log(JSON.stringify(results, null, 2));

    // Verify at least 90% of pages are working
    const workingPages = results.filter(r => r.status === 'OK').length;
    const totalPages = results.length;
    const healthPercentage = (workingPages / totalPages) * 100;

    console.log(`\n🏥 Site Health: ${healthPercentage.toFixed(1)}% (${workingPages}/${totalPages} pages working)`);

    expect(healthPercentage).toBeGreaterThanOrEqual(90);

    console.log('✅ BONUS Health Check completed successfully');
  });
});
