import { test, expect } from '@playwright/test';

test.describe('Admin Panel Team Page Toggle', () => {
  test('should display Team Page toggle column in Staff Management', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('http://localhost:8081/admin');

    // Wait for password prompt
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Enter admin password
    await page.fill('input[type="password"]', 'Ghathore5');

    // Click access button
    await page.click('button:has-text("Access Admin Panel")', { force: true });

    // Wait for admin panel to load
    await page.waitForTimeout(2000);

    // Dismiss cookie consent - click on "Necessary Only" button
    try {
      const cookieButton = page.locator('button:has-text("Necessary Only")');
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Cookie consent not found or already dismissed');
    }

    // Wait a moment after dismissing cookie
    await page.waitForTimeout(1000);

    // Screenshot before clicking Staff Management tab
    await page.screenshot({ path: 'admin-panel-before-staff.png' });

    // Click on Staff Management tab in the header
    const staffTab = page.locator('button:has-text("Staff Management")').first();
    await staffTab.click();

    // Wait for Staff Management content to load
    await page.waitForTimeout(2000);

    // Screenshot after clicking Staff Management
    await page.screenshot({ path: 'admin-panel-staff-table.png', fullPage: true });

    // Look for the staff table with Team Page header
    const teamPageHeader = page.locator('th:has-text("Team Page")');

    // If not visible, try scrolling
    if (!await teamPageHeader.isVisible({ timeout: 3000 })) {
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'admin-panel-scrolled.png', fullPage: true });
    }

    await expect(teamPageHeader).toBeVisible({ timeout: 15000 });

    // Check for "Inventory Write" header (should be next to Team Page)
    const inventoryHeader = page.locator('th:has-text("Inventory Write")');
    await expect(inventoryHeader).toBeVisible();

    console.log('✅ Team Page toggle column verified successfully!');
  });
});
