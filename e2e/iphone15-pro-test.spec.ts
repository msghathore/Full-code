import { test, expect } from '@playwright/test';

/**
 * iPhone 15 Pro Viewport Testing
 * Tests all main pages on iPhone 15 Pro viewport (393x852)
 * Checks: layout, text visibility, console errors, navigation
 */

const IPHONE_15_PRO_VIEWPORT = {
  width: 393,
  height: 852,
};

const BASE_URL = 'http://localhost:8080';

const PAGES_TO_TEST = [
  { name: 'Homepage', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Booking', path: '/booking' },
  { name: 'Team', path: '/team' },
  { name: 'Shop', path: '/shop' },
];

test.describe('iPhone 15 Pro Viewport Tests', () => {
  test.use({
    viewport: IPHONE_15_PRO_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  for (const page of PAGES_TO_TEST) {
    test(`${page.name} page - Layout and Console Check`, async ({ page: browserPage }) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Listen for console messages
      browserPage.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
          errors.push(text);
        } else if (type === 'warning') {
          warnings.push(text);
        }
      });

      // Navigate to page
      console.log(`\n📱 Testing: ${page.name} (${page.path})`);
      await browserPage.goto(`${BASE_URL}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for page to be fully loaded
      await browserPage.waitForTimeout(2000);

      // Take screenshot
      const screenshotPath = `e2e/screenshots/iphone15-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);

      // Check viewport size
      const viewport = browserPage.viewportSize();
      console.log(`📐 Viewport: ${viewport?.width}x${viewport?.height}`);
      expect(viewport?.width).toBe(IPHONE_15_PRO_VIEWPORT.width);
      expect(viewport?.height).toBe(IPHONE_15_PRO_VIEWPORT.height);

      // Check for critical console errors (filter out common third-party warnings)
      const criticalErrors = errors.filter(err =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.toLowerCase().includes('third-party') &&
        !err.includes('Extension')
      );

      if (criticalErrors.length > 0) {
        console.log(`❌ Console Errors Found:`);
        criticalErrors.forEach(err => console.log(`   - ${err}`));
      } else {
        console.log(`✅ No critical console errors`);
      }

      if (warnings.length > 0) {
        console.log(`⚠️  Console Warnings (${warnings.length})`);
      }

      // Verify page background (should be black for public pages)
      const body = browserPage.locator('body');
      const bgColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`🎨 Background color: ${bgColor}`);

      // Should be black or very dark (rgb(0, 0, 0) or close to it)
      const isBlackBg = bgColor === 'rgb(0, 0, 0)' ||
                        bgColor === 'rgb(2, 6, 23)' || // slate-950
                        bgColor.startsWith('rgba(0, 0, 0') ||
                        bgColor.startsWith('rgba(2, 6, 23');

      if (isBlackBg) {
        console.log(`✅ Correct black background detected`);
      } else {
        console.log(`⚠️  Background is not black: ${bgColor}`);
      }

      // Check for white glowing text (check main heading)
      const heading = browserPage.locator('h1, h2').first();
      if (await heading.count() > 0) {
        const textColor = await heading.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            textShadow: style.textShadow,
          };
        });

        console.log(`📝 Heading color: ${textColor.color}`);
        console.log(`✨ Text shadow: ${textColor.textShadow}`);

        const hasWhiteText = textColor.color.includes('255, 255, 255') ||
                             textColor.color.includes('rgb(255, 255, 255)');
        const hasGlow = textColor.textShadow && textColor.textShadow !== 'none';

        if (hasWhiteText && hasGlow) {
          console.log(`✅ Correct white glowing text detected`);
        } else {
          console.log(`⚠️  Text styling issue - White: ${hasWhiteText}, Glow: ${hasGlow}`);
        }
      }

      // Test mobile navigation menu
      console.log(`\n🧭 Testing Mobile Navigation...`);

      // Look for hamburger menu button
      const menuButton = browserPage.locator('button[aria-label*="menu" i], button:has(svg), [role="button"]:has(svg)').first();

      if (await menuButton.count() > 0) {
        console.log(`✅ Mobile menu button found`);

        // Click to open menu
        await menuButton.click();
        await browserPage.waitForTimeout(500);

        // Take screenshot of open menu
        await browserPage.screenshot({
          path: `e2e/screenshots/iphone15-${page.name.toLowerCase().replace(/\s+/g, '-')}-menu-open.png`,
        });
        console.log(`📸 Menu screenshot saved`);

        // Check if menu is visible
        const menu = browserPage.locator('[role="dialog"], nav, .mobile-menu, [class*="mobile"]').first();
        const isVisible = await menu.isVisible().catch(() => false);

        if (isVisible) {
          console.log(`✅ Mobile menu opens correctly`);

          // Close menu
          await menuButton.click();
          await browserPage.waitForTimeout(500);
        } else {
          console.log(`⚠️  Mobile menu visibility issue`);
        }
      } else {
        console.log(`⚠️  Mobile menu button not found`);
      }

      // Check for layout issues (horizontal scrolling)
      const hasHorizontalScroll = await browserPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        console.log(`⚠️  Horizontal scrolling detected (layout overflow issue)`);
      } else {
        console.log(`✅ No horizontal scrolling (layout fits viewport)`);
      }

      // Summary
      console.log(`\n📊 Test Summary for ${page.name}:`);
      console.log(`   - Console Errors: ${criticalErrors.length}`);
      console.log(`   - Console Warnings: ${warnings.length}`);
      console.log(`   - Background: ${isBlackBg ? 'Black ✅' : 'Not Black ⚠️'}`);
      console.log(`   - Layout: ${hasHorizontalScroll ? 'Overflow ⚠️' : 'Fits ✅'}`);
      console.log(`   - Screenshots: 1-2 captured`);
      console.log(`\n${'='.repeat(60)}\n`);

      // Assertions (soft - won't fail test but will log)
      expect.soft(criticalErrors.length).toBe(0);
    });
  }

  test('Navigation Links - All Pages Accessible', async ({ page: browserPage }) => {
    console.log(`\n🔗 Testing Navigation Links Accessibility...\n`);

    await browserPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await browserPage.waitForTimeout(1000);

    // Open mobile menu
    const menuButton = browserPage.locator('button[aria-label*="menu" i], button:has(svg)').first();
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await browserPage.waitForTimeout(500);
    }

    // Test each navigation link
    for (const pageInfo of PAGES_TO_TEST) {
      const linkText = pageInfo.name === 'Homepage' ? 'Home' : pageInfo.name;
      const link = browserPage.locator(`a:has-text("${linkText}")`).first();

      if (await link.count() > 0) {
        console.log(`✅ Link found: ${linkText}`);

        // Click and verify navigation
        await link.click();
        await browserPage.waitForTimeout(1500);

        const currentUrl = browserPage.url();
        const expectedPath = pageInfo.path === '/' ? BASE_URL + '/' : BASE_URL + pageInfo.path;

        if (currentUrl.includes(pageInfo.path)) {
          console.log(`   ✅ Navigation successful to ${pageInfo.path}`);
        } else {
          console.log(`   ⚠️  Navigation issue - Expected: ${pageInfo.path}, Got: ${currentUrl}`);
        }

        // Go back to home for next test
        if (pageInfo.path !== '/') {
          await browserPage.goto(BASE_URL);
          await browserPage.waitForTimeout(1000);

          // Reopen menu
          if (await menuButton.count() > 0) {
            await menuButton.click();
            await browserPage.waitForTimeout(500);
          }
        }
      } else {
        console.log(`⚠️  Link not found: ${linkText}`);
      }
    }

    console.log(`\n${'='.repeat(60)}\n`);
  });

  test('Text Readability - Contrast Check', async ({ page: browserPage }) => {
    console.log(`\n📖 Testing Text Readability and Contrast...\n`);

    await browserPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await browserPage.waitForTimeout(2000);

    // Check various text elements
    const textElements = await browserPage.locator('h1, h2, h3, p, a, button').all();
    const textIssues: string[] = [];

    for (let i = 0; i < Math.min(textElements.length, 10); i++) {
      const element = textElements[i];
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          textShadow: computed.textShadow,
        };
      });

      const text = await element.textContent();
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());

      // Check for white/light text on black background
      const isLightText = styles.color.includes('255, 255, 255') ||
                          styles.color.includes('rgb(255') ||
                          styles.color.includes('rgba(255');

      if (!isLightText && text && text.trim().length > 0) {
        textIssues.push(`<${tagName}> has dark text: ${styles.color}`);
      }
    }

    if (textIssues.length > 0) {
      console.log(`⚠️  Text Contrast Issues Found:`);
      textIssues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log(`✅ All checked text elements have good contrast (white on black)`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
  });

  test('Performance - Load Times', async ({ page: browserPage }) => {
    console.log(`\n⏱️  Testing Page Load Performance...\n`);

    for (const pageInfo of PAGES_TO_TEST) {
      const startTime = Date.now();

      await browserPage.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
      });

      const loadTime = Date.now() - startTime;
      console.log(`${pageInfo.name.padEnd(15)} - Load time: ${loadTime}ms ${loadTime < 3000 ? '✅' : '⚠️'}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
  });
});
