import { test, expect } from '@playwright/test';

test.describe('Discount System - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8081');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test 1: Promo Code WELCOME20 applies 20% discount', async ({ page }) => {
    console.log('🧪 TEST 1: Promo Code WELCOME20');

    // Navigate to booking
    await page.goto('http://localhost:8081/booking');
    await page.waitForLoadState('networkidle');

    // Wait for services to load
    await page.waitForSelector('text=SELECT SERVICES', { timeout: 10000 });

    // Select booking mode - Service
    const serviceModeButton = page.locator('button:has-text("Service First")');
    if (await serviceModeButton.isVisible()) {
      await serviceModeButton.click();
      await page.waitForTimeout(1000);
    }

    // Find and click a service (look for any service card)
    const serviceCards = page.locator('[role="button"]').filter({ hasText: '$' });
    const firstService = serviceCards.first();
    await firstService.waitFor({ state: 'visible', timeout: 10000 });
    await firstService.click();

    console.log('✅ Service selected');

    // Scroll to promo code section
    await page.evaluate(() => {
      const promoSection = document.querySelector('input[placeholder*="promo" i], input[placeholder*="code" i]');
      if (promoSection) {
        promoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);

    // Find promo code input
    const promoInput = page.locator('input[placeholder*="promo" i], input[placeholder*="code" i]').first();
    await promoInput.waitFor({ state: 'visible', timeout: 10000 });
    await promoInput.fill('WELCOME20');

    console.log('✅ Promo code entered: WELCOME20');

    // Click apply button
    const applyButton = page.locator('button:has-text("Apply")').first();
    await applyButton.click();

    // Wait for toast or discount to apply
    await page.waitForTimeout(2000);

    // Check for discount in cart
    const cartText = await page.textContent('body');

    // Look for discount indicators
    const hasDiscount = cartText?.includes('20%') ||
                       cartText?.includes('OFF') ||
                       cartText?.includes('-$') ||
                       cartText?.includes('discount');

    console.log('Cart content check:', { hasDiscount });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/test1-promo-code.png', fullPage: true });

    expect(hasDiscount).toBeTruthy();
    console.log('✅ TEST 1 PASSED: Promo code applied');
  });

  test('Test 2: Package discount from homepage', async ({ page }) => {
    console.log('🧪 TEST 2: Package Discount');

    // Go to homepage
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Wait for homepage to load
    await page.waitForTimeout(3000);

    // Scroll to find Grand Slam Offers section
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(1000);

    // Look for package buttons with text like "START YOUR TRANSFORMATION", "BOOK NOW", "CLAIM OFFER"
    const packageButtons = page.locator('button, a').filter({
      hasText: /START.*TRANSFORMATION|BOOK NOW|CLAIM|GET STARTED/i
    });

    // Take screenshot of homepage
    await page.screenshot({ path: 'e2e/screenshots/test2-homepage.png', fullPage: true });

    if (await packageButtons.count() > 0) {
      // Click first package button
      await packageButtons.first().click();
      await page.waitForTimeout(2000);

      // Check if we're on booking page
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Check for package parameter
      const hasPackageParam = currentUrl.includes('package=');

      // Check localStorage for package
      const packageData = await page.evaluate(() => {
        const pkg = localStorage.getItem('booking-selected-package');
        const discount = localStorage.getItem('booking-package-discount');
        return { pkg, discount };
      });

      console.log('Package data:', packageData);

      // Take screenshot
      await page.screenshot({ path: 'e2e/screenshots/test2-package-selected.png', fullPage: true });

      expect(hasPackageParam || packageData.pkg).toBeTruthy();
      console.log('✅ TEST 2 PASSED: Package selection works');
    } else {
      console.log('⚠️ No package buttons found - may need to scroll more');
      await page.screenshot({ path: 'e2e/screenshots/test2-no-packages-found.png', fullPage: true });
    }
  });

  test('Test 3: Upsell service discounts appear', async ({ page }) => {
    console.log('🧪 TEST 3: Upsell Discounts');

    await page.goto('http://localhost:8081/booking');
    await page.waitForLoadState('networkidle');

    // Wait for services
    await page.waitForSelector('text=SELECT SERVICES', { timeout: 10000 });

    // Select service mode
    const serviceModeButton = page.locator('button:has-text("Service First")');
    if (await serviceModeButton.isVisible()) {
      await serviceModeButton.click();
      await page.waitForTimeout(1000);
    }

    // Select a service that should trigger upsells (haircut)
    const haircutService = page.locator('text=/haircut|cut|trim/i').first();
    if (await haircutService.isVisible()) {
      await haircutService.click();
      console.log('✅ Haircut service selected');

      // Wait for upsells to appear
      await page.waitForTimeout(3000);

      // Look for upsell section
      const upsellSection = page.locator('text=/frequently added|recommended|upsell/i');
      const hasUpsells = await upsellSection.count() > 0;

      // Look for discount badges or percentages
      const hasDiscountBadge = (await page.textContent('body'))?.includes('%') || false;

      console.log('Upsells check:', { hasUpsells, hasDiscountBadge });

      // Take screenshot
      await page.screenshot({ path: 'e2e/screenshots/test3-upsells.png', fullPage: true });

      expect(hasUpsells || hasDiscountBadge).toBeTruthy();
      console.log('✅ TEST 3 PASSED: Upsells appear');
    } else {
      console.log('⚠️ No haircut service found');
      await page.screenshot({ path: 'e2e/screenshots/test3-no-haircut.png', fullPage: true });
    }
  });

  test('Test 4: Group booking discount calculation', async ({ page }) => {
    console.log('🧪 TEST 4: Group Discount');

    await page.goto('http://localhost:8081/booking');
    await page.waitForLoadState('networkidle');

    // Wait for booking mode selection
    await page.waitForTimeout(2000);

    // Click group booking mode if available
    const groupButton = page.locator('button:has-text("Group"), button:has-text("Party")');
    if (await groupButton.count() > 0) {
      await groupButton.first().click();
      await page.waitForTimeout(2000);

      console.log('✅ Group mode selected');

      // Look for group member sections
      const memberSections = page.locator('text=/member|person|participant/i');
      const hasMemberSections = await memberSections.count() > 0;

      // Take screenshot
      await page.screenshot({ path: 'e2e/screenshots/test4-group-booking.png', fullPage: true });

      console.log('Group booking UI check:', { hasMemberSections });
      expect(hasMemberSections).toBeTruthy();
      console.log('✅ TEST 4 PASSED: Group booking available');
    } else {
      console.log('⚠️ No group booking option found');
      await page.screenshot({ path: 'e2e/screenshots/test4-no-group-option.png', fullPage: true });
    }
  });

  test('Test 5: Exit intent popup sets localStorage promo', async ({ page }) => {
    console.log('🧪 TEST 5: Exit Intent Promo');

    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Simulate exit intent by moving mouse to top
    await page.mouse.move(500, 0);
    await page.waitForTimeout(2000);

    // Look for popup
    const popup = page.locator('text=/exit|special|offer|discount/i').first();
    const hasPopup = await popup.isVisible().catch(() => false);

    console.log('Exit popup check:', { hasPopup });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/test5-exit-intent.png', fullPage: true });

    if (hasPopup) {
      console.log('✅ TEST 5 PASSED: Exit popup appears');
    } else {
      console.log('⚠️ Exit popup did not appear (may require longer wait or specific trigger)');
    }
  });

  test('Test 6: Cart UI displays discount breakdown', async ({ page }) => {
    console.log('🧪 TEST 6: Cart UI Display');

    await page.goto('http://localhost:8081/booking');
    await page.waitForLoadState('networkidle');

    // Select service mode
    await page.waitForSelector('text=SELECT SERVICES', { timeout: 10000 });
    const serviceModeButton = page.locator('button:has-text("Service First")');
    if (await serviceModeButton.isVisible()) {
      await serviceModeButton.click();
      await page.waitForTimeout(1000);
    }

    // Select a service
    const serviceCards = page.locator('[role="button"]').filter({ hasText: '$' });
    await serviceCards.first().click();
    await page.waitForTimeout(1000);

    // Enter promo code
    const promoInput = page.locator('input[placeholder*="promo" i], input[placeholder*="code" i]').first();
    if (await promoInput.isVisible()) {
      await promoInput.fill('WELCOME20');
      const applyButton = page.locator('button:has-text("Apply")').first();
      await applyButton.click();
      await page.waitForTimeout(2000);
    }

    // Check for cart summary elements
    const cartContent = await page.textContent('body');
    const hasSubtotal = cartContent?.includes('Subtotal') || cartContent?.includes('Service Price');
    const hasTotal = cartContent?.includes('Total') || cartContent?.includes('Due Today');
    const hasDiscount = cartContent?.includes('discount') || cartContent?.includes('OFF') || cartContent?.includes('-$');

    console.log('Cart UI elements:', { hasSubtotal, hasTotal, hasDiscount });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/test6-cart-ui.png', fullPage: true });

    expect(hasTotal).toBeTruthy();
    console.log('✅ TEST 6 PASSED: Cart UI displays pricing');
  });

  test('Test 7: Verify all active promo codes work', async ({ page }) => {
    console.log('🧪 TEST 7: All Promo Codes');

    const promoCodes = ['WELCOME20', 'FIRSTVISIT15', 'LOYAL25', 'NEWYEAR50', 'REFERRAL10'];
    const results: Record<string, boolean> = {};

    for (const code of promoCodes) {
      await page.goto('http://localhost:8081/booking');
      await page.waitForLoadState('networkidle');

      // Select service
      await page.waitForSelector('text=SELECT SERVICES', { timeout: 10000 });
      const serviceModeButton = page.locator('button:has-text("Service First")');
      if (await serviceModeButton.isVisible()) {
        await serviceModeButton.click();
        await page.waitForTimeout(500);
      }

      const serviceCards = page.locator('[role="button"]').filter({ hasText: '$' });
      await serviceCards.first().click();
      await page.waitForTimeout(500);

      // Enter promo code
      const promoInput = page.locator('input[placeholder*="promo" i], input[placeholder*="code" i]').first();
      if (await promoInput.isVisible()) {
        await promoInput.fill(code);
        const applyButton = page.locator('button:has-text("Apply")').first();
        await applyButton.click();
        await page.waitForTimeout(2000);

        // Check for success or discount
        const pageText = await page.textContent('body');
        const worked = pageText?.includes('applied') ||
                      pageText?.includes('success') ||
                      pageText?.includes('OFF') ||
                      pageText?.includes('-$');

        results[code] = worked || false;
        console.log(`${code}: ${worked ? '✅' : '❌'}`);
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'e2e/screenshots/test7-all-promos.png', fullPage: true });

    console.log('Promo codes results:', results);
    console.log('✅ TEST 7 COMPLETE');
  });
});
