import { test, expect } from '@playwright/test';

test.describe('Desktop Full Site Test - 1920x1080', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to standard desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Homepage (/) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Homepage...');
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/desktop-homepage.png',
      fullPage: true
    });

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Verify header is visible
    await expect(page.locator('header, nav')).toBeVisible();

    // Verify footer is visible
    await expect(page.locator('footer')).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/Zavira/i);

    console.log('Homepage test complete');
  });

  test('Services (/services) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Services page...');
    await page.goto('http://localhost:8080/services');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-services.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for service content
    const serviceContent = page.locator('text=/service|hair|nail|spa|massage/i').first();
    await expect(serviceContent).toBeVisible({ timeout: 10000 });

    console.log('Services page test complete');
  });

  test('Booking (/booking) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Booking page...');
    await page.goto('http://localhost:8080/booking');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-booking.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();

    // Check for booking form elements
    const bookingContent = page.locator('text=/book|appointment|select|schedule/i').first();
    await expect(bookingContent).toBeVisible({ timeout: 10000 });

    console.log('Booking page test complete');
  });

  test('Shop (/shop) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Shop page...');
    await page.goto('http://localhost:8080/shop');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-shop.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for shop/product content
    const shopContent = page.locator('text=/shop|product|price|cart/i').first();
    await expect(shopContent).toBeVisible({ timeout: 10000 });

    console.log('Shop page test complete');
  });

  test('Team (/team) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Team page...');
    await page.goto('http://localhost:8080/team');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-team.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for team content
    const teamContent = page.locator('text=/team|staff|stylist|specialist/i').first();
    await expect(teamContent).toBeVisible({ timeout: 10000 });

    console.log('Team page test complete');
  });

  test('About (/about) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing About page...');
    await page.goto('http://localhost:8080/about');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-about.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for about content
    const aboutContent = page.locator('text=/about|story|mission|values/i').first();
    await expect(aboutContent).toBeVisible({ timeout: 10000 });

    console.log('About page test complete');
  });

  test('Blog (/blog) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Blog page...');
    await page.goto('http://localhost:8080/blog');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-blog.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for blog content
    const blogContent = page.locator('text=/blog|article|post|read/i').first();
    await expect(blogContent).toBeVisible({ timeout: 10000 });

    console.log('Blog page test complete');
  });

  test('Contact (/contact) - Desktop 1920x1080', async ({ page }) => {
    console.log('Testing Contact page...');
    await page.goto('http://localhost:8080/contact');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/desktop-contact.png',
      fullPage: true
    });

    // Verify header and footer
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for contact information
    const contactContent = page.locator('text=/contact|phone|email|address/i').first();
    await expect(contactContent).toBeVisible({ timeout: 10000 });

    // Verify business info is present
    await expect(page.locator('text=/283 Tache Avenue/i')).toBeVisible();
    await expect(page.locator('text=/431.*816.*3330/i')).toBeVisible();

    console.log('Contact page test complete');
  });

  test('Navigation and Footer Check - Desktop', async ({ page }) => {
    console.log('Testing Navigation and Footer...');
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');

    // Check navigation links
    const navLinks = [
      { text: 'Services', url: '/services' },
      { text: 'Booking', url: '/booking' },
      { text: 'Shop', url: '/shop' },
      { text: 'Team', url: '/team' },
      { text: 'About', url: '/about' },
      { text: 'Blog', url: '/blog' },
      { text: 'Contact', url: '/contact' }
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`a:has-text("${link.text}")`).first();
      await expect(navLink).toBeVisible();
    }

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'e2e/screenshots/desktop-footer.png'
    });

    // Verify footer content
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    console.log('Navigation and Footer test complete');
  });

  test('Console Errors Check - All Pages', async ({ page }) => {
    console.log('Checking for console errors across all pages...');
    const consoleErrors: { page: string; errors: string[] }[] = [];

    const pages = [
      { name: 'Homepage', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Booking', url: '/booking' },
      { name: 'Shop', url: '/shop' },
      { name: 'Team', url: '/team' },
      { name: 'About', url: '/about' },
      { name: 'Blog', url: '/blog' },
      { name: 'Contact', url: '/contact' }
    ];

    for (const pageInfo of pages) {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`http://localhost:8080${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      if (errors.length > 0) {
        consoleErrors.push({ page: pageInfo.name, errors });
      }
    }

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS FOUND ===');
      consoleErrors.forEach(({ page, errors }) => {
        console.log(`\n${page}:`);
        errors.forEach(error => console.log(`  - ${error}`));
      });
    } else {
      console.log('\n✓ No console errors found on any page');
    }
  });
});
