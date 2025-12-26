import { test } from '@playwright/test';

test('Membership page mobile visual test', async ({ page }) => {
  // Set iPhone 12 Pro viewport (375x812)
  await page.setViewportSize({ width: 375, height: 812 });

  // Navigate to membership page
  await page.goto('http://localhost:8080/membership', { waitUntil: 'networkidle' });

  // Collect all test results
  const results = {
    viewport: '375x812 (iPhone)',
    theme: {},
    responsiveness: {},
    content: {},
    accessibility: {},
    errors: [] as string[]
  };

  // THEME COMPLIANCE
  const bgColor = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).backgroundColor;
  });
  results.theme = {
    backgroundColor: bgColor,
    isBlack: bgColor === 'rgb(0, 0, 0)' || bgColor.includes('0, 0, 0')
  };

  // RESPONSIVENESS
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  results.responsiveness = {
    windowWidth: clientWidth,
    documentWidth: scrollWidth,
    hasHorizontalScroll: scrollWidth > clientWidth,
    scrollDifference: scrollWidth - clientWidth
  };

  // CONTENT VERIFICATION
  const bodyText = await page.textContent('body');
  results.content = {
    has79Dollar: bodyText?.includes('79') || false,
    has149Dollar: bodyText?.includes('149') || false,
    has299Dollar: bodyText?.includes('299') || false,
    hasMostPopular: bodyText?.includes('MOST POPULAR') || false,
    hasJoinButton: bodyText?.includes('JOIN') || false,
    hasVipClub: bodyText?.includes('VIP CLUB') || false
  };

  // ACCESSIBILITY
  const buttonCount = await page.locator('button').count();
  const allButtons = await page.locator('button').evaluateAll((buttons) => {
    return buttons.map((btn) => ({
      height: Math.round(btn.getBoundingClientRect().height),
      text: btn.textContent?.substring(0, 30) || 'no-text',
      isAccessible: btn.getBoundingClientRect().height >= 44
    }));
  });

  results.accessibility = {
    totalButtons: buttonCount,
    buttons: allButtons,
    allButtonsAccessible: allButtons.every(b => b.isAccessible)
  };

  // CONSOLE ERRORS
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.errors.push(msg.text());
    }
  });

  // Take screenshot for manual visual inspection
  const screenshotPath = 'membership-mobile-visual.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Print detailed results
  console.log('\n========== MEMBERSHIP MOBILE TEST RESULTS ==========\n');
  console.log('Viewport:', results.viewport);
  console.log('\n--- THEME COMPLIANCE ---');
  console.log('Background Color:', results.theme.backgroundColor);
  console.log('Is Black:', results.theme.isBlack ? '✓ YES' : '✗ NO');

  console.log('\n--- RESPONSIVENESS ---');
  console.log('Window Width:', results.responsiveness.windowWidth, 'px');
  console.log('Document Width:', results.responsiveness.documentWidth, 'px');
  console.log('Horizontal Scroll:', results.responsiveness.hasHorizontalScroll ? '✗ YES' : '✓ NO');
  console.log('Scroll Difference:', results.responsiveness.scrollDifference, 'px');

  console.log('\n--- CONTENT VERIFICATION ---');
  console.log('Has $79 tier:', results.content.has79Dollar ? '✓ YES' : '✗ NO');
  console.log('Has $149 tier:', results.content.has149Dollar ? '✓ YES' : '✗ NO');
  console.log('Has $299 tier:', results.content.has299Dollar ? '✓ YES' : '✗ NO');
  console.log('Has "Most Popular":', results.content.hasMostPopular ? '✓ YES' : '✗ NO');
  console.log('Has "JOIN" button:', results.content.hasJoinButton ? '✓ YES' : '✗ NO');
  console.log('Has "VIP CLUB":', results.content.hasVipClub ? '✓ YES' : '✗ NO');

  console.log('\n--- ACCESSIBILITY ---');
  console.log('Total Buttons:', results.accessibility.totalButtons);
  console.log('All Buttons >= 44px:', results.accessibility.allButtonsAccessible ? '✓ YES' : '✗ NO');
  console.log('\nButton Details:');
  results.accessibility.buttons.forEach((btn, i) => {
    const check = btn.isAccessible ? '✓' : '✗';
    console.log(`  ${check} Button ${i + 1}: ${btn.height}px - ${btn.text}`);
  });

  console.log('\n--- CONSOLE ERRORS ---');
  console.log('Errors Found:', results.errors.length);
  if (results.errors.length > 0) {
    results.errors.forEach((err) => {
      console.log('  ✗', err);
    });
  } else {
    console.log('  ✓ No errors');
  }

  console.log('\n--- SCREENSHOT ---');
  console.log('Saved as:', screenshotPath);

  console.log('\n========== COMPLIANCE SCORE ==========\n');
  const themeScore = results.theme.isBlack ? 100 : 0;
  const responsiveScore = !results.responsiveness.hasHorizontalScroll ? 100 : 0;
  const contentScore = [
    results.content.has79Dollar,
    results.content.has149Dollar,
    results.content.hasMostPopular,
    results.content.hasJoinButton,
    results.content.hasVipClub
  ].filter(Boolean).length / 5 * 100;
  const a11yScore = results.accessibility.allButtonsAccessible ? 100 : 75;
  const errorScore = results.errors.length === 0 ? 100 : 50;

  const overallTheme = (themeScore + responsiveScore) / 2;
  const overallMobile = (contentScore + a11yScore + errorScore) / 3;
  const overall = (overallTheme + overallMobile) / 2;

  console.log('Theme Compliance:', Math.round(overallTheme), '%');
  console.log('Mobile Responsiveness:', Math.round(overallMobile), '%');
  console.log('OVERALL SCORE:', Math.round(overall), '%');

  console.log('\n====================================================\n');
});
