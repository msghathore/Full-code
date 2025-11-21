import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle(/Zavira Beauty Salon/);

    // Check if main content is loaded
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Luxury beauty salon/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Zavira Beauty Salon/);
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');

    // Click on services link (adjust selector based on your navigation)
    await page.click('a[href="/services"]');

    // Wait for navigation
    await page.waitForURL('**/services');

    // Check if we're on the services page
    await expect(page).toHaveURL(/.*services/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check if navigation is accessible on mobile
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should load images properly', async ({ page }) => {
    await page.goto('/');

    // Check if images load without errors
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();

      // Check if image has alt text for accessibility
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have working contact links', async ({ page }) => {
    await page.goto('/');

    // Check for contact link
    const contactLink = page.locator('a[href="/contact"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForURL('**/contact');
      await expect(page).toHaveURL(/.*contact/);
    }
  });
});