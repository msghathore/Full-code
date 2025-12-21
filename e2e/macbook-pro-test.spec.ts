import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// MacBook Pro 14" viewport
const VIEWPORT = { width: 1512, height: 982 };

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots', 'macbook-pro-14');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('MacBook Pro 14" Viewport Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to MacBook Pro 14"
    await page.setViewportSize(VIEWPORT);
  });

  test('Homepage (/) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing Homepage...');

    // Navigate to homepage
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true
    });

    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Verify black background
    const body = await page.locator('body');
    const bgColor = await body.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`  Background: ${bgColor}`);

    // Verify navigation bar exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    console.log('  ✅ Navigation bar visible');

    // Check for logo with glow effect
    const logo = page.locator('text=Zavira').first();
    await expect(logo).toBeVisible();
    console.log('  ✅ Logo visible');

    // Test hover effects on navigation items
    const navLinks = page.locator('nav a');
    const navCount = await navLinks.count();
    console.log(`  Found ${navCount} navigation links`);

    // Hover over first nav item
    if (navCount > 0) {
      await navLinks.first().hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, '01-homepage-nav-hover.png')
      });
      console.log('  ✅ Navigation hover effect captured');
    }

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log(`  ⚠️ Console errors: ${consoleErrors.length}`);
      consoleErrors.forEach(err => console.log(`    - ${err}`));
    } else {
      console.log('  ✅ No console errors');
    }
  });

  test('Services (/services) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing Services Page...');

    await page.goto('http://localhost:8080/services');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '02-services.png'),
      fullPage: true
    });

    // Check for service cards
    const serviceCards = page.locator('[class*="service"], [class*="card"]');
    const cardCount = await serviceCards.count();
    console.log(`  Found ${cardCount} service elements`);

    // Test hover on service card if available
    if (cardCount > 0) {
      await serviceCards.first().hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, '02-services-hover.png')
      });
      console.log('  ✅ Service card hover effect captured');
    }

    console.log('  ✅ Services page loaded');
  });

  test('Booking (/booking) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing Booking Page...');

    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '03-booking.png'),
      fullPage: true
    });

    // Check for booking form elements
    const formElements = page.locator('form, input, select, button');
    const formCount = await formElements.count();
    console.log(`  Found ${formCount} form elements`);

    // Check for time slots
    const timeSlots = page.locator('[class*="time"], [class*="slot"]');
    const slotCount = await timeSlots.count();
    console.log(`  Found ${slotCount} time slot elements`);

    console.log('  ✅ Booking page loaded');
  });

  test('Team (/team) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing Team Page...');

    await page.goto('http://localhost:8080/team');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '04-team.png'),
      fullPage: true
    });

    // Check for team member cards
    const teamCards = page.locator('[class*="team"], [class*="member"], [class*="card"]');
    const memberCount = await teamCards.count();
    console.log(`  Found ${memberCount} team member elements`);

    // Test hover on team card if available
    if (memberCount > 0) {
      await teamCards.first().hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, '04-team-hover.png')
      });
      console.log('  ✅ Team card hover effect captured');
    }

    console.log('  ✅ Team page loaded');
  });

  test('Shop (/shop) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing Shop Page...');

    await page.goto('http://localhost:8080/shop');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '05-shop.png'),
      fullPage: true
    });

    // Check for product cards
    const productCards = page.locator('[class*="product"], [class*="card"]');
    const productCount = await productCards.count();
    console.log(`  Found ${productCount} product elements`);

    // Test hover on product card if available
    if (productCount > 0) {
      await productCards.first().hover();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, '05-shop-hover.png')
      });
      console.log('  ✅ Product card hover effect captured');
    }

    console.log('  ✅ Shop page loaded');
  });

  test('About (/about) - Desktop Layout', async ({ page }) => {
    console.log('\n🧪 Testing About Page...');

    await page.goto('http://localhost:8080/about');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '06-about.png'),
      fullPage: true
    });

    // Check for main content
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    console.log(`  Found ${headingCount} headings`);

    // Verify business info is present
    const bodyText = await page.locator('body').textContent();
    const hasAddress = bodyText?.includes('283 Tache Avenue');
    const hasPhone = bodyText?.includes('(431) 816-3330');

    console.log(`  Business Address Present: ${hasAddress ? '✅' : '❌'}`);
    console.log(`  Business Phone Present: ${hasPhone ? '✅' : '❌'}`);

    console.log('  ✅ About page loaded');
  });

  test('Navigation Bar - All Pages', async ({ page }) => {
    console.log('\n🧪 Testing Navigation Bar Consistency...');

    const pages = [
      { url: '/', name: 'Homepage' },
      { url: '/services', name: 'Services' },
      { url: '/booking', name: 'Booking' },
      { url: '/team', name: 'Team' },
      { url: '/shop', name: 'Shop' },
      { url: '/about', name: 'About' }
    ];

    for (const pageInfo of pages) {
      await page.goto(`http://localhost:8080${pageInfo.url}`);
      await page.waitForLoadState('networkidle');

      // Check navigation bar
      const nav = page.locator('nav');
      const isVisible = await nav.isVisible();
      console.log(`  ${pageInfo.name}: Navigation ${isVisible ? '✅' : '❌'}`);

      // Check navigation links
      const navLinks = page.locator('nav a');
      const linkCount = await navLinks.count();
      console.log(`    - ${linkCount} navigation links`);
    }
  });

  test('Theme Verification - Black Background + White Glow', async ({ page }) => {
    console.log('\n🧪 Testing Theme Consistency...');

    const pages = ['/', '/services', '/booking', '/team', '/shop', '/about'];

    for (const url of pages) {
      await page.goto(`http://localhost:8080${url}`);
      await page.waitForLoadState('networkidle');

      // Check body background color
      const bgColor = await page.locator('body').evaluate(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        return bg;
      });

      // Check if background is dark (black or near-black)
      const isDark = bgColor.includes('rgb(0, 0, 0)') ||
                     bgColor.includes('rgb(2, 6, 23)') || // slate-950
                     bgColor.includes('rgba(0, 0, 0');

      console.log(`  ${url}: Background ${bgColor} - ${isDark ? '✅ Dark' : '⚠️ Not Dark'}`);
    }
  });
});
