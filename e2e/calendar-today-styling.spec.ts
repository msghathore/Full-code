import { test, expect } from '@playwright/test';

test.describe('Calendar Today Date Styling - Cross Browser', () => {

  test('today date should have transparent background (not white square)', async ({ page, browserName }) => {
    // Set localStorage to skip to step 2 with a mock service selected
    await page.goto('/booking');

    await page.evaluate(() => {
      // Set booking state to show calendar step
      localStorage.setItem('bookingStep', '2');
      localStorage.setItem('selectedServices', JSON.stringify([{
        id: 'test-service',
        name: 'Test Service',
        price: 50,
        duration: 60
      }]));
    });

    // Reload to apply localStorage
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: `test-results/calendar-test-${browserName}.png` });

    // Try clicking Date & Time step
    const dateTimeButton = page.locator('button:has-text("Date & Time"), [role="button"]:has-text("Date & Time")').first();
    if (await dateTimeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateTimeButton.click();
      await page.waitForTimeout(1000);
    }

    // Take another screenshot
    await page.screenshot({ path: `test-results/calendar-after-click-${browserName}.png` });

    // Look for the calendar grid
    const calendarExists = await page.locator('table, [role="grid"]').first().isVisible({ timeout: 5000 }).catch(() => false);

    if (calendarExists) {
      // Find today's date button (19th)
      const todayButton = page.locator('button:has-text("19")').first();

      if (await todayButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const styles = await todayButton.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            background: computed.background,
            ringColor: computed.outlineColor,
            boxShadow: computed.boxShadow,
            className: el.className,
          };
        });

        console.log(`[${browserName}] Today (19) computed styles:`, JSON.stringify(styles, null, 2));

        // Check the background is transparent or near-transparent
        const bgColor = styles.backgroundColor;
        const isWhite = bgColor === 'rgb(255, 255, 255)' ||
                        bgColor === 'rgba(255, 255, 255, 1)' ||
                        bgColor === 'white';

        console.log(`[${browserName}] Background: ${bgColor}, isWhite: ${isWhite}`);

        // Assertion: background should NOT be solid white
        expect(isWhite, `Today's date should not have white background in ${browserName}. Got: ${bgColor}`).toBe(false);
      }
    }

    // Final screenshot
    await page.screenshot({ path: `test-results/calendar-final-${browserName}.png`, fullPage: true });
  });

  test('visual test - capture calendar on all viewport sizes', async ({ page, browserName }) => {
    const viewports = [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/booking');
      await page.waitForLoadState('domcontentloaded');

      // Try to get to calendar step
      await page.evaluate(() => {
        localStorage.setItem('bookingStep', '2');
        localStorage.setItem('selectedServices', JSON.stringify([{ id: '1', name: 'Test', price: 50, duration: 60 }]));
      });
      await page.reload();
      await page.waitForTimeout(1500);

      // Click Date & Time if visible
      const dtBtn = page.locator('button:has-text("Date & Time")').first();
      if (await dtBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dtBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `test-results/calendar-${vp.name}-${browserName}.png`,
        fullPage: false
      });

      console.log(`[${browserName}] Captured ${vp.name} screenshot`);
    }
  });
});
