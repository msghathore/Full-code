import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Cross-browser video banner diagnostic test
 * Tests video playback behavior across Edge, Safari, Chrome, Firefox, and mobile browsers
 * Identifies specific issues that cause video to get stuck
 */

interface VideoState {
  paused: boolean;
  ended: boolean;
  readyState: number;
  networkState: number;
  currentTime: number;
  duration: number;
  buffered: number;
  muted: boolean;
  autoplay: boolean;
  error: string | null;
  stalled: boolean;
  waiting: boolean;
  canPlay: boolean;
}

// Helper function to get comprehensive video state
async function getVideoState(page: Page): Promise<VideoState | null> {
  return await page.evaluate(() => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return null;

    let bufferedEnd = 0;
    if (video.buffered.length > 0) {
      bufferedEnd = video.buffered.end(video.buffered.length - 1);
    }

    return {
      paused: video.paused,
      ended: video.ended,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
      duration: video.duration || 0,
      buffered: bufferedEnd,
      muted: video.muted,
      autoplay: video.autoplay,
      error: video.error ? video.error.message : null,
      stalled: false, // Will be tracked via events
      waiting: false, // Will be tracked via events
      canPlay: video.readyState >= 3,
    };
  });
}

// Helper to wait for video to be present
async function waitForVideo(page: Page, timeout = 10000): Promise<boolean> {
  try {
    await page.waitForSelector('video', { timeout });
    return true;
  } catch {
    return false;
  }
}

// Helper to monitor video events for a duration
async function monitorVideoEvents(page: Page, duration: number): Promise<string[]> {
  const events: string[] = [];

  await page.evaluate((dur) => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    const eventTypes = [
      'loadstart', 'progress', 'suspend', 'abort', 'error',
      'emptied', 'stalled', 'loadedmetadata', 'loadeddata',
      'canplay', 'canplaythrough', 'playing', 'waiting',
      'seeking', 'seeked', 'ended', 'durationchange',
      'timeupdate', 'play', 'pause', 'ratechange', 'volumechange'
    ];

    (window as any).__videoEvents = [];

    eventTypes.forEach(eventType => {
      video.addEventListener(eventType, () => {
        (window as any).__videoEvents.push({
          type: eventType,
          time: Date.now(),
          currentTime: video.currentTime,
          readyState: video.readyState
        });
      });
    });
  }, duration);

  // Wait for the monitoring duration
  await page.waitForTimeout(duration);

  // Collect events
  const collectedEvents = await page.evaluate(() => {
    return (window as any).__videoEvents || [];
  });

  return collectedEvents.map((e: any) => `${e.type} @ ${e.currentTime.toFixed(2)}s (readyState: ${e.readyState})`);
}

