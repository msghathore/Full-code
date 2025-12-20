import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 12'],
  viewport: { width: 390, height: 844 },
  baseURL: 'http://localhost:8082'
});

test.describe('Mobile Responsiveness - iPhone 12 (390x844)', () => {
  test('Homepage - ZAVIRA logo visibility and hamburger menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'mobile_screenshots/1_homepage_overview.png', fullPage: false });
    
    // Check for hamburger menu
    const menuButton = await page.locator('button[aria-label*="menu" i], .hamburger, [class*="menu"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'mobile_screenshots/2_homepage_menu_open.png', fullPage: false });
    }
  });

  test('Services page - navigation alignment', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'mobile_screenshots/3_services_page.png', fullPage: false });
  });

  test('Booking page - all steps alignment and buttons', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    // Step 1
    await page.screenshot({ path: 'mobile_screenshots/4_booking_step1.png', fullPage: false });
    
    // Try to go to next steps if navigation exists
    const nextButtons = await page.locator('button:has-text("Next"), button:has-text("Continue")').all();
    if (nextButtons.length > 0) {
      await nextButtons[0].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'mobile_screenshots/5_booking_step2.png', fullPage: false });
    }
  });

  test('Shop page - layout and search bar', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'mobile_screenshots/6_shop_page.png', fullPage: false });
  });

  test('Careers page - glow effects and spacing', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'mobile_screenshots/7_careers_page.png', fullPage: false });
  });

  test('Contact page - address/phone/email links', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'mobile_screenshots/8_contact_page.png', fullPage: false });
  });
});
