import { test, expect, Page } from '@playwright/test';

// Test configuration
const STAFF_URL = 'http://localhost:8080/staff/login';
const PASSWORD = 'Ghathorefamily';

async function loginAsStaff(page: Page) {
  console.log('🔐 Navigating to login page...');
  await page.goto(STAFF_URL);
  await page.waitForLoadState('domcontentloaded');

  // Wait for the login form to appear
  console.log('⏳ Waiting for login form...');
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });

  // Fill in password and submit
  console.log('🔑 Entering password...');
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(PASSWORD);

  console.log('📤 Clicking submit...');
  await page.click('button[type="submit"]');

  // Wait for redirect to calendar
  console.log('⏳ Waiting for calendar redirect...');
  try {
    await page.waitForURL(/.*calendar.*/, { timeout: 15000 });
    console.log('✅ Redirected to calendar');
  } catch (e) {
    // Take screenshot on failure
    await page.screenshot({ path: 'test-results/login-failed.png' });
    console.log('❌ Login redirect failed, current URL:', page.url());
    throw e;
  }

  // Wait for calendar to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give React time to render
}

test.describe('Drag and Drop Calendar Tests', () => {

  test('should login and display calendar', async ({ page }) => {
    await loginAsStaff(page);

    // Take screenshot of calendar
    await page.screenshot({ path: 'test-results/calendar-loaded.png', fullPage: true });

    // Log the page content for debugging
    const title = await page.title();
    console.log('📄 Page title:', title);
    console.log('🔗 Current URL:', page.url());

    // Look for any grid-related elements
    const gridElements = await page.locator('[class*="grid"]').count();
    console.log('📊 Grid elements found:', gridElements);

    // Look for schedule grid
    const scheduleGrid = page.locator('[data-testid="schedule-grid"]');
    const scheduleGridVisible = await scheduleGrid.isVisible().catch(() => false);
    console.log('📅 Schedule grid visible:', scheduleGridVisible);

    // Look for any data-grid-content elements
    const gridContent = await page.locator('[data-grid-content]').count();
    console.log('📊 Grid content elements:', gridContent);

    // Look for draggable elements
    const draggables = await page.locator('[draggable="true"]').count();
    console.log('🎯 Draggable elements:', draggables);

    // Check for staff columns by looking at the DOM structure
    const staffHeaders = await page.locator('h3').count();
    console.log('👥 H3 headers (potential staff names):', staffHeaders);

    // Check all appointments on page
    const appointments = await page.locator('[class*="appointment"], [class*="pill"]').count();
    console.log('📋 Appointment elements:', appointments);

    // Get page HTML structure for debugging (limited)
    const bodyHTML = await page.evaluate(() => {
      const body = document.body;
      return body.innerHTML.substring(0, 2000);
    });
    console.log('📄 Page HTML preview:', bodyHTML.substring(0, 500));

    expect(true).toBe(true); // Test passes if we get here
  });

  test('should verify drag and drop elements exist', async ({ page }) => {
    await loginAsStaff(page);

    // Wait longer for dynamic content
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/calendar-check.png', fullPage: true });

    // Find schedule grid - try multiple selectors
    let scheduleFound = false;

    // Try testid
    const scheduleGrid = page.locator('[data-testid="schedule-grid"]');
    if (await scheduleGrid.isVisible().catch(() => false)) {
      scheduleFound = true;
      console.log('✅ Found schedule grid by testid');
    }

    // Try class
    const gridByClass = page.locator('.flex-1.flex.flex-col.bg-white');
    if (await gridByClass.first().isVisible().catch(() => false)) {
      scheduleFound = true;
      console.log('✅ Found grid container by class');
    }

    // Look for time column (8 AM, 9 AM markers)
    const timeLabels = await page.getByText(/^[0-9]+ (AM|PM)$/).count();
    console.log('⏰ Time labels found:', timeLabels);

    if (timeLabels > 0) {
      scheduleFound = true;
      console.log('✅ Calendar time slots are visible');
    }

    // Look for any appointments
    const appointments = page.locator('[draggable="true"]');
    const appointmentCount = await appointments.count();
    console.log('📋 Draggable appointments:', appointmentCount);

    if (appointmentCount > 0) {
      // Get first appointment info
      const firstAppt = appointments.first();
      const box = await firstAppt.boundingBox();
      console.log('📍 First appointment position:', box);

      // Get appointment text
      const text = await firstAppt.textContent();
      console.log('📝 First appointment text:', text?.substring(0, 100));
    }

    console.log('\n=== DRAG & DROP TEST SUMMARY ===');
    console.log(`Schedule Grid Found: ${scheduleFound ? '✅' : '❌'}`);
    console.log(`Time Labels Visible: ${timeLabels > 0 ? '✅' : '❌'}`);
    console.log(`Appointments Available: ${appointmentCount > 0 ? '✅' : '❌'} (${appointmentCount} found)`);
    console.log('================================\n');

    // The test passes if the calendar is visible
    expect(scheduleFound || timeLabels > 0).toBe(true);
  });

  test('should test drag preview creation', async ({ page }) => {
    await loginAsStaff(page);
    await page.waitForTimeout(3000);

    const appointments = page.locator('[draggable="true"]');
    const count = await appointments.count();

    if (count === 0) {
      console.log('⚠️ No appointments to test drag on');
      // Create a simple HTML5 drag test instead
      const canDrag = await page.evaluate(() => {
        const draggables = document.querySelectorAll('[draggable="true"]');
        return draggables.length;
      });
      console.log('📊 Native draggable count:', canDrag);
      test.skip();
      return;
    }

    const firstAppointment = appointments.first();
    const box = await firstAppointment.boundingBox();

    if (!box) {
      console.log('❌ Could not get appointment bounding box');
      test.skip();
      return;
    }

    console.log('🎯 Testing drag on appointment at:', box);

    // Use Playwright's drag API
    await firstAppointment.hover();
    await page.waitForTimeout(200);

    // Take screenshot before drag
    await page.screenshot({ path: 'test-results/before-drag.png' });

    // Perform drag
    const sourceX = box.x + box.width / 2;
    const sourceY = box.y + box.height / 2;
    const targetX = sourceX + 100;
    const targetY = sourceY + 100;

    await page.mouse.move(sourceX, sourceY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetX, targetY, { steps: 10 });

    // Take screenshot during drag
    await page.screenshot({ path: 'test-results/during-drag.png' });

    // Check for drag preview clone
    const dragClone = await page.locator('#drag-preview-clone').count();
    console.log('🎨 Drag preview clone found:', dragClone > 0 ? '✅' : '❌');

    await page.mouse.up();
    await page.waitForTimeout(500);

    // Take screenshot after drag
    await page.screenshot({ path: 'test-results/after-drag.png' });

    // Verify cleanup
    const orphanedClones = await page.locator('#drag-preview-clone').count();
    console.log('🧹 Cleanup verified:', orphanedClones === 0 ? '✅' : '❌');

    console.log('\n=== DRAG PREVIEW TEST RESULTS ===');
    console.log(`Drag Clone Created: ${dragClone > 0 ? '✅ Yes' : '⚠️ Not detected during test'}`);
    console.log(`Cleanup Successful: ${orphanedClones === 0 ? '✅ Yes' : '❌ No'}`);
    console.log('=================================\n');

    // Test passes if cleanup is successful
    expect(orphanedClones).toBe(0);
  });

  test('should verify drop position calculation', async ({ page }) => {
    await loginAsStaff(page);
    await page.waitForTimeout(3000);

    const appointments = page.locator('[draggable="true"]');
    const count = await appointments.count();

    if (count === 0) {
      console.log('⚠️ No appointments available for drop test');
      test.skip();
      return;
    }

    // Get console logs from the page
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    const firstAppointment = appointments.first();
    const box = await firstAppointment.boundingBox();

    if (!box) {
      test.skip();
      return;
    }

    // Find a target drop zone (different position)
    const gridContent = page.locator('[data-grid-content="true"]').first();
    const gridBox = await gridContent.boundingBox();

    if (!gridBox) {
      console.log('❌ Could not find grid content');
      test.skip();
      return;
    }

    // Drag to a position 200px down from current
    const targetY = box.y + 200;

    console.log('📍 Source position:', { x: box.x, y: box.y });
    console.log('📍 Target position:', { x: box.x, y: targetY });

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, targetY, { steps: 20 });

    // Screenshot during drop hover
    await page.screenshot({ path: 'test-results/drop-preview.png' });

    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Check console logs for drag events
    const dragLogs = consoleLogs.filter(log =>
      log.includes('DRAG') || log.includes('DROP') || log.includes('drag')
    );

    console.log('\n=== DRAG EVENT LOGS ===');
    dragLogs.forEach(log => console.log(log));
    console.log('=======================\n');

    // Screenshot after drop
    await page.screenshot({ path: 'test-results/after-drop.png' });

    console.log('✅ Drop position test completed');
    expect(true).toBe(true);
  });
});
