import { test, expect } from '@playwright/test';

test.describe('Homepage Console Error Check', () => {
  test('should check for console errors on zavira.ca homepage', async ({ page }) => {
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const networkErrors: string[] = [];

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();

      consoleMessages.push(`[${type}] ${text}`);

      if (type === 'error') {
        consoleErrors.push(text);
        console.log(`❌ [ERROR] ${text}`);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log(`⚠️  [WARNING] ${text}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      const errorMsg = `Page error: ${error.message}`;
      consoleErrors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    });

    // Capture failed network requests
    page.on('requestfailed', request => {
      const errorMsg = `Network request failed: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`;
      networkErrors.push(errorMsg);
      console.log(`🌐 ${errorMsg}`);
    });

    console.log('\n=== Navigating to zavira.ca homepage ===\n');

    await page.goto('https://zavira.ca', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to fully load
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/homepage-console-check.png',
      fullPage: true
    });

    console.log('\n=== CONSOLE ERRORS REPORT ===\n');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${consoleErrors.length}`);
    console.log(`Total warnings: ${consoleWarnings.length}`);
    console.log(`Network errors: ${networkErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ CONSOLE ERRORS FOUND:\n');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  CONSOLE WARNINGS FOUND:\n');
      consoleWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log('\n🌐 NETWORK ERRORS FOUND:\n');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n✅ NO ERRORS FOUND - Homepage is clean!');
    }

    // Log all console messages for detailed review
    console.log('\n=== ALL CONSOLE MESSAGES ===\n');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n=== END OF REPORT ===\n');
  });
});
