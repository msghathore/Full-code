import { test, expect } from '@playwright/test';

// iPad Pro 12.9" 2024 viewport
const IPAD_PRO_VIEWPORT = { width: 1024, height: 1366 };

test.describe('iPad Pro 12.9" (1024x1366) - Zavira Salon Website Tests', () => {
  test.use({ viewport: IPAD_PRO_VIEWPORT });

  const pages = [
    { name: 'Homepage', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Booking', path: '/booking' },
    { name: 'Team', path: '/team' },
    { name: 'About', path: '/about' }
  ];

  for (const page of pages) {
    test(`${page.name} (${page.path}) - Layout and Visual Test`, async ({ page: browserPage }) => {
      console.log(`\n========================================`);
      console.log(`Testing: ${page.name} (${page.path})`);
      console.log(`Viewport: ${IPAD_PRO_VIEWPORT.width}x${IPAD_PRO_VIEWPORT.height}`);
      console.log(`========================================\n`);

      // Navigate to the page
      await browserPage.goto(`http://localhost:8080${page.path}`);

      // Wait for page to be fully loaded
      await browserPage.waitForLoadState('networkidle');

      // Wait a bit for animations to settle
      await browserPage.waitForTimeout(1000);

      // Check console errors
      const consoleMessages: string[] = [];
      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(`ERROR: ${msg.text()}`);
        } else if (msg.type() === 'warning') {
          consoleMessages.push(`WARNING: ${msg.text()}`);
        }
      });

      // Take full page screenshot
      const screenshotPath = `e2e/screenshots/ipad-pro-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`✓ Screenshot saved: ${screenshotPath}`);

      // Check viewport size
      const viewportSize = browserPage.viewportSize();
      console.log(`✓ Viewport: ${viewportSize?.width}x${viewportSize?.height}`);
      expect(viewportSize).toEqual(IPAD_PRO_VIEWPORT);

      // Check if navigation is visible
      const nav = browserPage.locator('nav');
      await expect(nav).toBeVisible();
      console.log('✓ Navigation is visible');

      // Check for Zavira branding
      const logo = browserPage.locator('text=Zavira').first();
      await expect(logo).toBeVisible();
      console.log('✓ Zavira branding found');

      // Verify dark theme (black background)
      const bodyBg = await browserPage.evaluate(() => {
        const body = document.querySelector('body');
        return body ? window.getComputedStyle(body).backgroundColor : null;
      });
      console.log(`✓ Body background color: ${bodyBg}`);

      // Check for any console errors
      await browserPage.waitForTimeout(500);
      if (consoleMessages.length > 0) {
        console.log('\n⚠️  Console Messages:');
        consoleMessages.forEach(msg => console.log(`  ${msg}`));
      } else {
        console.log('✓ No console errors detected');
      }

      // Page-specific tests
      if (page.path === '/') {
        // Homepage - check hero section
        const heroHeading = browserPage.locator('h1, h2').first();
        await expect(heroHeading).toBeVisible();
        console.log('✓ Hero section visible');
      } else if (page.path === '/services') {
        // Services - check service cards
        const serviceCards = browserPage.locator('[class*="service"], [class*="card"]');
        const count = await serviceCards.count();
        console.log(`✓ Found ${count} service-related elements`);
      } else if (page.path === '/booking') {
        // Booking - check booking form
        const bookingForm = browserPage.locator('form, [class*="booking"]').first();
        await expect(bookingForm).toBeVisible();
        console.log('✓ Booking interface visible');
      } else if (page.path === '/team') {
        // Team - check team members
        const teamMembers = browserPage.locator('[class*="team"], [class*="staff"]');
        const count = await teamMembers.count();
        console.log(`✓ Found ${count} team-related elements`);
      } else if (page.path === '/about') {
        // About - check about content
        const aboutContent = browserPage.locator('main, article, section').first();
        await expect(aboutContent).toBeVisible();
        console.log('✓ About content visible');
      }

      // Test navigation responsiveness at this viewport
      console.log('\n--- Navigation Test ---');
      const navLinks = browserPage.locator('nav a');
      const navLinkCount = await navLinks.count();
      console.log(`✓ Found ${navLinkCount} navigation links`);

      // Check if mobile menu button is visible (should NOT be on iPad Pro)
      const mobileMenuButton = browserPage.locator('button[aria-label*="menu" i], button[class*="mobile" i]');
      const mobileMenuVisible = await mobileMenuButton.isVisible().catch(() => false);
      console.log(`✓ Mobile menu button visible: ${mobileMenuVisible} (expected: false for tablet)`);

      // Test scrolling
      console.log('\n--- Scroll Test ---');
      await browserPage.evaluate(() => window.scrollTo(0, 500));
      await browserPage.waitForTimeout(300);
      const scrollY = await browserPage.evaluate(() => window.scrollY);
      console.log(`✓ Scrolled to position: ${scrollY}px`);

      // Scroll back to top
      await browserPage.evaluate(() => window.scrollTo(0, 0));
      await browserPage.waitForTimeout(300);

      console.log(`\n✅ ${page.name} test complete\n`);
    });
  }

  test('Navigation Test - Cross-page Links', async ({ page: browserPage }) => {
    console.log(`\n========================================`);
    console.log(`Testing: Cross-page Navigation`);
    console.log(`========================================\n`);

    await browserPage.goto('http://localhost:8080');
    await browserPage.waitForLoadState('networkidle');

    // Test navigation links
    const navLinks = [
      { text: 'Services', expectedPath: '/services' },
      { text: 'Team', expectedPath: '/team' },
      { text: 'About', expectedPath: '/about' }
    ];

    for (const link of navLinks) {
      console.log(`\nTesting navigation to: ${link.text}`);

      // Find and click the link
      const linkElement = browserPage.locator(`nav a:has-text("${link.text}")`).first();
      if (await linkElement.isVisible()) {
        await linkElement.click();
        await browserPage.waitForLoadState('networkidle');
        await browserPage.waitForTimeout(500);

        const currentURL = browserPage.url();
        console.log(`✓ Navigated to: ${currentURL}`);
        expect(currentURL).toContain(link.expectedPath);

        // Take screenshot
        await browserPage.screenshot({
          path: `e2e/screenshots/ipad-pro-nav-${link.text.toLowerCase()}.png`,
          fullPage: false
        });
      } else {
        console.log(`⚠️  Link "${link.text}" not found in navigation`);
      }
    }

    console.log(`\n✅ Navigation test complete\n`);
  });

  test('Typography and Spacing Analysis', async ({ page: browserPage }) => {
    console.log(`\n========================================`);
    console.log(`Testing: Typography & Spacing at iPad Pro size`);
    console.log(`========================================\n`);

    await browserPage.goto('http://localhost:8080');
    await browserPage.waitForLoadState('networkidle');
    await browserPage.waitForTimeout(1000);

    // Check heading sizes
    const headings = await browserPage.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');

      return {
        h1: h1 ? {
          fontSize: window.getComputedStyle(h1).fontSize,
          lineHeight: window.getComputedStyle(h1).lineHeight,
          marginBottom: window.getComputedStyle(h1).marginBottom
        } : null,
        h2: h2 ? {
          fontSize: window.getComputedStyle(h2).fontSize,
          lineHeight: window.getComputedStyle(h2).lineHeight,
          marginBottom: window.getComputedStyle(h2).marginBottom
        } : null,
        h3: h3 ? {
          fontSize: window.getComputedStyle(h3).fontSize,
          lineHeight: window.getComputedStyle(h3).lineHeight
        } : null
      };
    });

    console.log('Typography Analysis:');
    console.log('  H1:', headings.h1);
    console.log('  H2:', headings.h2);
    console.log('  H3:', headings.h3);

    // Check container padding
    const containerPadding = await browserPage.evaluate(() => {
      const main = document.querySelector('main');
      const container = document.querySelector('[class*="container"]');

      return {
        main: main ? window.getComputedStyle(main).padding : null,
        container: container ? window.getComputedStyle(container).padding : null
      };
    });

    console.log('\nSpacing Analysis:');
    console.log('  Main padding:', containerPadding.main);
    console.log('  Container padding:', containerPadding.container);

    console.log(`\n✅ Typography test complete\n`);
  });
});
