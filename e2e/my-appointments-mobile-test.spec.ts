import { test, expect, Page } from '@playwright/test';

// Mobile viewport: iPhone SE (375x812)
const MOBILE_VIEWPORT = {
  width: 375,
  height: 812,
  deviceScaleFactor: 2,
};

interface ThemeComplianceResult {
  hasBlackBackground: boolean;
  hasWhiteGlowingText: boolean;
  hasEmeraldButtons: boolean;
  score: number;
}

interface ResponsiveResult {
  hasHorizontalScroll: boolean;
  cardsStack: boolean;
  buttonHeight: boolean;
  score: number;
}

interface ConsoleHealth {
  errors: string[];
  warnings: string[];
  logs: string[];
  score: number;
}

// Theme color constants
const THEME_COLORS = {
  black: ['rgb(0, 0, 0)', 'rgb(2, 6, 23)', '#000000', '#020617'],
  white: ['rgb(255, 255, 255)', '#ffffff'],
  emerald: ['rgb(16, 185, 129)', '#10b981', 'rgb(5, 150, 105)', '#059669'],
};

async function checkThemeCompliance(page: Page): Promise<ThemeComplianceResult> {
  const results: ThemeComplianceResult = {
    hasBlackBackground: false,
    hasWhiteGlowingText: false,
    hasEmeraldButtons: false,
    score: 0,
  };

  try {
    // Check body/main background
    const bodyBg = await page.evaluate(() => {
      const main = document.querySelector('main');
      const body = document.body;
      const element = main || body;
      return window.getComputedStyle(element).backgroundColor;
    });

    results.hasBlackBackground = THEME_COLORS.black.some(
      (color) => bodyBg.includes(color) || bodyBg === color,
    );

    // Check for white glowing text on headings
    const headingCount = await page.locator('h1, h2, h3').count();
    if (headingCount > 0) {
      const headingStyles = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 3);
        return headings.map((el) => ({
          color: window.getComputedStyle(el).color,
          textShadow: window.getComputedStyle(el).textShadow,
        }));
      });

      for (const style of headingStyles) {
        if (
          THEME_COLORS.white.some((c) => style.color.includes(c)) &&
          (style.textShadow.includes('rgba(255,255,255') || style.textShadow.includes('white'))
        ) {
          results.hasWhiteGlowingText = true;
          break;
        }
      }
    }

    // Check for emerald/green buttons
    const buttonCount = await page.locator('button').count();
    if (buttonCount > 0) {
      const buttonStyles = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button')).slice(0, 5);
        return buttons.map((el) => ({
          bgColor: window.getComputedStyle(el).backgroundColor,
        }));
      });

      for (const style of buttonStyles) {
        if (THEME_COLORS.emerald.some((c) => style.bgColor.includes(c) || style.bgColor === c)) {
          results.hasEmeraldButtons = true;
          break;
        }
      }
    }

    // Calculate score
    results.score = (
      (results.hasBlackBackground ? 40 : 0) +
      (results.hasWhiteGlowingText ? 35 : 0) +
      (results.hasEmeraldButtons ? 25 : 0)
    );
  } catch (error) {
    console.error('Theme compliance check error:', error);
  }

  return results;
}

async function checkResponsiveness(page: Page): Promise<ResponsiveResult> {
  const results: ResponsiveResult = {
    hasHorizontalScroll: false,
    cardsStack: false,
    buttonHeight: false,
    score: 0,
  };

  try {
    // Check for horizontal scroll
    const windowWidth = await page.evaluate(() => window.innerWidth);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    results.hasHorizontalScroll = bodyWidth > windowWidth;

    // Check if cards stack vertically
    const cards = await page.locator('[role="article"], .card, [class*="card"]').all();
    if (cards.length >= 2) {
      const positions = [];
      for (const card of cards.slice(0, 3)) {
        const box = await card.boundingBox();
        if (box) {
          positions.push(box);
        }
      }

      if (positions.length >= 2) {
        // Check if cards are stacked vertically (left-to-right position doesn't change much)
        const xPositions = positions.map((p) => p.x);
        const maxXDiff = Math.max(...xPositions) - Math.min(...xPositions);
        results.cardsStack = maxXDiff < 50; // Cards should be roughly aligned horizontally
      }
    }

    // Check button height (should be at least 44px for touch targets)
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      let validButtonCount = 0;
      for (const button of buttons.slice(0, 5)) {
        const box = await button.boundingBox();
        if (box && box.height >= 44) {
          validButtonCount++;
        }
      }
      results.buttonHeight = validButtonCount >= Math.ceil(buttons.slice(0, 5).length * 0.6);
    }

    // Calculate score
    results.score = (
      (!results.hasHorizontalScroll ? 40 : 0) +
      (results.cardsStack ? 35 : 0) +
      (results.buttonHeight ? 25 : 0)
    );
  } catch (error) {
    console.error('Responsiveness check error:', error);
  }

  return results;
}

async function checkConsoleHealth(page: Page): Promise<ConsoleHealth> {
  const health: ConsoleHealth = {
    errors: [],
    warnings: [],
    logs: [],
    score: 100,
  };

  // Collect console messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      health.errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      health.warnings.push(msg.text());
    } else if (msg.type() === 'log') {
      health.logs.push(msg.text());
    }
  });

  // Collect page errors
  page.on('pageerror', (err) => {
    health.errors.push(`JavaScript Error: ${err.message}`);
  });

  return health;
}

