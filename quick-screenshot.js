import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Navigating to staff checkout...');
  await page.goto('http://localhost:8080/staff/checkout');
  await page.waitForLoadState('networkidle');

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'current-staff-checkout.png', fullPage: true });

  console.log('Getting page HTML...');
  const html = await page.content();

  console.log('\n=== PAGE ANALYSIS ===');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  console.log('\nSearching for key elements...');
  console.log('  - "10%" found:', html.includes('10%'));
  console.log('  - "15%" found:', html.includes('15%'));
  console.log('  - "20%" found:', html.includes('20%'));
  console.log('  - "No Tip" found:', html.includes('No Tip'));
  console.log('  - "Tip Amount" found:', html.includes('Tip Amount'));
  console.log('  - "Service" button found:', html.includes('Service'));
  console.log('  - "Product" button found:', html.includes('Product'));
  console.log('  - "Subtotal" found:', html.includes('Subtotal'));
  console.log('  - "Staff Access" found:', html.includes('Staff Access'));

  console.log('\nScreenshot saved: current-staff-checkout.png');
  console.log('Keeping browser open for 30 seconds for inspection...');

  await page.waitForTimeout(30000);
  await browser.close();
  console.log('Done!');
})();
