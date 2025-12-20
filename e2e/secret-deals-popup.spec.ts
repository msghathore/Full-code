import { test, expect } from '@playwright/test';

// Use test mode for faster execution
const TEST_URL = 'http://localhost:8081?popupTestMode=true';

// Reduced timeouts for test mode (3s min time, 8s fallback)
test.setTimeout(60000);

// Run tests serially to avoid storage conflicts
test.describe.configure({ mode: 'serial' });

test.describe('Secret Deals Popup - Smart Logic', () => {

    test.beforeEach(async ({ page }) => {
        // Set desktop viewport to ensure desktop exit intent is used (>= 768px)
        await page.setViewportSize({ width: 1280, height: 720 });

        // Clear all storage before each test
        await page.goto(TEST_URL);
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        // Reload to apply clean state
        await page.reload();
        await page.waitForLoadState('networkidle');
    });

    test('should NOT show popup immediately on page load', async ({ page }) => {
        await page.goto(TEST_URL);

        // Wait 1 second - popup should NOT appear (requires 3s + 50% scroll in test mode)
        await page.waitForTimeout(1000);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).not.toBeVisible();
    });

    test('should NOT show popup with only time elapsed (no scroll)', async ({ page }) => {
        await page.goto(TEST_URL);

        // Wait 5 seconds but don't scroll - popup should NOT appear (needs scroll)
        await page.waitForTimeout(5000);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).not.toBeVisible();
    });

    test('should NOT show popup with only scroll (not enough time)', async ({ page }) => {
        await page.goto(TEST_URL);

        // Scroll to 60% immediately
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });

        // Wait only 1 second - popup should NOT appear (requires 3s in test mode)
        await page.waitForTimeout(1000);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).not.toBeVisible();
    });

    test('should show popup with exit intent after meeting requirements', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Wait for React hydration

        // Scroll to 60%
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });

        // Wait 4 seconds to meet time requirement (3s in test mode)
        // Plus allow scroll to register
        await page.waitForTimeout(4000);

        // Simulate exit intent via JavaScript - dispatch events with proper delays
        // First event sets the lastMouseY
        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', {
                clientX: 640, clientY: 300, bubbles: true
            });
            window.dispatchEvent(event1);
        });

        await page.waitForTimeout(200);

        // Second event triggers exit intent (moving toward top)
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', {
                clientX: 640, clientY: 5, bubbles: true
            });
            window.dispatchEvent(event2);
        });

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });
    });

    test('should show popup after timed fallback', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Wait for React hydration

        // Scroll to 60%
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });

        // Wait for fallback timer (8 seconds in test mode + buffer)
        await page.waitForTimeout(10000);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });
    });

    test('should NOT show popup on excluded paths (/booking)', async ({ page }) => {
        await page.goto(TEST_URL.replace('?', '/booking?'));

        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(5000);

        // Simulate exit intent
        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(150);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 10, bubbles: true });
            window.dispatchEvent(event2);
        });

        await page.waitForTimeout(500);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).not.toBeVisible();
    });

    test('should NOT show popup on /staff path', async ({ page }) => {
        await page.goto('http://localhost:8081/staff/login?popupTestMode=true');

        await page.evaluate(() => {
            window.scrollTo(0, 1000);
        });
        await page.waitForTimeout(5000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(150);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 10, bubbles: true });
            window.dispatchEvent(event2);
        });

        await page.waitForTimeout(500);

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).not.toBeVisible();
    });

    test('should dismiss popup and set session storage', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Trigger popup
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });

        // Dismiss popup
        await page.click('button:has-text("Maybe Later")');
        await expect(popup).not.toBeVisible();

        // Check storage was set
        const sessionShown = await page.evaluate(() => sessionStorage.getItem('secretDealsShown'));
        const dismissedAt = await page.evaluate(() => localStorage.getItem('secretDealsDismissedAt'));

        expect(sessionShown).toBe('1');
        expect(dismissedAt).not.toBeNull();
    });

    test('should respect session limit after dismiss', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // First trigger
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });

        // Dismiss
        await page.click('button:has-text("Maybe Later")');
        await expect(popup).not.toBeVisible();

        // Navigate away and back (keep session storage)
        await page.goto('http://localhost:8081/services?popupTestMode=true');
        await page.waitForTimeout(500);

        // Go back to home - popup should NOT show again in same session
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        await page.waitForTimeout(1000);
        await expect(popup).not.toBeVisible();
    });

    test('should respect weekly cooldown across sessions', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // First trigger and dismiss
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });

        await page.click('button:has-text("Maybe Later")');

        // Verify localStorage was set
        const dismissedAt = await page.evaluate(() => localStorage.getItem('secretDealsDismissedAt'));
        expect(dismissedAt).not.toBeNull();

        // Simulate new session by clearing sessionStorage only (keep localStorage)
        await page.evaluate(() => sessionStorage.clear());
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Try to trigger again - should be blocked by weekly cooldown
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        await page.waitForTimeout(1000);
        await expect(popup).not.toBeVisible();
    });

    test('should submit phone and mark as subscribed', async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Trigger popup
        await page.evaluate(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, scrollHeight * 0.6);
        });
        await page.waitForTimeout(4000);

        await page.evaluate(() => {
            const event1 = new MouseEvent('mousemove', { clientX: 640, clientY: 300, bubbles: true });
            window.dispatchEvent(event1);
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
            const event2 = new MouseEvent('mousemove', { clientX: 640, clientY: 5, bubbles: true });
            window.dispatchEvent(event2);
        });

        const popup = page.locator('[role="dialog"]:has-text("SECRET DEALS")');
        await expect(popup).toBeVisible({ timeout: 5000 });

        // Fill phone number
        const phoneInput = page.locator('input[type="text"]');
        await phoneInput.fill('5551234567');

        // Submit
        await page.click('button:has-text("CLAIM DEALS")');

        // Wait for submission
        await page.waitForTimeout(1500);

        // Verify subscribed flag
        const subscribed = await page.evaluate(() => localStorage.getItem('secretDealsSubscribed'));
        expect(subscribed).toBe('true');

        // Popup should close
        await expect(popup).not.toBeVisible();
    });

    test('console should log popup initialization with test mode', async ({ page }) => {
        const consoleLogs: string[] = [];
        page.on('console', msg => consoleLogs.push(msg.text()));

        await page.goto(TEST_URL);
        await page.waitForTimeout(2000);

        const hasInitLog = consoleLogs.some(log =>
            log.includes('Smart popup initialized') && log.includes('testMode')
        );
        expect(hasInitLog).toBe(true);
    });

    test('console should log blocked reason on excluded path', async ({ page }) => {
        const consoleLogs: string[] = [];
        page.on('console', msg => consoleLogs.push(msg.text()));

        await page.goto('http://localhost:8081/booking?popupTestMode=true');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        console.log('All console logs:', consoleLogs);

        const hasBlockedLog = consoleLogs.some(log =>
            log.includes('Popup disabled') && log.includes('excluded_path')
        );
        expect(hasBlockedLog).toBe(true);
    });
});