test('My Appointments Portal - Mobile Viewport (375x812)', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  });

  const page = await context.newPage();

  console.log('\n========================================');
  console.log('MY APPOINTMENTS MOBILE TEST (375x812)');
  console.log('========================================\n');

  // Navigate to page
  console.log('[1/5] Navigating to /my-appointments...');
  await page.goto('http://localhost:8080/my-appointments', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait for page to stabilize
  await page.waitForTimeout(1000);

  // Take initial screenshot
  console.log('[2/5] Capturing viewport screenshot...');
  await page.screenshot({ path: 'e2e/screenshots/my-appointments-mobile-test.png' });

  // Check theme compliance
  console.log('[3/5] Analyzing theme compliance...');
  const themeCompliance = await checkThemeCompliance(page);

  // Check responsiveness
  console.log('[4/5] Checking mobile responsiveness...');
  const responsiveness = await checkResponsiveness(page);

  // Check console health
  console.log('[5/5] Analyzing console health...');
  await page.waitForTimeout(500); // Allow any async console messages
  const consoleHealth = await checkConsoleHealth(page);

  // Print detailed report
  console.log('\n========================================');
  console.log('THEME COMPLIANCE REPORT');
  console.log('========================================');
  console.log(`Black Background (public site): ${themeCompliance.hasBlackBackground ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`White Glowing Text: ${themeCompliance.hasWhiteGlowingText ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Emerald Green Buttons: ${themeCompliance.hasEmeraldButtons ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`\nTheme Compliance Score: ${themeCompliance.score}/100 (${themeCompliance.score >= 80 ? 'EXCELLENT' : themeCompliance.score >= 60 ? 'GOOD' : 'NEEDS WORK'})`);

  console.log('\n========================================');
  console.log('MOBILE RESPONSIVENESS REPORT');
  console.log('========================================');
  console.log(`No Horizontal Scroll: ${!responsiveness.hasHorizontalScroll ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Cards Stack Vertically: ${responsiveness.cardsStack ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Touch-Friendly Buttons (≥44px): ${responsiveness.buttonHeight ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`\nResponsiveness Score: ${responsiveness.score}/100 (${responsiveness.score >= 80 ? 'EXCELLENT' : responsiveness.score >= 60 ? 'GOOD' : 'NEEDS WORK'})`);

  console.log('\n========================================');
  console.log('CONSOLE HEALTH CHECK');
  console.log('========================================');
  console.log(`Total Errors: ${consoleHealth.errors.length}`);
  if (consoleHealth.errors.length > 0) {
    console.log('Errors:');
    consoleHealth.errors.slice(0, 5).forEach((err) => {
      console.log(`  - ${err}`);
    });
    if (consoleHealth.errors.length > 5) {
      console.log(`  ... and ${consoleHealth.errors.length - 5} more`);
    }
    consoleHealth.score -= consoleHealth.errors.length * 10;
  }

  console.log(`\nTotal Warnings: ${consoleHealth.warnings.length}`);
  if (consoleHealth.warnings.length > 0) {
    console.log('Sample Warnings:');
    consoleHealth.warnings.slice(0, 3).forEach((warn) => {
      console.log(`  - ${warn}`);
    });
    if (consoleHealth.warnings.length > 3) {
      console.log(`  ... and ${consoleHealth.warnings.length - 3} more`);
    }
  }

  console.log(`\nConsole Health Score: ${Math.max(0, consoleHealth.score)}/100 (${consoleHealth.score >= 80 ? 'EXCELLENT' : consoleHealth.score >= 60 ? 'GOOD' : 'NEEDS WORK'})`);

  console.log('\n========================================');
  console.log('VIEWPORT & PAGE METRICS');
  console.log('========================================');
  const metrics = await page.evaluate(() => ({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    hasVerticalScroll: document.body.scrollHeight > window.innerHeight,
  }));

  console.log(`Viewport: ${metrics.windowWidth}x${metrics.windowHeight}`);
  console.log(`Content Size: ${metrics.bodyWidth}x${metrics.bodyHeight}`);
  console.log(`Requires Vertical Scroll: ${metrics.hasVerticalScroll ? 'Yes' : 'No'}`);
  console.log(`Requires Horizontal Scroll: ${responsiveness.hasHorizontalScroll ? 'Yes' : 'No'}`);

  // Page elements count
  const elementCount = await page.evaluate(() => ({
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    buttons: document.querySelectorAll('button').length,
    cards: document.querySelectorAll('[role="article"], .card, [class*="card"]').length,
    links: document.querySelectorAll('a').length,
  }));

  console.log('\nPage Elements:');
  console.log(`  - Headings: ${elementCount.headings}`);
  console.log(`  - Buttons: ${elementCount.buttons}`);
  console.log(`  - Cards/Appointments: ${elementCount.cards}`);
  console.log(`  - Links: ${elementCount.links}`);

  console.log('\n========================================');
  console.log('OVERALL ASSESSMENT');
  console.log('========================================');
  const overallScore =
    (themeCompliance.score + responsiveness.score + Math.max(0, consoleHealth.score)) / 3;
  console.log(`Overall Quality Score: ${Math.round(overallScore)}/100`);

  if (overallScore >= 80) {
    console.log('Status: EXCELLENT - Portal meets all mobile standards');
  } else if (overallScore >= 60) {
    console.log('Status: GOOD - Portal works on mobile with minor improvements needed');
  } else {
    console.log('Status: NEEDS WORK - Significant mobile improvements required');
  }

  console.log('\nScreenshot saved to: e2e/screenshots/my-appointments-mobile-test.png');
  console.log('\n========================================\n');

  // Assertions for test framework
  expect(themeCompliance.score).toBeGreaterThanOrEqual(40);
  expect(responsiveness.score).toBeGreaterThanOrEqual(40);
  expect(!responsiveness.hasHorizontalScroll).toBeTruthy();

  await context.close();
});
