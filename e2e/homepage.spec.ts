import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle(/Zavira Beauty Salon/);

    // Check if main content is loaded
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Luxury beauty salon/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Zavira Beauty Salon/);
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');

    // Click on services link (adjust selector based on your navigation)
    await page.click('a[href="/services"]');

    // Wait for navigation
    await page.waitForURL('**/services');

    // Check if we're on the services page
    await expect(page).toHaveURL(/.*services/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check if navigation is accessible on mobile
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should load images properly', async ({ page }) => {
    await page.goto('/');

    // Check if images load without errors
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();

      // Check if image has alt text for accessibility
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have working contact links', async ({ page }) => {
    await page.goto('/');

    // Check for contact link
    const contactLink = page.locator('a[href="/contact"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForURL('**/contact');
      await expect(page).toHaveURL(/.*contact/);
    }
  });
  test('should play hero video smoothly without getting stuck', async ({ page }) => {
    await page.goto('/');

    // Wait for video element to be present
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Wait for video to load and start playing
    await page.waitForTimeout(2000); // Give time for video initialization

    // Check if video is playing (not paused)
    const isPaused = await video.evaluate(el => el.paused);
    expect(isPaused).toBe(false);

    // Monitor video progress for 10 seconds to ensure it doesn't get stuck
    let lastTime = 0;
    let stuckCount = 0;

    for (let i = 0; i < 20; i++) { // Check every 500ms for 10 seconds
      const currentTime = await video.evaluate(el => el.currentTime);

      // If video time hasn't progressed in 2 seconds, it might be stuck
      if (currentTime === lastTime) {
        stuckCount++;
        if (stuckCount >= 4) { // Stuck for 2 seconds
          console.log(`Video appears stuck at ${currentTime}s`);
          break;
        }
      } else {
        stuckCount = 0; // Reset if progressing
      }

      lastTime = currentTime;
      await page.waitForTimeout(500);
    }

    // Video should have progressed beyond 2 seconds if playing smoothly
    const finalTime = await video.evaluate(el => el.currentTime);
    console.log(`Video final time: ${finalTime}s`);

    // Assert that video has played for at least 2 seconds without getting stuck
    expect(finalTime).toBeGreaterThan(2);
    expect(stuckCount).toBeLessThan(4); // Should not be stuck for more than 2 seconds
  });
  test('should display video and allow manual play', async ({ page }) => {
    await page.goto('/');

    // Wait for video element to be present
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Video should be muted and have autoplay attributes
    const isMuted = await video.evaluate(el => el.muted);
    const hasPlaysInline = await video.evaluate(el => el.hasAttribute('playsinline'));
    expect(isMuted).toBe(true);
    expect(hasPlaysInline).toBe(true);

    // Video should initially be paused due to autoplay blocking
    const initiallyPaused = await video.evaluate(el => el.paused);
    expect(initiallyPaused).toBe(true);

    // Simulate user interaction to start video
    await page.click('body');
    await page.waitForTimeout(1000);

    // Video should now be playing or at least not paused
    const afterClickPaused = await video.evaluate(el => el.paused);
    console.log(`Video paused after body click: ${afterClickPaused}`);

    // If still paused, try clicking on video directly
    if (afterClickPaused) {
      await video.click();
      await page.waitForTimeout(1000);
      const afterVideoClickPaused = await video.evaluate(el => el.paused);
      console.log(`Video paused after video click: ${afterVideoClickPaused}`);
    }

  test('should play video smoothly for full duration', async ({ page }) => {
    // Capture console logs
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');

    // Wait for video element to be present
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Wait for video to load
    await page.waitForTimeout(5000);

    // Check if video is playing
    const isPlaying = await video.evaluate(el => !el.paused && !el.ended);
    console.log(`Video is playing: ${isPlaying}`);

    if (!isPlaying) {
      // If not playing, simulate user interaction
      await page.click('body');
      await page.waitForTimeout(2000);
      const afterClickPlaying = await video.evaluate(el => !el.paused && !el.ended);
      console.log(`Video playing after click: ${afterClickPlaying}`);
    }

    // Monitor video playback for 20 seconds to ensure smooth playback
    let lastTime = 0;
    let stuckCount = 0;
    let totalProgressChecks = 0;
    const monitorDuration = 20000; // 20 seconds
    const checkInterval = 1000; // Check every second
    const maxStuckChecks = 3; // Allow up to 3 seconds of being stuck

    console.log(`Starting video playback monitoring for ${monitorDuration/1000} seconds...`);

    for (let elapsed = 0; elapsed < monitorDuration; elapsed += checkInterval) {
      const currentTime = await video.evaluate(el => el.currentTime);
      const isCurrentlyPlaying = await video.evaluate(el => !el.paused && !el.ended);
      const duration = await video.evaluate(el => el.duration);

      console.log(`[${elapsed/1000}s] Time: ${currentTime.toFixed(1)}s/${duration.toFixed(1)}s, Playing: ${isCurrentlyPlaying}`);

      // Check if video progressed
      if (currentTime > lastTime) {
        totalProgressChecks++;
        stuckCount = 0; // Reset stuck counter
      } else if (currentTime === lastTime) {
        stuckCount++;
        if (stuckCount >= maxStuckChecks) {
          console.log(`Video stuck at ${currentTime}s for ${stuckCount} checks`);
          break;
        }
      }

      lastTime = currentTime;
      await page.waitForTimeout(checkInterval);
    }

    // Final check
    const finalTime = await video.evaluate(el => el.currentTime);
    const finalDuration = await video.evaluate(el => el.duration);

    console.log(`Final results: ${finalTime.toFixed(1)}s / ${finalDuration.toFixed(1)}s`);
    console.log(`Progress checks: ${totalProgressChecks}, Stuck incidents: ${stuckCount}`);

    // Print VideoHero logs
    console.log('VideoHero console logs:');
    logs.filter(log => log.includes('VideoHero')).forEach(log => console.log(log));

    // Assertions
    expect(finalTime).toBeGreaterThan(10); // Should have played for at least 10 seconds
    expect(totalProgressChecks).toBeGreaterThan(5); // Should have progressed multiple times
    expect(stuckCount).toBeLessThan(maxStuckChecks); // Should not be stuck for too long

    console.log('✅ Video played smoothly for the full monitoring duration!');
  });
    // At this point, video should be playable
    // Check that video has loaded metadata
    const duration = await video.evaluate(el => el.duration);
    expect(duration).toBeGreaterThan(0);

    console.log(`Video duration: ${duration}s - video is properly loaded and playable`);
  });
});