// Test suite for video banner
test.describe('Video Banner Cross-Browser Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set up console log monitoring
    page.on('console', msg => {
      if (msg.text().includes('VideoHero') || msg.text().includes('video')) {
        console.log(`[BROWSER CONSOLE] ${msg.text()}`);
      }
    });
  });

  test('Video element exists and has correct attributes', async ({ page, browserName }) => {
    console.log(`\n=== Testing on ${browserName} ===`);

    await page.goto('/');

    const videoExists = await waitForVideo(page);
    expect(videoExists).toBe(true);

    const videoAttrs = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (!video) return null;

      return {
        muted: video.muted,
        loop: video.loop,
        playsInline: video.playsInline,
        autoplay: video.autoplay,
        preload: video.preload,
        poster: video.poster,
        sources: Array.from(video.querySelectorAll('source')).map(s => ({
          src: s.src,
          type: s.type
        }))
      };
    });

    console.log(`Video attributes on ${browserName}:`, JSON.stringify(videoAttrs, null, 2));

    expect(videoAttrs).not.toBeNull();
    expect(videoAttrs?.muted).toBe(true);
    expect(videoAttrs?.loop).toBe(true);
    expect(videoAttrs?.playsInline).toBe(true);
  });

  test('Video loads and reaches canplay state', async ({ page, browserName }) => {
    console.log(`\n=== Video Loading Test on ${browserName} ===`);

    await page.goto('/');
    await waitForVideo(page);

    // Wait for video to reach at least HAVE_CURRENT_DATA (readyState >= 2)
    const loadResult = await page.evaluate(() => {
      return new Promise<{success: boolean, readyState: number, error: string | null}>((resolve) => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (!video) {
          resolve({ success: false, readyState: 0, error: 'Video element not found' });
          return;
        }

        const timeout = setTimeout(() => {
          resolve({
            success: false,
            readyState: video.readyState,
            error: `Timeout - stuck at readyState ${video.readyState}`
          });
        }, 15000);

        if (video.readyState >= 2) {
          clearTimeout(timeout);
          resolve({ success: true, readyState: video.readyState, error: null });
          return;
        }

        video.addEventListener('canplay', () => {
          clearTimeout(timeout);
          resolve({ success: true, readyState: video.readyState, error: null });
        }, { once: true });

        video.addEventListener('error', () => {
          clearTimeout(timeout);
          resolve({
            success: false,
            readyState: video.readyState,
            error: video.error?.message || 'Unknown error'
          });
        }, { once: true });
      });
    });

    console.log(`Load result on ${browserName}:`, loadResult);

    if (!loadResult.success) {
      console.error(`VIDEO LOADING FAILED on ${browserName}: ${loadResult.error}`);
    }

    expect(loadResult.success).toBe(true);
  });

  test('Video autoplay behavior', async ({ page, browserName }) => {
    console.log(`\n=== Autoplay Test on ${browserName} ===`);

    await page.goto('/');
    await waitForVideo(page);

    // Wait a bit for autoplay to attempt
    await page.waitForTimeout(2000);

    const autoplayResult = await page.evaluate(() => {
      return new Promise<{playing: boolean, currentTime: number, error: string | null}>((resolve) => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (!video) {
          resolve({ playing: false, currentTime: 0, error: 'Video not found' });
          return;
        }

        // Check if video is playing
        const isPlaying = !video.paused && !video.ended && video.currentTime > 0;

        resolve({
          playing: isPlaying,
          currentTime: video.currentTime,
          error: video.error?.message || null
        });
      });
    });

    console.log(`Autoplay result on ${browserName}:`, autoplayResult);

    // If autoplay didn't work, try user interaction
    if (!autoplayResult.playing) {
      console.log(`Autoplay blocked on ${browserName}, testing with user interaction...`);

      // Simulate user interaction
      await page.mouse.click(100, 100);
      await page.waitForTimeout(1000);

      const afterInteraction = await getVideoState(page);
      console.log(`After interaction on ${browserName}:`, afterInteraction);
    }
  });

  test('Video does not get stuck (stall detection)', async ({ page, browserName }) => {
    console.log(`\n=== Stall Detection Test on ${browserName} ===`);

    await page.goto('/');
    await waitForVideo(page);

    // First ensure video is playing
    await page.mouse.click(100, 100);
    await page.waitForTimeout(1000);

    // Record initial state
    const initialState = await getVideoState(page);
    console.log(`Initial state on ${browserName}:`, initialState);

    if (!initialState || initialState.paused) {
      // Try to force play
      await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (video) {
          video.muted = true;
          video.play().catch(e => console.error('Force play failed:', e));
        }
      });
      await page.waitForTimeout(1000);
    }

    // Monitor for 5 seconds and check if currentTime advances
    const timeChecks: number[] = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const state = await getVideoState(page);
      if (state) {
        timeChecks.push(state.currentTime);
        console.log(`Time check ${i + 1} on ${browserName}: ${state.currentTime.toFixed(2)}s, paused: ${state.paused}, readyState: ${state.readyState}`);
      }
    }

    // Analyze if video is stuck
    const isStuck = timeChecks.length >= 3 &&
      timeChecks.slice(-3).every((t, i, arr) => i === 0 || Math.abs(t - arr[i-1]) < 0.1);

    if (isStuck) {
      console.error(`VIDEO IS STUCK on ${browserName}! Time not advancing.`);

      // Get detailed diagnostics
      const diagnostics = await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (!video) return null;

        return {
          readyState: video.readyState,
          readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][video.readyState],
          networkState: video.networkState,
          networkStateText: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][video.networkState],
          error: video.error ? {
            code: video.error.code,
            message: video.error.message
          } : null,
          currentSrc: video.currentSrc,
          bufferedRanges: video.buffered.length > 0 ?
            Array.from({length: video.buffered.length}, (_, i) => ({
              start: video.buffered.start(i),
              end: video.buffered.end(i)
            })) : [],
          seeking: video.seeking,
          paused: video.paused,
          ended: video.ended,
        };
      });

      console.log(`Detailed diagnostics on ${browserName}:`, JSON.stringify(diagnostics, null, 2));
    }

    expect(isStuck).toBe(false);
  });

  test('Video event sequence analysis', async ({ page, browserName }) => {
    console.log(`\n=== Event Sequence Analysis on ${browserName} ===`);

    // Set up event monitoring before navigation
    await page.addInitScript(() => {
      (window as any).__videoEventLog = [];

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLVideoElement) {
              const eventTypes = [
                'loadstart', 'progress', 'suspend', 'abort', 'error',
                'emptied', 'stalled', 'loadedmetadata', 'loadeddata',
                'canplay', 'canplaythrough', 'playing', 'waiting',
                'seeking', 'seeked', 'ended', 'play', 'pause'
              ];

              eventTypes.forEach(eventType => {
                node.addEventListener(eventType, (e) => {
                  (window as any).__videoEventLog.push({
                    type: eventType,
                    timestamp: Date.now(),
                    currentTime: node.currentTime,
                    readyState: node.readyState,
                    paused: node.paused
                  });
                });
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });

    await page.goto('/');
    await page.waitForTimeout(5000);

    // Trigger user interaction
    await page.mouse.click(100, 100);
    await page.waitForTimeout(3000);

    const eventLog = await page.evaluate(() => (window as any).__videoEventLog || []);

    console.log(`\nEvent sequence on ${browserName}:`);
    eventLog.forEach((e: any, i: number) => {
      console.log(`  ${i + 1}. ${e.type} @ ${e.currentTime.toFixed(2)}s (readyState: ${e.readyState}, paused: ${e.paused})`);
    });

    // Check for problematic patterns
    const hasStalled = eventLog.some((e: any) => e.type === 'stalled');
    const hasError = eventLog.some((e: any) => e.type === 'error');
    const hasWaitingWithoutPlaying = eventLog.some((e: any, i: number) =>
      e.type === 'waiting' && !eventLog.slice(i + 1).some((e2: any) => e2.type === 'playing')
    );

    if (hasStalled) {
      console.warn(`WARNING: Video stalled event detected on ${browserName}`);
    }
    if (hasError) {
      console.error(`ERROR: Video error event detected on ${browserName}`);
    }
    if (hasWaitingWithoutPlaying) {
      console.warn(`WARNING: Video stuck in waiting state on ${browserName}`);
    }

    expect(hasError).toBe(false);
  });

  test('Edge-specific: Check for codec support', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      // This test is specifically for Edge (which uses chromium)
      test.skip();
    }

    console.log(`\n=== Codec Support Test on ${browserName} ===`);

    await page.goto('/');

    const codecSupport = await page.evaluate(() => {
      const video = document.createElement('video');

      return {
        mp4_h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
        mp4_h264_high: video.canPlayType('video/mp4; codecs="avc1.64001E"'),
        mp4_h265: video.canPlayType('video/mp4; codecs="hvc1"'),
        webm_vp8: video.canPlayType('video/webm; codecs="vp8"'),
        webm_vp9: video.canPlayType('video/webm; codecs="vp9"'),
        webm_av1: video.canPlayType('video/webm; codecs="av01.0.01M.08"'),
        ogg_theora: video.canPlayType('video/ogg; codecs="theora"'),
      };
    });

    console.log(`Codec support on ${browserName}:`, codecSupport);

    // Check which source the video is using
    const currentSource = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      return video?.currentSrc || 'none';
    });

    console.log(`Current video source on ${browserName}: ${currentSource}`);
  });

  test('Safari-specific: Check playsinline behavior', async ({ page, browserName }) => {
    if (browserName !== 'webkit') {
      test.skip();
    }

    console.log(`\n=== Safari playsinline Test ===`);

    await page.goto('/');
    await waitForVideo(page);

    const safariVideoState = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (!video) return null;

      return {
        playsInline: video.playsInline,
        webkitPlaysInline: (video as any).webkitPlaysInline,
        webkitDisplayingFullscreen: (video as any).webkitDisplayingFullscreen,
        webkitSupportsFullscreen: (video as any).webkitSupportsFullscreen,
      };
    });

    console.log('Safari video state:', safariVideoState);

    expect(safariVideoState?.playsInline).toBe(true);
  });

  test('Memory and performance check', async ({ page, browserName }) => {
    console.log(`\n=== Performance Check on ${browserName} ===`);

    await page.goto('/');
    await waitForVideo(page);
    await page.waitForTimeout(3000);

    const perfMetrics = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (!video) return null;

      // Get video quality metrics if available
      const videoPlaybackQuality = (video as any).getVideoPlaybackQuality?.();

      return {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        droppedFrames: videoPlaybackQuality?.droppedVideoFrames || 0,
        totalFrames: videoPlaybackQuality?.totalVideoFrames || 0,
        corruptedFrames: videoPlaybackQuality?.corruptedVideoFrames || 0,
      };
    });

    console.log(`Performance metrics on ${browserName}:`, perfMetrics);

    if (perfMetrics && perfMetrics.totalFrames > 0) {
      const dropRate = perfMetrics.droppedFrames / perfMetrics.totalFrames;
      if (dropRate > 0.1) {
        console.warn(`WARNING: High frame drop rate (${(dropRate * 100).toFixed(1)}%) on ${browserName}`);
      }
    }
  });
});

// Specific test for diagnosing Edge issues
test.describe('Edge-Specific Deep Diagnostics', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Edge-specific tests');

  test('Edge video loading sequence', async ({ page }) => {
    console.log('\n=== Edge Deep Diagnostics ===');

    // Monitor network requests for video
    const videoRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('video') || request.url().includes('.mp4') || request.url().includes('.webm')) {
        videoRequests.push(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('video') || response.url().includes('.mp4') || response.url().includes('.webm')) {
        videoRequests.push(`RESPONSE: ${response.status()} ${response.url()} (${response.headers()['content-type']})`);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(5000);

    console.log('Video network requests:');
    videoRequests.forEach(r => console.log(`  ${r}`));

    // Check for any JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    if (jsErrors.length > 0) {
      console.error('JavaScript errors detected:');
      jsErrors.forEach(e => console.error(`  ${e}`));
    }
  });
});
