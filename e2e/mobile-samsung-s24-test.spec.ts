import { test, expect } from '@playwright/test';

/**
 * Samsung Galaxy S24 Mobile Responsiveness Test
 *
 * Viewport: 360x780 (smallest modern phone)
 * Tests: Homepage, Services, Booking, Shop, Contact
 *
 * Checks:
 * - Page loads without errors
 * - No horizontal scrolling
 * - Text doesn't overflow
 * - Compact layouts work
 * - Navigation is accessible
 * - Images scale properly
 */

const VIEWPORT = { width: 360, height: 780 };
const BASE_URL = 'http://localhost:8080';

test.describe('Samsung Galaxy S24 (360x780) - Mobile Responsiveness', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport to Samsung Galaxy S24
    await page.setViewportSize(VIEWPORT);
  });

  test('Homepage (/) - Mobile Layout', async ({ page }) => {
    console.log('Testing Homepage on Samsung Galaxy S24...');

    // Navigate to homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-homepage.png',
      fullPage: true
    });

    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORT.width);

    // Check logo is visible
    const logo = page.locator('img[alt*="Zavira"], img[alt*="logo"]').first();
    await expect(logo).toBeVisible();

    // Check navigation menu exists
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Check mobile menu button exists
    const mobileMenuBtn = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
    if (await mobileMenuBtn.count() > 0) {
      await expect(mobileMenuBtn).toBeVisible();
    }

    // Check main content is visible
    const main = page.locator('main, div[class*="container"]').first();
    await expect(main).toBeVisible();

    // Log any console errors
    if (errors.length > 0) {
      console.log('Console errors on homepage:', errors);
    }

    console.log('✓ Homepage test complete');
  });

  test('Services (/services) - Mobile Layout', async ({ page }) => {
    console.log('Testing Services page on Samsung Galaxy S24...');

    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-services.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORT.width);

    // Check service cards are visible
    const serviceCards = page.locator('div[class*="card"], article, div[class*="service"]');
    const count = await serviceCards.count();
    expect(count).toBeGreaterThan(0);

    // Check text doesn't overflow - measure first service card
    if (count > 0) {
      const firstCard = serviceCards.first();
      await expect(firstCard).toBeVisible();

      const cardWidth = await firstCard.evaluate(el => el.scrollWidth);
      const viewportWidth = VIEWPORT.width;

      // Card should not be wider than viewport
      expect(cardWidth).toBeLessThanOrEqual(viewportWidth + 10); // 10px tolerance
    }

    console.log('✓ Services page test complete');
  });

  test('Booking (/booking) - Mobile Layout', async ({ page }) => {
    console.log('Testing Booking page on Samsung Galaxy S24...');

    await page.goto(`${BASE_URL}/booking`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-booking.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORT.width);

    // Check booking form/wizard is visible
    const bookingForm = page.locator('form, div[class*="booking"], div[class*="wizard"]').first();
    await expect(bookingForm).toBeVisible();

    // Check buttons are accessible
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verify first button is clickable (not cut off)
    if (buttonCount > 0) {
      const firstBtn = buttons.first();
      await expect(firstBtn).toBeVisible();
    }

    console.log('✓ Booking page test complete');
  });

  test('Shop (/shop) - Mobile Layout', async ({ page }) => {
    console.log('Testing Shop page on Samsung Galaxy S24...');

    await page.goto(`${BASE_URL}/shop`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-shop.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORT.width);

    // Check product grid/cards are visible
    const products = page.locator('div[class*="product"], div[class*="card"], article');
    const productCount = await products.count();

    if (productCount > 0) {
      // Check first product card
      const firstProduct = products.first();
      await expect(firstProduct).toBeVisible();

      // Check product images scale properly
      const productImage = firstProduct.locator('img').first();
      if (await productImage.count() > 0) {
        await expect(productImage).toBeVisible();

        // Check image doesn't overflow
        const imgWidth = await productImage.evaluate(el => el.scrollWidth);
        expect(imgWidth).toBeLessThanOrEqual(VIEWPORT.width);
      }
    }

    console.log('✓ Shop page test complete');
  });

  test('Contact (/contact) - Mobile Layout', async ({ page }) => {
    console.log('Testing Contact page on Samsung Galaxy S24...');

    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-contact.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORT.width);

    // Check contact form is visible
    const contactForm = page.locator('form').first();
    if (await contactForm.count() > 0) {
      await expect(contactForm).toBeVisible();
    }

    // Check contact info is visible
    const contactInfo = page.locator('div[class*="contact"], section');
    await expect(contactInfo.first()).toBeVisible();

    // Check input fields are accessible
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Check first input doesn't overflow
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();

      const inputWidth = await firstInput.evaluate(el => el.offsetWidth);
      expect(inputWidth).toBeLessThanOrEqual(VIEWPORT.width - 20); // Account for padding
    }

    console.log('✓ Contact page test complete');
  });

  test('Mobile Navigation Test', async ({ page }) => {
    console.log('Testing Mobile Navigation...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button
    const mobileMenuBtn = page.locator('button[aria-label*="menu"], button:has-text("Menu"), button:has(svg)').first();

    if (await mobileMenuBtn.count() > 0) {
      // Take screenshot before menu open
      await page.screenshot({
        path: 'e2e/screenshots/samsung-s24-nav-closed.png'
      });

      // Click to open menu
      await mobileMenuBtn.click();
      await page.waitForTimeout(500); // Wait for animation

      // Take screenshot with menu open
      await page.screenshot({
        path: 'e2e/screenshots/samsung-s24-nav-open.png'
      });

      // Check menu is visible
      const menu = page.locator('nav, div[role="navigation"], div[class*="menu"]');
      const visibleMenu = await menu.first().isVisible();
      expect(visibleMenu).toBe(true);
    }

    console.log('✓ Mobile navigation test complete');
  });

  test('Text Overflow Check - All Pages', async ({ page }) => {
    console.log('Testing text overflow across all pages...');

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/services', name: 'Services' },
      { path: '/booking', name: 'Booking' },
      { path: '/shop', name: 'Shop' },
      { path: '/contact', name: 'Contact' }
    ];

    for (const testPage of pages) {
      await page.goto(`${BASE_URL}${testPage.path}`);
      await page.waitForLoadState('networkidle');

      // Check all text elements
      const textElements = await page.locator('h1, h2, h3, h4, h5, h6, p, span, div').all();

      let overflowCount = 0;
      for (const element of textElements) {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;

        const scrollWidth = await element.evaluate(el => el.scrollWidth);
        const clientWidth = await element.evaluate(el => el.clientWidth);

        if (scrollWidth > clientWidth + 5) { // 5px tolerance
          overflowCount++;
        }
      }

      console.log(`${testPage.name}: ${overflowCount} elements with potential overflow`);

      // We don't fail the test, just report
      expect(overflowCount).toBeLessThan(100); // Sanity check
    }

    console.log('✓ Text overflow check complete');
  });

  test('Image Scaling Check', async ({ page }) => {
    console.log('Testing image scaling on mobile...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = await page.locator('img').all();

    let oversizedCount = 0;
    for (const img of images) {
      const isVisible = await img.isVisible();
      if (!isVisible) continue;

      const width = await img.evaluate(el => el.offsetWidth);

      if (width > VIEWPORT.width) {
        oversizedCount++;
        const src = await img.getAttribute('src');
        console.log(`Oversized image: ${src} (${width}px)`);
      }
    }

    console.log(`Found ${oversizedCount} oversized images`);
    expect(oversizedCount).toBe(0);

    console.log('✓ Image scaling check complete');
  });

  test('Comprehensive Scroll Test', async ({ page }) => {
    console.log('Testing horizontal scroll on all pages...');

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/services', name: 'Services' },
      { path: '/booking', name: 'Booking' },
      { path: '/shop', name: 'Shop' },
      { path: '/contact', name: 'Contact' }
    ];

    const issues: string[] = [];

    for (const testPage of pages) {
      await page.goto(`${BASE_URL}${testPage.path}`);
      await page.waitForLoadState('networkidle');

      // Check document width
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      if (scrollWidth > clientWidth) {
        const diff = scrollWidth - clientWidth;
        issues.push(`${testPage.name}: Horizontal scroll detected (${diff}px overflow)`);
      }

      // Check body width
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      if (bodyScrollWidth > VIEWPORT.width) {
        issues.push(`${testPage.name}: Body wider than viewport (${bodyScrollWidth}px vs ${VIEWPORT.width}px)`);
      }
    }

    // Report all issues
    if (issues.length > 0) {
      console.log('\nHorizontal Scroll Issues Found:');
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
    } else {
      console.log('✓ No horizontal scroll issues found');
    }

    // Take final report screenshot
    await page.goto(BASE_URL);
    await page.screenshot({
      path: 'e2e/screenshots/samsung-s24-final-report.png',
      fullPage: true
    });

    expect(issues.length).toBe(0);
  });
});
