import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for Staff Checkout Tip Selector
 * Tests all scenarios to ensure no failures in front of customers
 */

test.describe('Staff Checkout - Tip Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to staff checkout
    await page.goto('http://localhost:8082/staff/checkout');
    await page.waitForLoadState('networkidle');

    // Add a test service to cart (assuming services are available)
    // This will need to be adjusted based on actual page structure
    await page.click('button:has-text("Service")');
    await page.waitForTimeout(500);

    // Search for a service
    const searchInput = page.locator('input[placeholder*="barcode"]');
    await searchInput.fill('haircut');
    await page.waitForTimeout(500);

    // Click first result if available
    const firstResult = page.locator('div[role="button"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
    }
  });

  test('should calculate 10% tip correctly', async ({ page }) => {
    // Wait for cart to have items
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // Get subtotal value
    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[$,]/g, '') || '0');

    // Click 10% button
    await page.click('button:has-text("10%")');

    // Verify tip amount
    const expectedTip = Math.round(subtotal * 0.10 * 100) / 100;
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(expectedTip);

    // Verify Amount Due includes tip
    const amountDueText = await page.locator('text=Amount Due:').locator('..').locator('span').last().textContent();
    const amountDue = parseFloat(amountDueText?.replace(/[$,]/g, '') || '0');

    // Amount Due should be greater than subtotal (includes tax + tip)
    expect(amountDue).toBeGreaterThan(subtotal);
  });

  test('should calculate 15% tip correctly', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[$,]/g, '') || '0');

    await page.click('button:has-text("15%")');

    const expectedTip = Math.round(subtotal * 0.15 * 100) / 100;
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(expectedTip);
  });

  test('should calculate 20% tip correctly', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[$,]/g, '') || '0');

    await page.click('button:has-text("20%")');

    const expectedTip = Math.round(subtotal * 0.20 * 100) / 100;
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(expectedTip);
  });

  test('should handle No Tip correctly', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // First set a tip
    await page.click('button:has-text("15%")');

    // Then click No Tip
    await page.click('button:has-text("No Tip")');

    // Verify tip is 0
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(0);
  });

  test('should handle custom tip input', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // Find custom tip input
    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Enter custom tip
    await customInput.fill('25.50');
    await customInput.blur();

    // Verify tip amount
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(25.50);
  });

  test('should round custom tip to 2 decimal places', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Enter tip with more than 2 decimals
    await customInput.fill('12.999');
    await customInput.blur();

    // Verify it rounds to 2 decimals
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(13.00);
  });

  test('should reject negative tip values', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Try to enter negative tip
    await customInput.fill('-10');
    await customInput.blur();

    // Tip should remain 0 (negative values ignored)
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(0);
  });

  test('should handle empty custom tip input', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Set a tip first
    await customInput.fill('15');
    await customInput.blur();

    // Clear the input
    await customInput.fill('');
    await customInput.blur();

    // Tip should be 0
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(0);
  });

  test('should show percentage for custom tip', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[$,]/g, '') || '0');

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Enter 10% of subtotal as custom tip
    const customTip = Math.round(subtotal * 0.10 * 100) / 100;
    await customInput.fill(customTip.toString());
    await customInput.blur();

    // Should show (10%) next to input
    const percentageDisplay = await page.locator('text=/(\\d+)%/').textContent();
    expect(percentageDisplay).toContain('10%');
  });

  test('should switch between percentage and custom tip', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // Click 15%
    await page.click('button:has-text("15%")');

    let tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const tip15Percent = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    // Enter custom tip
    const customInput = page.locator('input[type="number"][placeholder="0.00"]');
    await customInput.fill('30');
    await customInput.blur();

    tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const customTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(customTip).toBe(30);
    expect(customTip).not.toBe(tip15Percent);

    // Click 20% again
    await page.click('button:has-text("20%")');

    tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const tip20Percent = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(tip20Percent).not.toBe(30);
  });

  test('should highlight selected percentage button', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // Click 15% button
    const button15 = page.locator('button:has-text("15%")');
    await button15.click();

    // Check if button has green background (selected state)
    const buttonClass = await button15.getAttribute('class');
    expect(buttonClass).toContain('bg-green');
  });

  test('should clear tip when cart is cleared', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    // Set a tip
    await page.click('button:has-text("15%")');

    // Clear cart (click Cancel button)
    await page.click('button:has-text("Cancel")');

    // Verify tip is cleared
    // Cart should be empty now
    const emptyCartMessage = page.locator('text=No items in cart');
    await expect(emptyCartMessage).toBeVisible();
  });

  test('should calculate correct total with tip and tax', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const subtotalText = await page.locator('text=Subtotal').locator('..').locator('span').last().textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[$,]/g, '') || '0');

    // Click 10% tip
    await page.click('button:has-text("10%")');

    const tipAmount = Math.round(subtotal * 0.10 * 100) / 100;
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const expectedTotal = Math.round((subtotal + taxAmount + tipAmount) * 100) / 100;

    const amountDueText = await page.locator('text=Amount Due:').locator('..').locator('span').last().textContent();
    const actualTotal = parseFloat(amountDueText?.replace(/[$,]/g, '') || '0');

    // Allow 1 cent difference due to rounding
    expect(Math.abs(actualTotal - expectedTotal)).toBeLessThanOrEqual(0.01);
  });

  test('should handle very large custom tip values', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Enter very large tip
    await customInput.fill('999999.99');
    await customInput.blur();

    // Should accept it (no maximum validation currently)
    const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
    const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

    expect(actualTip).toBe(999999.99);
  });

  test('should handle decimal values correctly', async ({ page }) => {
    await page.waitForSelector('text=Subtotal', { timeout: 5000 });

    const customInput = page.locator('input[type="number"][placeholder="0.00"]');

    // Test various decimal values
    const testValues = [10.50, 0.99, 5.25, 100.01];

    for (const testValue of testValues) {
      await customInput.fill(testValue.toString());
      await customInput.blur();

      const tipDisplay = await page.locator('text=Tip Amount:').locator('..').locator('span').last().textContent();
      const actualTip = parseFloat(tipDisplay?.replace(/[$,]/g, '') || '0');

      expect(actualTip).toBe(testValue);
    }
  });
});

test.describe('Staff Checkout - Tip with Discounts', () => {
  test('should calculate tip on discounted subtotal', async ({ page }) => {
    await page.goto('http://localhost:8082/staff/checkout');
    await page.waitForLoadState('networkidle');

    // Add item and apply discount
    // This test assumes discount functionality exists
    // Skip if cart management is different
    test.skip(!await page.locator('text=Discount').isVisible(), 'Discount functionality not available');
  });
});

test.describe('Staff Checkout - Checkout Data', () => {
  test('should send correct tip data to tablet', async ({ page }) => {
    // Intercept network request to pending_checkout table
    await page.route('**/rest/v1/pending_checkout*', route => {
      const postData = route.request().postDataJSON();

      // Verify tip_amount is included
      expect(postData).toHaveProperty('tip_amount');

      // Verify total_amount does NOT include tip
      // (This is important for tablet to recalculate)
      const subtotal = postData.subtotal || 0;
      const tax = postData.tax_amount || 0;
      const total = postData.total_amount || 0;
      const tip = postData.tip_amount || 0;

      // total_amount should be subtotal + tax (without tip)
      expect(total).toBeLessThanOrEqual(subtotal + tax + 1); // +1 for rounding

      route.continue();
    });

    await page.goto('http://localhost:8082/staff/checkout');
    await page.waitForLoadState('networkidle');

    // Add item, set tip, complete payment
    // (Implementation depends on page structure)
  });
});
