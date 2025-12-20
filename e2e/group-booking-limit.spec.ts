import { test, expect } from '@playwright/test';

// Run only on chromium for speed
test.describe('Group Booking Member Limit', () => {
  test.beforeEach(async ({ page }) => {
    // Set larger viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('should enforce 20 member limit', async ({ page }) => {
    // Navigate to group booking page
    await page.goto('/group-booking', { waitUntil: 'networkidle' });

    // Wait for content
    await page.waitForTimeout(1000);

    // Dismiss any popups with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Dismiss cookie popup if present
    const cookieButton = page.locator('button:has-text("Necessary Only")');
    if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cookieButton.click();
      await page.waitForTimeout(500);
    }

    // Step 1: Select group type (Birthday)
    await page.locator('text=Birthday Celebration').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 2: Fill lead details - wait for the form
    await page.waitForSelector('input[placeholder="Your full name"]', { timeout: 10000 });
    await page.fill('input[placeholder="Your full name"]', 'Test Lead');
    await page.fill('input[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('input[placeholder="(555) 123-4567"]', '5551234567');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Step 3: Members - verify counter shows 1/20
    await page.waitForSelector('text=Group Members', { timeout: 10000 });

    // Check initial counter (1 member = lead)
    const initialCounter = page.locator('text=/\\d+ \\/ 20 members/');
    await expect(initialCounter).toContainText('1 / 20 members');
    console.log('✅ Initial counter shows 1/20');

    // Add Member button should be enabled initially
    const addMemberButton = page.locator('button:has-text("Add Member")');
    await expect(addMemberButton).toBeEnabled();
    console.log('✅ Add Member button is enabled');

    // Add 19 members to reach the limit (1 lead + 19 = 20)
    for (let i = 1; i <= 19; i++) {
      await addMemberButton.click();
      await page.waitForTimeout(100);
    }

    // After 19 additions (20 total), button should show "Limit Reached" and be disabled
    const limitReachedButton = page.locator('button:has-text("Limit Reached")');
    await expect(limitReachedButton).toBeVisible();
    await expect(limitReachedButton).toBeDisabled();
    console.log('✅ Limit Reached button is visible and disabled');

    // Warning banner should be visible
    const warningBanner = page.locator('text=Maximum group size of 20 people reached');
    await expect(warningBanner).toBeVisible();
    console.log('✅ Warning banner is visible');

    // Counter should show 20/20
    const finalCounter = page.locator('text=/\\d+ \\/ 20 members/');
    await expect(finalCounter).toContainText('20 / 20 members');
    console.log('✅ Final counter shows 20/20');

    console.log('🎉 Member limit test PASSED!');
  });
});
