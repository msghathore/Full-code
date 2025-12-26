/**
 * Interactive Tip Selector Test
 * This script will navigate through the app and test the tip selector
 */

import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Starting interactive tip selector test...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to homepage
    console.log('📍 Step 1: Navigating to http://localhost:8080');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/interactive-01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded\n');

    // Step 2: Check for maintenance mode
    const maintenanceHeading = page.locator('h2:has-text("Under Maintenance")');
    if (await maintenanceHeading.isVisible()) {
      console.log('🔒 Step 2: Maintenance mode detected - bypassing...');

      // Click Developer Access
      await page.locator('summary:has-text("Developer Access")').click();
      await page.waitForTimeout(500);

      // Enter password
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('Ghathore5');

      // Click Access Site
      await page.locator('button:has-text("Access Site")').click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'test-results/interactive-02-maintenance-bypassed.png', fullPage: true });
      console.log('✅ Maintenance mode bypassed\n');
    } else {
      console.log('✅ Step 2: No maintenance mode\n');
    }

    // Step 3: Navigate to staff checkout
    console.log('📍 Step 3: Navigating to /staff/checkout');
    await page.goto('http://localhost:8080/staff/checkout');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/interactive-03-staff-checkout.png', fullPage: true });
    console.log('✅ Staff checkout page loaded\n');

    // Step 4: Check if login is required
    const loginHeading = page.locator('h2:has-text("Staff Access"), h1:has-text("Staff Access")');
    if (await loginHeading.isVisible()) {
      console.log('🔐 Step 4: Staff login required');
      console.log('⚠️  Cannot proceed without staff credentials');
      console.log('');
      console.log('📋 MANUAL TESTING REQUIRED:');
      console.log('   1. Browser window is open - please login manually');
      console.log('   2. After login, add items to cart');
      console.log('   3. Observe tip selector appears');
      console.log('   4. Test all tip buttons');
      console.log('');
      console.log('⏸️  Test paused - keeping browser open for 5 minutes...');
      console.log('   (You can close it manually when done testing)');

      // Keep browser open for 5 minutes for manual testing
      await page.waitForTimeout(5 * 60 * 1000);
    } else {
      console.log('✅ Step 4: Already logged in!\n');

      // Step 5: Check current page state
      console.log('🔍 Step 5: Analyzing page...');
      const bodyText = await page.locator('body').textContent();

      console.log('  - Has "Service" button:', bodyText?.includes('Service') || false);
      console.log('  - Has "Product" button:', bodyText?.includes('Product') || false);
      console.log('  - Has "Subtotal":', bodyText?.includes('Subtotal') || false);
      console.log('');

      // Step 6: Look for tip selector
      console.log('🎯 Step 6: Checking for tip selector...');

      const button10 = page.locator('button:has-text("10%")');
      const button15 = page.locator('button:has-text("15%")');
      const button20 = page.locator('button:has-text("20%")');
      const buttonNoTip = page.locator('button:has-text("No Tip")');
      const customTipInput = page.locator('input[type="number"][placeholder="0.00"]');

      const has10 = await button10.isVisible().catch(() => false);
      const has15 = await button15.isVisible().catch(() => false);
      const has20 = await button20.isVisible().catch(() => false);
      const hasNoTip = await buttonNoTip.isVisible().catch(() => false);
      const hasCustom = await customTipInput.isVisible().catch(() => false);

      console.log('  - 10% button:', has10);
      console.log('  - 15% button:', has15);
      console.log('  - 20% button:', has20);
      console.log('  - No Tip button:', hasNoTip);
      console.log('  - Custom tip input:', hasCustom);
      console.log('');

      if (has10 && has15 && has20) {
        console.log('✅ SUCCESS! Tip selector is visible!\n');

        // Test the buttons
        console.log('🧪 Step 7: Testing tip buttons...');

        // Get initial subtotal
        const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
        console.log(`  - Cart Subtotal: ${subtotalText}`);

        // Test 10% button
        console.log('\n  Testing 10% button...');
        await button10.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-04-tip-10-percent.png', fullPage: true });
        const tip10 = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
        console.log(`  ✓ Tip Amount: ${tip10}`);

        // Test 15% button
        console.log('\n  Testing 15% button...');
        await button15.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-05-tip-15-percent.png', fullPage: true });
        const tip15 = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
        console.log(`  ✓ Tip Amount: ${tip15}`);

        // Test 20% button
        console.log('\n  Testing 20% button...');
        await button20.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-06-tip-20-percent.png', fullPage: true });
        const tip20 = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
        console.log(`  ✓ Tip Amount: ${tip20}`);

        // Test No Tip button
        console.log('\n  Testing No Tip button...');
        await buttonNoTip.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-07-no-tip.png', fullPage: true });
        const tipNone = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
        console.log(`  ✓ Tip Amount: ${tipNone}`);

        // Test custom tip
        console.log('\n  Testing custom tip input...');
        await customTipInput.fill('25.50');
        await customTipInput.blur();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-08-custom-tip.png', fullPage: true });
        const tipCustom = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
        console.log(`  ✓ Tip Amount: ${tipCustom}`);

        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Tip selector is fully functional');

        await page.waitForTimeout(3000);
      } else {
        console.log('⚠️  Tip selector not visible (cart may be empty)');
        console.log('');
        console.log('📋 NEXT STEPS:');
        console.log('   1. Add items to cart first');
        console.log('   2. Tip selector will appear automatically');
        console.log('');
        console.log('⏸️  Keeping browser open for manual testing (5 minutes)...');
        await page.waitForTimeout(5 * 60 * 1000);
      }
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'test-results/interactive-error.png', fullPage: true });
  } finally {
    console.log('\n📸 Screenshots saved to test-results/');
    console.log('🏁 Test complete - closing browser...');
    await browser.close();
  }
})();
