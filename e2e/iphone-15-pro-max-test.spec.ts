import { test, expect } from '@playwright/test';

/**
 * iPhone 15 Pro Max Mobile Testing Suite
 * Viewport: 430x932
 *
 * Tests:
 * - Homepage, Services, Booking, Contact, About pages
 * - Theme verification (black bg, white glowing text)
 * - Mobile navigation
 * - Console errors
 * - Touch target sizes
 */

const IPHONE_15_PRO_MAX = {
  width: 430,
  height: 932,
};

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Booking', path: '/booking' },
  { name: 'Contact', path: '/contact' },
  { name: 'About', path: '/about' },
];

test.describe('iPhone 15 Pro Max - Mobile Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPhone 15 Pro Max viewport
    await page.setViewportSize(IPHONE_15_PRO_MAX);
  });

  for (const pageInfo of pages) {
    test(`${pageInfo.name} Page - Mobile Verification`, async ({ page }) => {
      const consoleErrors: string[] = [];

      // Capture console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navigate to page
      await page.goto(`http://localhost:8080${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Allow animations to complete

      // Take full page screenshot
      await page.screenshot({
        path: `e2e/screenshots/iphone-15-pro-max-${pageInfo.name.toLowerCase().replace(' ', '-')}-full.png`,
        fullPage: true,
      });

      // Take viewport screenshot
      await page.screenshot({
        path: `e2e/screenshots/iphone-15-pro-max-${pageInfo.name.toLowerCase().replace(' ', '-')}-viewport.png`,
        fullPage: false,
      });

      // 1. VERIFY THEME: Black background
      const bodyBg = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
        };
      });

      console.log(`${pageInfo.name} - Body styles:`, bodyBg);

      // 2. VERIFY WHITE TEXT WITH GLOW
      const textElements = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
        return headings.slice(0, 5).map(el => {
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            text: el.textContent?.substring(0, 50),
            color: style.color,
            textShadow: style.textShadow,
          };
        });
      });

      console.log(`${pageInfo.name} - Text elements:`, textElements);

      // 3. CHECK MOBILE NAVIGATION
      const mobileNavButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
      const isMobileNavVisible = await mobileNavButton.isVisible().catch(() => false);

      if (isMobileNavVisible) {
        // Click to open mobile nav
        await mobileNavButton.click();
        await page.waitForTimeout(500);

        // Take screenshot with nav open
        await page.screenshot({
          path: `e2e/screenshots/iphone-15-pro-max-${pageInfo.name.toLowerCase().replace(' ', '-')}-nav-open.png`,
        });

        // Check nav links are visible
        const navLinks = page.locator('nav a, [role="navigation"] a');
        const navLinksCount = await navLinks.count();
        console.log(`${pageInfo.name} - Mobile nav links found: ${navLinksCount}`);

        // Close nav
        await mobileNavButton.click();
        await page.waitForTimeout(500);
      }

      // 4. CHECK TOUCH TARGET SIZES
      const touchTargets = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        return buttons.slice(0, 10).map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: el.textContent?.substring(0, 30),
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height,
          };
        }).filter(t => t.width > 0 && t.height > 0);
      });

      console.log(`${pageInfo.name} - Touch targets:`, touchTargets);

      // Check for targets smaller than 44x44 (Apple's recommended minimum)
      const smallTargets = touchTargets.filter(t => t.width < 44 || t.height < 44);
      if (smallTargets.length > 0) {
        console.warn(`${pageInfo.name} - Found ${smallTargets.length} touch targets smaller than 44x44:`, smallTargets);
      }

      // 5. VERIFY NO HORIZONTAL SCROLL
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll) {
        console.warn(`${pageInfo.name} - Page has horizontal scroll!`);
      }

      // 6. CHECK FOR CONSOLE ERRORS
      if (consoleErrors.length > 0) {
        console.error(`${pageInfo.name} - Console errors found:`, consoleErrors);
      }

      // 7. VERIFY RESPONSIVE IMAGES
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => {
          const rect = img.getBoundingClientRect();
          return {
            src: img.src.substring(0, 50),
            alt: img.alt,
            width: rect.width,
            naturalWidth: img.naturalWidth,
            overflows: rect.width > window.innerWidth,
          };
        });
      });

      const overflowingImages = images.filter(img => img.overflows);
      if (overflowingImages.length > 0) {
        console.warn(`${pageInfo.name} - Found ${overflowingImages.length} overflowing images:`, overflowingImages);
      }

      // Generate test report
      const report = {
        page: pageInfo.name,
        viewport: IPHONE_15_PRO_MAX,
        timestamp: new Date().toISOString(),
        results: {
          backgroundColor: bodyBg.backgroundColor,
          textColor: bodyBg.color,
          mobileNavFound: isMobileNavVisible,
          consoleErrors: consoleErrors.length,
          smallTouchTargets: smallTargets.length,
          horizontalScroll: hasHorizontalScroll,
          overflowingImages: overflowingImages.length,
        },
        issues: [
          ...(consoleErrors.length > 0 ? [`${consoleErrors.length} console errors`] : []),
          ...(smallTargets.length > 0 ? [`${smallTargets.length} touch targets < 44x44px`] : []),
          ...(hasHorizontalScroll ? ['Horizontal scroll detected'] : []),
          ...(overflowingImages.length > 0 ? [`${overflowingImages.length} images overflow viewport`] : []),
        ],
      };

      console.log(`\n${'='.repeat(60)}`);
      console.log(`TEST REPORT: ${pageInfo.name}`);
      console.log('='.repeat(60));
      console.log(JSON.stringify(report, null, 2));
      console.log('='.repeat(60) + '\n');

      // Assertions
      expect(consoleErrors.length).toBe(0);
      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('Mobile Navigation - Full Interaction Test', async ({ page }) => {
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(1000);

    // Find and click mobile menu
    const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    await expect(menuButton).toBeVisible();

    // Take screenshot before opening
    await page.screenshot({
      path: 'e2e/screenshots/iphone-15-pro-max-mobile-nav-closed.png',
    });

    await menuButton.click();
    await page.waitForTimeout(500);

    // Take screenshot with nav open
    await page.screenshot({
      path: 'e2e/screenshots/iphone-15-pro-max-mobile-nav-open.png',
    });

    // Verify nav links are clickable
    const navLinks = page.locator('nav a, [role="navigation"] a').filter({ hasText: /.+/ });
    const linksCount = await navLinks.count();

    console.log(`Found ${linksCount} navigation links`);
    expect(linksCount).toBeGreaterThan(0);

    // Test first link is clickable (but don't click to avoid navigation)
    const firstLink = navLinks.first();
    await expect(firstLink).toBeVisible();

    const linkInfo = await firstLink.evaluate(el => ({
      text: el.textContent,
      href: (el as HTMLAnchorElement).href,
    }));

    console.log('First nav link:', linkInfo);

    // Close menu
    await menuButton.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'e2e/screenshots/iphone-15-pro-max-mobile-nav-closed-after.png',
    });
  });

  test('Logo and Brand Verification', async ({ page }) => {
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(1000);

    // Find logo
    const logo = page.locator('img[alt*="Zavira" i], img[alt*="logo" i]').first();

    if (await logo.isVisible()) {
      // Get logo styles
      const logoInfo = await logo.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          width: rect.width,
          height: rect.height,
          src: (el as HTMLImageElement).src,
          alt: (el as HTMLImageElement).alt,
          filter: style.filter,
        };
      });

      console.log('Logo info:', logoInfo);

      // Screenshot logo area
      await logo.screenshot({
        path: 'e2e/screenshots/iphone-15-pro-max-logo.png',
      });

      expect(logoInfo.width).toBeGreaterThan(0);
      expect(logoInfo.height).toBeGreaterThan(0);
    }

    // Check for brand text with glow
    const brandText = page.locator('text=/zavira/i').first();
    if (await brandText.isVisible()) {
      const textStyle = await brandText.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          textShadow: style.textShadow,
          fontSize: style.fontSize,
        };
      });

      console.log('Brand text style:', textStyle);
    }
  });
});
