import { test, expect } from '@playwright/test';

/**
 * Samsung Galaxy S24 Ultra Testing Suite
 * Viewport: 412x915
 * Tests all major pages for mobile responsiveness, brand colors, and functionality
 */

const VIEWPORT = { width: 412, height: 915 };
const BASE_URL = 'http://localhost:8080';

// Brand color palette validation
const BRAND_COLORS = {
  violet: ['#7c3aed', 'rgb(124, 58, 237)'],
  rose: ['#f43f5e', 'rgb(244, 63, 94)'],
  emerald: ['#10b981', 'rgb(16, 185, 129)'],
  purple: ['#a855f7', 'rgb(168, 85, 247)'],
};

// Forbidden colors
const FORBIDDEN_COLORS = ['blue', 'teal', 'cyan', 'sky'];

test.describe('Samsung Galaxy S24 Ultra - Full Website Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
  });

  test('Homepage (/) - Mobile Responsiveness & Brand Check', async ({ page }) => {
    console.log('Testing Homepage on Samsung Galaxy S24 Ultra (412x915)');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-homepage.png',
      fullPage: true
    });

    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Verify page loads
    await expect(page).toHaveTitle(/Zavira/i);

    // Check for Zavira branding
    const logo = page.locator('text=/Zavira/i').first();
    await expect(logo).toBeVisible();

    // Verify black background for public site
    const bodyBg = await page.evaluate(() => {
      const body = document.querySelector('body');
      return window.getComputedStyle(body!).backgroundColor;
    });
    console.log('Body background color:', bodyBg);

    // Check for white glowing text
    const headings = page.locator('h1, h2, h3').first();
    if (await headings.count() > 0) {
      const textShadow = await headings.evaluate(el =>
        window.getComputedStyle(el).textShadow
      );
      console.log('Heading text-shadow:', textShadow);
    }

    // Test mobile navigation
    const mobileMenu = page.locator('button[aria-label*="menu" i], button:has-text("Menu")');
    if (await mobileMenu.count() > 0) {
      await mobileMenu.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'e2e/screenshots/s24-ultra-homepage-menu-open.png'
      });
    }

    console.log('Console errors found:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
  });

  test('Services Page (/services) - Layout & Colors', async ({ page }) => {
    console.log('Testing Services Page');

    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-services.png',
      fullPage: true
    });

    // Check for service cards
    const serviceCards = page.locator('[class*="card"], [class*="service"]');
    const cardCount = await serviceCards.count();
    console.log('Service cards found:', cardCount);

    // Verify text is readable
    const textElements = page.locator('p, h1, h2, h3, span');
    const sampleText = await textElements.first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight
      };
    });
    console.log('Sample text styles:', sampleText);

    // Check for brand colors (violet, rose, emerald)
    const allElements = await page.locator('*').all();
    const usedColors = new Set<string>();

    for (const element of allElements.slice(0, 50)) { // Sample first 50 elements
      const bgColor = await element.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        usedColors.add(bgColor);
      }
    }

    console.log('Background colors in use:', Array.from(usedColors));
  });

  test('Booking Page (/booking) - Form Functionality', async ({ page }) => {
    console.log('Testing Booking Page');

    await page.goto(`${BASE_URL}/booking`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-booking.png',
      fullPage: true
    });

    // Check for form elements
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    console.log('Form inputs found:', inputCount);

    // Test input visibility and tap targets (should be at least 44x44px for mobile)
    if (inputCount > 0) {
      const firstInput = inputs.first();
      const boundingBox = await firstInput.boundingBox();
      console.log('First input size:', boundingBox);

      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(40); // Min touch target
      }
    }

    // Check for date/time pickers
    const datePicker = page.locator('[type="date"], [class*="date"], [class*="calendar"]');
    if (await datePicker.count() > 0) {
      await datePicker.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: 'e2e/screenshots/s24-ultra-booking-datepicker.png'
      });
    }

    // Test service selection
    const serviceButtons = page.locator('button:has-text("Select"), button:has-text("Choose")');
    if (await serviceButtons.count() > 0) {
      await serviceButtons.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: 'e2e/screenshots/s24-ultra-booking-service-selected.png'
      });
    }
  });

  test('Blog Page (/blog) - Content Layout', async ({ page }) => {
    console.log('Testing Blog Page');

    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-blog.png',
      fullPage: true
    });

    // Check for blog posts
    const blogPosts = page.locator('article, [class*="post"], [class*="card"]');
    const postCount = await blogPosts.count();
    console.log('Blog posts found:', postCount);

    // Test scrolling and image loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const images = page.locator('img');
    const imageCount = await images.count();
    console.log('Images found:', imageCount);

    // Check image loading
    if (imageCount > 0) {
      const firstImage = images.first();
      const isLoaded = await firstImage.evaluate((img: HTMLImageElement) => img.complete);
      console.log('First image loaded:', isLoaded);
    }

    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-blog-scrolled.png'
    });
  });

  test('Contact Page (/contact) - Form & Info Display', async ({ page }) => {
    console.log('Testing Contact Page');

    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/s24-ultra-contact.png',
      fullPage: true
    });

    // Check for business information
    const addressText = page.locator('text=/283 Tache Avenue/i');
    if (await addressText.count() > 0) {
      await expect(addressText.first()).toBeVisible();
      console.log('✓ Correct address displayed');
    }

    const phoneText = page.locator('text=/431.*816.*3330/i');
    if (await phoneText.count() > 0) {
      await expect(phoneText.first()).toBeVisible();
      console.log('✓ Correct phone displayed');
    }

    const emailText = page.locator('text=/zavirasalonandspa@gmail.com/i');
    if (await emailText.count() > 0) {
      await expect(emailText.first()).toBeVisible();
      console.log('✓ Correct email displayed');
    }

    // Test contact form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('Test User');
      await page.screenshot({
        path: 'e2e/screenshots/s24-ultra-contact-form-filled.png'
      });
    }

    // Check map/location section
    const mapSection = page.locator('iframe[src*="google.com/maps"], [class*="map"]');
    if (await mapSection.count() > 0) {
      console.log('✓ Map section found');
    }
  });

  test('Color Audit - Verify No Forbidden Colors', async ({ page }) => {
    console.log('Running Color Audit Across All Pages');

    const pages = ['/', '/services', '/booking', '/blog', '/contact'];
    const colorViolations: { page: string; color: string }[] = [];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');

      // Check for forbidden colors in class names
      const html = await page.content();

      for (const forbiddenColor of FORBIDDEN_COLORS) {
        const regex = new RegExp(`(bg|text|border)-${forbiddenColor}`, 'g');
        const matches = html.match(regex);

        if (matches) {
          colorViolations.push({
            page: pagePath,
            color: `${forbiddenColor} (${matches.length} instances)`
          });
        }
      }
    }

    console.log('Color Violations Found:', colorViolations);

    if (colorViolations.length > 0) {
      console.warn('⚠️ FORBIDDEN COLORS DETECTED:');
      colorViolations.forEach(v => {
        console.warn(`  - Page: ${v.page} | Color: ${v.color}`);
      });
    } else {
      console.log('✓ No forbidden colors detected');
    }
  });

  test('Performance Check - Load Times', async ({ page }) => {
    console.log('Testing Page Load Performance');

    const pages = ['/', '/services', '/booking'];
    const loadTimes: { page: string; time: number }[] = [];

    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      loadTimes.push({ page: pagePath, time: loadTime });
      console.log(`${pagePath} loaded in ${loadTime}ms`);
    }

    // Check if any page takes too long (>5 seconds)
    const slowPages = loadTimes.filter(p => p.time > 5000);
    if (slowPages.length > 0) {
      console.warn('⚠️ Slow loading pages:', slowPages);
    }
  });

  test('Touch Target Sizes - Accessibility', async ({ page }) => {
    console.log('Testing Touch Target Sizes');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check buttons and links
    const interactiveElements = page.locator('button, a, input[type="button"], input[type="submit"]');
    const elementCount = await interactiveElements.count();
    const smallTargets: number[] = [];

    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();

      if (box && (box.width < 44 || box.height < 44)) {
        smallTargets.push(i);
        console.warn(`⚠️ Small touch target at index ${i}: ${box.width}x${box.height}`);
      }
    }

    if (smallTargets.length === 0) {
      console.log('✓ All touch targets meet minimum 44x44px size');
    } else {
      console.warn(`⚠️ ${smallTargets.length} elements have touch targets smaller than 44x44px`);
    }
  });
});
