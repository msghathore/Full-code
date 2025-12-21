import { test, expect } from '@playwright/test';

/**
 * iPad Air 2024 Viewport Testing
 * Testing all main pages at 820x1180 resolution
 *
 * Test Coverage:
 * - Homepage (/)
 * - Services (/services)
 * - Booking (/booking)
 * - Blog (/blog)
 * - Shop (/shop)
 */

const IPAD_AIR_2024_VIEWPORT = {
  width: 820,
  height: 1180
};

const BASE_URL = 'http://localhost:8080';

const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/services', name: 'Services' },
  { path: '/booking', name: 'Booking' },
  { path: '/blog', name: 'Blog' },
  { path: '/shop', name: 'Shop' }
];

test.describe('iPad Air 2024 (820x1180) - Viewport Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport to iPad Air 2024 dimensions
    await page.setViewportSize(IPAD_AIR_2024_VIEWPORT);
  });

  PAGES_TO_TEST.forEach(({ path, name }) => {
    test(`${name} page - iPad Air 2024`, async ({ page }) => {
      // Array to collect console errors
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // Listen for console messages
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
        if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      // Navigate to page
      console.log(`\n📱 Testing: ${name} (${path})`);
      console.log(`Viewport: ${IPAD_AIR_2024_VIEWPORT.width}x${IPAD_AIR_2024_VIEWPORT.height}`);

      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Allow animations to complete

      // Take full page screenshot
      const screenshotPath = `e2e/screenshots/ipad-air-2024-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`✅ Screenshot saved: ${screenshotPath}`);

      // Check for console errors
      if (consoleErrors.length > 0) {
        console.log(`⚠️ Console Errors Found (${consoleErrors.length}):`);
        consoleErrors.forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('✅ No console errors');
      }

      // Check for console warnings
      if (consoleWarnings.length > 0) {
        console.log(`⚠️ Console Warnings Found (${consoleWarnings.length}):`);
        consoleWarnings.slice(0, 5).forEach(warn => console.log(`  - ${warn}`));
      }

      // Verify page basics
      await expect(page).toHaveTitle(/Zavira/i);
      console.log('✅ Page title contains "Zavira"');

      // Check if main content is visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();
      console.log('✅ Body element is visible');

      // Check for images and verify they load
      const images = await page.locator('img').all();
      console.log(`📷 Found ${images.length} images`);

      let loadedImages = 0;
      let failedImages = 0;

      for (const img of images) {
        const isVisible = await img.isVisible().catch(() => false);
        if (isVisible) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth > 0) {
            loadedImages++;
          } else {
            failedImages++;
            const src = await img.getAttribute('src');
            console.log(`  ❌ Failed to load: ${src}`);
          }
        }
      }

      console.log(`✅ Loaded images: ${loadedImages}/${images.length}`);
      if (failedImages > 0) {
        console.log(`❌ Failed images: ${failedImages}`);
      }

      // Test responsive breakpoints by checking computed styles
      const navigation = await page.locator('nav').first();
      if (await navigation.isVisible().catch(() => false)) {
        const navDisplay = await navigation.evaluate(el =>
          window.getComputedStyle(el).display
        );
        console.log(`✅ Navigation display: ${navDisplay}`);
      }

      // Test scroll behavior (if page is scrollable)
      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = IPAD_AIR_2024_VIEWPORT.height;

      if (scrollHeight > viewportHeight) {
        console.log(`📜 Page is scrollable (${scrollHeight}px content in ${viewportHeight}px viewport)`);

        // Scroll to middle
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(500);

        // Take screenshot at middle scroll
        await page.screenshot({
          path: `e2e/screenshots/ipad-air-2024-${name.toLowerCase().replace(/\s+/g, '-')}-scrolled.png`,
          fullPage: false // Viewport only
        });

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
      } else {
        console.log('✅ Page fits within viewport (no scroll needed)');
      }

      // Page-specific tests
      if (path === '/') {
        // Homepage specific checks
        const hero = await page.locator('h1').first();
        await expect(hero).toBeVisible();
        console.log('✅ Hero heading is visible');
      }

      if (path === '/services') {
        // Check for service cards/listings
        const serviceElements = await page.locator('[class*="service"]').all();
        console.log(`✅ Found ${serviceElements.length} service elements`);
      }

      if (path === '/booking') {
        // Check for booking form elements
        const forms = await page.locator('form').all();
        console.log(`✅ Found ${forms.length} form(s)`);
      }

      if (path === '/blog') {
        // Check for blog posts
        const articles = await page.locator('article').all();
        console.log(`✅ Found ${articles.length} article(s)`);
      }

      if (path === '/shop') {
        // Check for product cards
        const products = await page.locator('[class*="product"]').all();
        console.log(`✅ Found ${products.length} product elements`);
      }

      // Test touch interaction simulation
      console.log('🖱️ Testing touch interactions...');

      // Find first clickable button
      const firstButton = await page.locator('button, a[href]').first();
      if (await firstButton.isVisible().catch(() => false)) {
        const buttonText = await firstButton.textContent();
        console.log(`✅ First interactive element: "${buttonText?.trim().substring(0, 30)}..."`);

        // Test hover state (simulated touch)
        await firstButton.hover();
        await page.waitForTimeout(300);
        console.log('✅ Hover interaction successful');
      }

      // Final assertions
      expect(consoleErrors.filter(err =>
        !err.includes('DevTools') &&
        !err.includes('Extension') &&
        !err.includes('WebSocket')
      ).length).toBe(0); // No critical console errors

      console.log(`\n✅ ${name} page test completed successfully!\n`);
    });
  });

  test('Summary Report', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 iPad Air 2024 Testing Summary');
    console.log('='.repeat(60));
    console.log(`Viewport: ${IPAD_AIR_2024_VIEWPORT.width}x${IPAD_AIR_2024_VIEWPORT.height}`);
    console.log(`Pages Tested: ${PAGES_TO_TEST.length}`);
    console.log('\nPages:');
    PAGES_TO_TEST.forEach(({ name, path }) => {
      console.log(`  - ${name} (${path})`);
    });
    console.log('\n📸 Screenshots saved in: e2e/screenshots/');
    console.log('='.repeat(60) + '\n');
  });
});
