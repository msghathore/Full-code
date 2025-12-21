import { test, expect } from '@playwright/test';

/**
 * MacBook Pro 16" Viewport Testing
 * Resolution: 1728x1117
 * Tests all major pages for layout, typography, interactivity, and console errors
 */

test.describe('MacBook Pro 16" (1728x1117) - Full Site Testing', () => {
  const viewport = { width: 1728, height: 1117 };
  const baseURL = 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(viewport);
  });

  test('Homepage (/) - Layout and Functionality', async ({ page }) => {
    // Navigate to homepage
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-homepage.png',
      fullPage: true
    });

    // Check console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Verify hero section is visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Check navigation
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Verify logo
    const logo = page.locator('img[alt*="Zavira"]').first();
    await expect(logo).toBeVisible();

    // Check if content utilizes wide layout
    const container = page.locator('main, .container').first();
    const boundingBox = await container.boundingBox();
    console.log('Homepage container width:', boundingBox?.width);

    // Test interactive elements
    const bookNowButton = page.getByRole('link', { name: /book now|book appointment/i });
    if (await bookNowButton.count() > 0) {
      await expect(bookNowButton.first()).toBeVisible();
      await bookNowButton.first().hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-homepage-hover.png'
      });
    }

    // Verify no console errors
    await page.waitForTimeout(2000);
    console.log('Homepage console errors:', errors);
  });

  test('Services (/services) - Layout and Grid', async ({ page }) => {
    await page.goto(`${baseURL}/services`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-services.png',
      fullPage: true
    });

    // Check for service cards
    const serviceCards = page.locator('[class*="service"], .grid > div, .card');
    const count = await serviceCards.count();
    console.log('Service cards found:', count);

    // Verify grid layout utilizes space
    if (count > 0) {
      const gridContainer = page.locator('.grid, [class*="grid"]').first();
      if (await gridContainer.count() > 0) {
        const gridBox = await gridContainer.boundingBox();
        console.log('Services grid width:', gridBox?.width);

        // Check if grid is multi-column on wide screen
        const firstCard = serviceCards.first();
        const lastCard = serviceCards.last();
        const firstBox = await firstCard.boundingBox();
        const lastBox = await lastCard.boundingBox();

        if (firstBox && lastBox) {
          const isMultiColumn = Math.abs((firstBox.y || 0) - (lastBox.y || 0)) > 50;
          console.log('Services using multi-column layout:', isMultiColumn);
        }
      }
    }

    // Test interactive elements
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await buttons.first().hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-services-interaction.png'
      });
    }

    // Check typography scaling
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    console.log('Headings found:', headingCount);

    if (headingCount > 0) {
      const h1 = page.locator('h1').first();
      if (await h1.count() > 0) {
        const fontSize = await h1.evaluate(el =>
          window.getComputedStyle(el).fontSize
        );
        console.log('H1 font size on wide screen:', fontSize);
      }
    }
  });

  test('Booking (/booking) - Form and Layout', async ({ page }) => {
    await page.goto(`${baseURL}/booking`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-booking.png',
      fullPage: true
    });

    // Check for booking form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Verify form width on wide screen
    const formBox = await form.boundingBox();
    console.log('Booking form width:', formBox?.width);

    // Form should not be too wide on large screens
    if (formBox) {
      const isReasonableWidth = formBox.width < 1200;
      console.log('Form has reasonable max-width:', isReasonableWidth);
    }

    // Test form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    console.log('Form inputs found:', inputCount);

    // Test first input interaction
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.focus();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-booking-input-focus.png'
      });
    }

    // Check for service selection
    const serviceSelector = page.locator('select, [role="combobox"]').first();
    if (await serviceSelector.count() > 0) {
      await serviceSelector.click();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-booking-dropdown.png'
      });
    }
  });

  test('Blog (/blog) - Grid Layout and Cards', async ({ page }) => {
    await page.goto(`${baseURL}/blog`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-blog.png',
      fullPage: true
    });

    // Check for blog posts
    const posts = page.locator('article, .post, [class*="blog"]');
    const postCount = await posts.count();
    console.log('Blog posts found:', postCount);

    // Verify grid layout
    const gridContainer = page.locator('.grid, [class*="grid"]').first();
    if (await gridContainer.count() > 0) {
      const gridBox = await gridContainer.boundingBox();
      console.log('Blog grid width:', gridBox?.width);

      // Check column distribution
      if (postCount >= 2) {
        const post1Box = await posts.nth(0).boundingBox();
        const post2Box = await posts.nth(1).boundingBox();

        if (post1Box && post2Box) {
          const isSideByeSide = Math.abs((post1Box.x || 0) - (post2Box.x || 0)) > 100;
          console.log('Blog posts in multi-column:', isSideByeSide);
        }
      }
    }

    // Test post interaction
    if (postCount > 0) {
      await posts.first().hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-blog-hover.png'
      });

      // Try clicking first post
      const firstPostLink = posts.first().locator('a').first();
      if (await firstPostLink.count() > 0) {
        await firstPostLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({
          path: 'e2e/screenshots/macbook-pro-16-blog-post-detail.png',
          fullPage: true
        });
        await page.goBack();
      }
    }

    // Check typography
    const heading = page.locator('h1, h2').first();
    if (await heading.count() > 0) {
      const fontSize = await heading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      console.log('Blog heading font size:', fontSize);
    }
  });

  test('Contact (/contact) - Layout and Form', async ({ page }) => {
    await page.goto(`${baseURL}/contact`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-contact.png',
      fullPage: true
    });

    // Check for contact information
    const contactInfo = page.locator('text=/283 Tache Avenue|\\(431\\) 816-3330|zavirasalonandspa@gmail.com/i');
    const infoCount = await contactInfo.count();
    console.log('Contact info elements found:', infoCount);

    // Verify contact form
    const form = page.locator('form');
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible();

      const formBox = await form.first().boundingBox();
      console.log('Contact form width:', formBox?.width);
    }

    // Check map or location display
    const map = page.locator('iframe[src*="google.com/maps"], [class*="map"]');
    if (await map.count() > 0) {
      await expect(map.first()).toBeVisible();
      console.log('Map element found');
    }

    // Test form inputs
    const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-contact-form-filled.png'
      });
    }

    // Check business hours display
    const hours = page.locator('text=/8:00 AM.*11:30 PM/i');
    if (await hours.count() > 0) {
      console.log('Business hours displayed');
    }
  });

  test('Careers (/careers) - Layout and Job Listings', async ({ page }) => {
    await page.goto(`${baseURL}/careers`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/macbook-pro-16-careers.png',
      fullPage: true
    });

    // Check for job listings
    const jobListings = page.locator('[class*="job"], .position, article');
    const jobCount = await jobListings.count();
    console.log('Job listings found:', jobCount);

    // Verify layout utilizes space
    const mainContent = page.locator('main, .container').first();
    const contentBox = await mainContent.boundingBox();
    console.log('Careers page content width:', contentBox?.width);

    // Check for application form or CTA
    const applyButton = page.locator('button, a').filter({ hasText: /apply|join|submit/i });
    const applyCount = await applyButton.count();
    console.log('Apply buttons found:', applyCount);

    if (applyCount > 0) {
      await applyButton.first().hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-careers-apply-hover.png'
      });
    }

    // Check typography scaling
    const headings = page.locator('h1, h2, h3');
    if (await headings.count() > 0) {
      const h1 = headings.filter({ hasText: /career|join|position/i }).first();
      if (await h1.count() > 0) {
        const fontSize = await h1.evaluate(el =>
          window.getComputedStyle(el).fontSize
        );
        console.log('Careers heading font size:', fontSize);
      }
    }

    // Test job listing interaction
    if (jobCount > 0) {
      const firstJob = jobListings.first();
      await firstJob.scrollIntoViewIfNeeded();
      await firstJob.hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-careers-job-hover.png'
      });
    }
  });

  test('Navigation and Mobile Menu - Wide Screen', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Check navigation is horizontal on wide screen
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Mobile menu should be hidden
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-expanded]');
    if (await mobileMenuButton.count() > 0) {
      const isVisible = await mobileMenuButton.first().isVisible();
      console.log('Mobile menu button visible on wide screen:', isVisible);
      // Should be hidden on wide screens
    }

    // Check navigation links
    const navLinks = page.locator('nav a, nav button');
    const linkCount = await navLinks.count();
    console.log('Navigation links found:', linkCount);

    // Test navigation hover states
    if (linkCount > 0) {
      await navLinks.first().hover();
      await page.screenshot({
        path: 'e2e/screenshots/macbook-pro-16-nav-hover.png'
      });
    }

    // Test navigation to each page
    const pages = ['/services', '/booking', '/blog', '/contact', '/careers'];
    for (const path of pages) {
      const link = page.locator(`nav a[href="${path}"]`).first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Verify navigation worked
        const url = page.url();
        console.log(`Navigated to: ${url}`);
        expect(url).toContain(path);

        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('Console Errors Check - All Pages', async ({ page }) => {
    const errors: Array<{ page: string; error: string }> = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          page: page.url(),
          error: msg.text()
        });
      }
    });

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/services', name: 'Services' },
      { path: '/booking', name: 'Booking' },
      { path: '/blog', name: 'Blog' },
      { path: '/contact', name: 'Contact' },
      { path: '/careers', name: 'Careers' }
    ];

    for (const { path, name } of pages) {
      await page.goto(`${baseURL}${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log(`Checked console for ${name}`);
    }

    console.log('Total console errors found:', errors.length);
    if (errors.length > 0) {
      console.log('Console errors:', JSON.stringify(errors, null, 2));
    }
  });

  test('Typography Scaling - Cross-Page Consistency', async ({ page }) => {
    const typographyData: Array<{
      page: string;
      h1Size: string;
      h2Size: string;
      bodySize: string;
    }> = [];

    const pages = ['/', '/services', '/booking', '/blog', '/contact', '/careers'];

    for (const path of pages) {
      await page.goto(`${baseURL}${path}`);
      await page.waitForLoadState('networkidle');

      let h1Size = 'N/A';
      let h2Size = 'N/A';
      let bodySize = 'N/A';

      const h1 = page.locator('h1').first();
      if (await h1.count() > 0) {
        h1Size = await h1.evaluate(el => window.getComputedStyle(el).fontSize);
      }

      const h2 = page.locator('h2').first();
      if (await h2.count() > 0) {
        h2Size = await h2.evaluate(el => window.getComputedStyle(el).fontSize);
      }

      const body = page.locator('p, body').first();
      if (await body.count() > 0) {
        bodySize = await body.evaluate(el => window.getComputedStyle(el).fontSize);
      }

      typographyData.push({
        page: path,
        h1Size,
        h2Size,
        bodySize
      });
    }

    console.log('Typography scaling across pages:', JSON.stringify(typographyData, null, 2));
  });

  test('Responsive Images and Assets', async ({ page }) => {
    const pages = ['/', '/services', '/blog'];

    for (const path of pages) {
      await page.goto(`${baseURL}${path}`);
      await page.waitForLoadState('networkidle');

      // Check for images
      const images = page.locator('img');
      const imageCount = await images.count();
      console.log(`Images on ${path}:`, imageCount);

      // Check if images have proper sizing
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const box = await img.boundingBox();
        const src = await img.getAttribute('src');

        if (box) {
          console.log(`Image ${i} (${src}):`, {
            width: box.width,
            height: box.height
          });
        }
      }
    }
  });
});
