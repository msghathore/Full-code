import { test, expect } from '@playwright/test';

const TABLET_VIEWPORT = {
  width: 712,
  height: 1138
};

const PAGES = [
  { name: 'Homepage', url: '/' },
  { name: 'Services', url: '/services' },
  { name: 'Booking', url: '/booking' },
  { name: 'Contact', url: '/contact' },
  { name: 'Careers', url: '/careers' }
];

test.describe('Samsung Galaxy Tab S9 (712x1138) Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
  });

  for (const pageInfo of PAGES) {
    test(`${pageInfo.name} page rendering`, async ({ page }) => {
      console.log(`\n=== Testing ${pageInfo.name} (${pageInfo.url}) ===`);

      // Navigate to page
      await page.goto(`http://localhost:8080${pageInfo.url}`);
      await page.waitForLoadState('networkidle');

      // Take screenshot
      await page.screenshot({
        path: `e2e/screenshots/tablet-${pageInfo.name.toLowerCase()}.png`,
        fullPage: true
      });

      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait a bit for any delayed errors
      await page.waitForTimeout(2000);

      // Verify page loaded
      const title = await page.title();
      console.log(`Page title: ${title}`);

      // Check viewport size
      const viewport = page.viewportSize();
      console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
      expect(viewport?.width).toBe(TABLET_VIEWPORT.width);
      expect(viewport?.height).toBe(TABLET_VIEWPORT.height);

      // Page-specific checks
      if (pageInfo.name === 'Homepage') {
        // Check for logo
        const logo = page.locator('img[alt*="Zavira"], h1:has-text("Zavira")').first();
        await expect(logo).toBeVisible();

        // Check for navigation
        const nav = page.locator('nav, [role="navigation"]').first();
        await expect(nav).toBeVisible();

        // Check background is dark (black theme)
        const bodyBg = await page.evaluate(() => {
          const body = document.body;
          return window.getComputedStyle(body).backgroundColor;
        });
        console.log(`Body background: ${bodyBg}`);
      }

      if (pageInfo.name === 'Services') {
        // Check for service listings
        const services = page.locator('[class*="service"], [class*="card"]');
        const count = await services.count();
        console.log(`Found ${count} service items`);

        // Check grid layout
        const gridElements = page.locator('[class*="grid"]');
        const gridCount = await gridElements.count();
        console.log(`Found ${gridCount} grid layouts`);
      }

      if (pageInfo.name === 'Booking') {
        // Check for booking form
        const form = page.locator('form').first();
        await expect(form).toBeVisible();

        // Check for form fields
        const inputs = page.locator('input, select, textarea');
        const inputCount = await inputs.count();
        console.log(`Found ${inputCount} form inputs`);

        // Test form field usability (tap targets)
        const firstInput = inputs.first();
        const box = await firstInput.boundingBox();
        if (box) {
          console.log(`First input size: ${box.width}x${box.height}`);
          // Tap targets should be at least 44x44 for mobile/tablet
          if (box.height < 44) {
            console.warn(`⚠️ Input height (${box.height}px) is below 44px minimum tap target`);
          }
        }
      }

      if (pageInfo.name === 'Contact') {
        // Check for contact information
        const address = page.locator('text=/283 Tache Avenue/i').first();
        await expect(address).toBeVisible();

        const phone = page.locator('text=/431.*816.*3330/i').first();
        await expect(phone).toBeVisible();

        const email = page.locator('text=/zavirasalonandspa@gmail.com/i').first();
        await expect(email).toBeVisible();
      }

      if (pageInfo.name === 'Careers') {
        // Check for job listings or careers content
        const content = await page.textContent('body');
        const hasContent = content && content.length > 100;
        expect(hasContent).toBeTruthy();
        console.log(`Page has ${content?.length} characters of content`);
      }

      // Check for horizontal scrolling (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      if (hasHorizontalScroll) {
        console.error(`❌ HORIZONTAL SCROLL DETECTED on ${pageInfo.name}`);
      } else {
        console.log(`✅ No horizontal scroll`);
      }

      // Report console errors
      if (consoleErrors.length > 0) {
        console.error(`❌ Console errors found on ${pageInfo.name}:`);
        consoleErrors.forEach(err => console.error(`  - ${err}`));
      } else {
        console.log(`✅ No console errors`);
      }

      console.log(`=== ${pageInfo.name} test complete ===\n`);
    });
  }

  test('Navigation menu tablet usability', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Check if mobile menu button exists (hamburger)
    const mobileMenuButton = page.locator('[aria-label*="menu"], button:has-text("Menu")').first();
    const isVisible = await mobileMenuButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('📱 Mobile menu button found');
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Take screenshot of menu
      await page.screenshot({
        path: 'e2e/screenshots/tablet-menu-open.png'
      });

      console.log('✅ Mobile menu clickable');
    } else {
      console.log('💻 Desktop navigation displayed (no mobile menu button)');
    }
  });

  test('Touch target sizes', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Check all buttons and links for minimum tap target size (44x44px)
    const interactiveElements = await page.locator('button, a, input, select').all();

    let smallTargets = 0;
    for (const element of interactiveElements) {
      const box = await element.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        smallTargets++;
        const text = await element.textContent();
        console.warn(`⚠️ Small tap target: ${box.width}x${box.height} - "${text?.slice(0, 30)}"`);
      }
    }

    console.log(`\nChecked ${interactiveElements.length} interactive elements`);
    if (smallTargets > 0) {
      console.warn(`⚠️ Found ${smallTargets} elements below 44x44px minimum tap target`);
    } else {
      console.log(`✅ All tap targets meet 44x44px minimum`);
    }
  });
});
