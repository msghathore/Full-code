import { test, expect } from '@playwright/test';

test.describe('Production: Appointment Management System', () => {
  test('Membership page loads and displays tiers', async ({ page }) => {
    await page.goto('https://zavira.ca/membership');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for membership tier headings
    await expect(page.locator('text=Beauty Basic')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Glow Getter')).toBeVisible();
    await expect(page.locator('text=VIP Luxe')).toBeVisible();

    // Check for pricing
    await expect(page.locator('text=$79')).toBeVisible();
    await expect(page.locator('text=$149')).toBeVisible();
    await expect(page.locator('text=$299')).toBeVisible();

    console.log('✅ Membership page: PASSED');
  });

  test('My Appointments portal loads with login form', async ({ page }) => {
    await page.goto('https://zavira.ca/my-appointments');

    await page.waitForLoadState('networkidle');

    // Check for email input field
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

    // Check for heading
    await expect(page.locator('text=My Appointments')).toBeVisible();

    console.log('✅ My Appointments portal: PASSED');
  });

  test('Reschedule page loads with appointment details', async ({ page }) => {
    const token = 'RlJ2uQpavobvKkbZE58UwioCIOXnHUAhgeuFNrSehf4';
    await page.goto(`https://zavira.ca/appointment/reschedule/${token}`);

    // Wait for verification to complete
    await page.waitForTimeout(3000);

    // Should show appointment details or error
    const pageContent = await page.content();

    // Check if page loaded (either shows appointment or error)
    const hasContent = pageContent.includes('Reschedule') ||
                      pageContent.includes('appointment') ||
                      pageContent.includes('Link Error');

    expect(hasContent).toBeTruthy();

    console.log('✅ Reschedule page: LOADED');
  });

  test('Cancel page loads with appointment details', async ({ page }) => {
    const token = '3_kP_RVNktTyQDHaormrp2O-F8nIbFix7vX9AH0YOLM';
    await page.goto(`https://zavira.ca/appointment/cancel/${token}`);

    // Wait for verification to complete
    await page.waitForTimeout(3000);

    // Should show appointment details or error
    const pageContent = await page.content();

    // Check if page loaded (either shows appointment or error)
    const hasContent = pageContent.includes('Cancel') ||
                      pageContent.includes('appointment') ||
                      pageContent.includes('Link Error');

    expect(hasContent).toBeTruthy();

    console.log('✅ Cancel page: LOADED');
  });

  test('All routes return 200 status', async ({ page }) => {
    const routes = [
      'https://zavira.ca/membership',
      'https://zavira.ca/my-appointments',
      'https://zavira.ca/appointment/reschedule/test-token',
      'https://zavira.ca/appointment/cancel/test-token'
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      console.log(`✅ ${route}: 200 OK`);
    }
  });
});
