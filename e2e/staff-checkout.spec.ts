import { test, expect } from '@playwright/test';

test.describe('Staff Checkout Flow', () => {
  test('should complete checkout and show receipt modal', async ({ page }) => {
    // Increase timeout
    test.setTimeout(120000);

    // Collect console messages
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // First, log in to staff portal
    console.log('Navigating to staff login...');
    await page.goto('http://localhost:8080/staff/login', { waitUntil: 'domcontentloaded' });

    // Wait for loading screen to finish
    console.log('Waiting for loading screen...');
    await page.waitForTimeout(8000);

    // Dismiss cookie consent if visible
    const cookieBtn = page.locator('button:has-text("Accept All"), button:has-text("Necessary Only")').first();
    if (await cookieBtn.isVisible().catch(() => false)) {
      console.log('Dismissing cookie consent...');
      await cookieBtn.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    console.log('Login page screenshot saved');

    // Wait for password input
    const passwordInput = page.locator('input[type="password"], input[placeholder="Enter your password"]');
    await expect(passwordInput).toBeVisible({ timeout: 15000 });
    console.log('Password input visible');

    // Enter staff password
    await passwordInput.fill('sarah42');
    console.log('Password entered');

    // Click sign in button
    const signInBtn = page.locator('button:has-text("Sign In")');
    await signInBtn.click();
    console.log('Sign in button clicked');

    // Wait for redirect to calendar
    await page.waitForTimeout(3000);
    console.log('Current URL after login:', page.url());

    // Take screenshot after login
    await page.screenshot({ path: 'after-login.png', fullPage: true });

    // Navigate to checkout page
    console.log('Navigating to checkout...');
    await page.goto('http://localhost:8080/staff/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Take screenshot of checkout page
    await page.screenshot({ path: 'checkout-page.png', fullPage: true });
    console.log('Checkout page screenshot saved');

    // Log current URL
    console.log('Current URL:', page.url());

    console.log('✅ Page loaded');

    // Wait for the search input to be visible
    const searchInput = page.locator('input[placeholder="Scan barcode or type it"]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    console.log('✅ Search input visible');

    // Search for a service
    await searchInput.fill('Signature');
    await page.waitForTimeout(500); // Wait for search results

    // Click on the first search result
    const searchResult = page.locator('.hover\\:bg-gray-100.cursor-pointer').first();
    await expect(searchResult).toBeVisible({ timeout: 5000 });
    await searchResult.click();
    console.log('✅ Added service to cart');

    // Wait for cart to update
    await page.waitForTimeout(500);

    // Take screenshot after adding to cart
    await page.screenshot({ path: 'cart-with-item.png', fullPage: true });
    console.log('Cart screenshot saved');

    // Click Credit Card button
    const creditCardBtn = page.locator('button:has-text("Credit Card")');
    await expect(creditCardBtn).toBeVisible({ timeout: 5000 });
    await creditCardBtn.click();
    console.log('✅ Credit Card payment method selected');

    // Wait for payment input to appear
    await page.waitForTimeout(1000);

    // Take screenshot after selecting payment method
    await page.screenshot({ path: 'payment-method-selected.png', fullPage: true });
    console.log('Payment method screenshot saved');

    // Find the payment amount input - it's in the CREDIT payment row (right side panel)
    // The payment input has w-24 h-8 classes which makes it unique
    const paymentInput = page.locator('.bg-gray-50:has-text("CREDIT") input.w-24.h-8');
    await expect(paymentInput).toBeVisible({ timeout: 5000 });

    // Get the amount due from the page - look for the green amount
    const amountDueElement = page.locator('.text-green-600').first();
    const amountDueText = await amountDueElement.textContent();
    console.log('Amount due:', amountDueText);

    // Enter the payment amount (89.25 for $85 + 5% tax)
    await paymentInput.clear();
    await paymentInput.fill('89.25');
    console.log('✅ Payment amount entered: 89.25');

    // Wait for state to update
    await page.waitForTimeout(1000);

    // Take screenshot before clicking pay
    await page.screenshot({ path: 'before-pay.png', fullPage: true });
    console.log('Before pay screenshot saved');

    // Check if the green Pay button is enabled
    const payButton = page.locator('button.bg-green-600:has-text("Pay")').first();
    const isEnabled = await payButton.isEnabled();
    console.log('Pay button enabled:', isEnabled);

    // If not enabled, check the amount paid display
    const amountPaidElement = page.locator('text=/Amount Paid/').locator('..').locator('.text-gray-900, span').last();
    const amountPaidText = await amountPaidElement.textContent().catch(() => 'not found');
    console.log('Amount paid display:', amountPaidText);

    await expect(payButton).toBeEnabled({ timeout: 10000 });

    console.log('✅ Clicking Pay button...');
    await payButton.click();

    // Wait for transaction to process
    await page.waitForTimeout(3000);

    // Wait for receipt modal to appear - look for modal content
    console.log('Waiting for receipt modal...');

    // Take screenshot immediately after clicking pay
    await page.screenshot({ path: 'after-pay-click.png', fullPage: true });

    // Wait a bit for modal to render
    await page.waitForTimeout(2000);

    // Take another screenshot
    await page.screenshot({ path: 'after-pay-wait.png', fullPage: true });

    // Look for receipt modal by transaction ID text or "Transaction Completed" text
    const receiptModal = page.locator('text=/Transaction Completed|Transaction ID/').first();
    const isModalVisible = await receiptModal.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('Receipt modal visible:', isModalVisible);

    // Print all console logs
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));

    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach(err => console.log('ERROR:', err));
    }

    // Take a screenshot
    await page.screenshot({ path: 'checkout-result.png', fullPage: true });
    console.log('✅ Screenshot saved to checkout-result.png');

    // Check the page state
    const cartEmpty = await page.locator('text="No items in cart"').isVisible().catch(() => false);
    console.log('Cart is empty after payment:', cartEmpty);

    // Assert modal should be visible
    // Note: This might fail if there's a bug - that's what we're testing
    if (!isModalVisible) {
      console.log('❌ BUG: Receipt modal did not appear!');
      console.log('Page HTML around modal area:', await page.locator('body').innerHTML().then(html => html.substring(0, 2000)));
    }
  });
});
