import { test, expect } from '@playwright/test';

/**
 * Focused Edge browser video diagnostic test
 * Identifies specific issues causing video to get stuck
 */

test.describe('Edge Video Diagnostic', () => {
  test.setTimeout(60000);

  test('Diagnose video stuck issue in Edge', async ({ page, browserName }) => {
    console.log(`\n========================================`);
    console.log(`BROWSER: ${browserName}`);
    console.log(`========================================\n`);

    // Capture all console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate with domcontentloaded to avoid blocking on video
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    console.log('Page DOM loaded');

    // Wait for video element
    await page.waitForSelector('video', { timeout: 10000 });
    console.log('Video element found');

    // Get initial video state
    const initialState = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      return {
        src: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState,
        paused: video.paused,
        muted: video.muted,
        autoplay: video.autoplay,
        duration: video.duration,
        currentTime: video.currentTime,
        error: video.error?.message || null
      };
    });
    console.log('Initial video state:', JSON.stringify(initialState, null, 2));

    // Wait 2 seconds and check if video is progressing
    await page.waitForTimeout(2000);

    const afterWaitState = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      return {
        readyState: video.readyState,
        networkState: video.networkState,
        paused: video.paused,
        currentTime: video.currentTime,
        buffered: video.buffered.length > 0 ?
          `${video.buffered.start(0)}-${video.buffered.end(0)}` : 'none',
        seeking: video.seeking,
        ended: video.ended
      };
    });
    console.log('After 2s wait:', JSON.stringify(afterWaitState, null, 2));

    // Check if video is stuck (not progressing)
    const isStuck = initialState.currentTime === afterWaitState.currentTime &&
                    afterWaitState.currentTime === 0;

    if (isStuck) {
      console.log('\n⚠️ VIDEO APPEARS STUCK - Attempting diagnosis...\n');

      // Check what's blocking
      const diagnosis = await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;

        // Check for common issues
        const issues: string[] = [];

        // Check ready state
        const readyStateNames = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
        if (video.readyState < 2) {
          issues.push(`ReadyState too low: ${readyStateNames[video.readyState]} (${video.readyState})`);
        }

        // Check network state
        const networkStateNames = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
        if (video.networkState === 3) {
          issues.push(`Network state: ${networkStateNames[video.networkState]}`);
        }

        // Check if paused
        if (video.paused) {
          issues.push('Video is paused');
        }

        // Check for errors
        if (video.error) {
          issues.push(`Video error: code=${video.error.code}, message=${video.error.message}`);
        }

        // Check source
        if (!video.currentSrc) {
          issues.push('No current source selected');
        }

        // Check if buffered
        if (video.buffered.length === 0) {
          issues.push('No buffered data');
        }

        // Try to play and see what happens
        let playError = null;
        try {
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch(e => {
              playError = e.message;
            });
          }
        } catch (e: any) {
          playError = e.message;
        }

        return {
          issues,
          playError,
          sources: Array.from(video.querySelectorAll('source')).map(s => ({
            src: s.src,
            type: s.type
          })),
          poster: video.poster,
          crossOrigin: video.crossOrigin,
          preload: video.preload
        };
      });

      console.log('Diagnosis:', JSON.stringify(diagnosis, null, 2));

      // Wait a bit for play promise to resolve
      await page.waitForTimeout(1000);

      const afterPlayAttempt = await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        return {
          paused: video.paused,
          currentTime: video.currentTime,
          readyState: video.readyState
        };
      });
      console.log('After play attempt:', JSON.stringify(afterPlayAttempt, null, 2));
    }

    // Simulate user interaction (click)
    console.log('\nSimulating user interaction...');
    await page.mouse.click(400, 300);
    await page.waitForTimeout(2000);

    const afterInteraction = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      return {
        paused: video.paused,
        currentTime: video.currentTime,
        readyState: video.readyState
      };
    });
    console.log('After user interaction:', JSON.stringify(afterInteraction, null, 2));

    // Final check - monitor for 5 seconds
    console.log('\nMonitoring video for 5 seconds...');
    const timeProgress: number[] = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const time = await page.evaluate(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        return video.currentTime;
      });
      timeProgress.push(time);
      console.log(`  Second ${i + 1}: ${time.toFixed(2)}s`);
    }

    // Check if time is advancing
    const isAdvancing = timeProgress[4] > timeProgress[0];
    console.log(`\nVideo is ${isAdvancing ? '✅ PLAYING' : '❌ STUCK'}`);

    // Print all console logs
    if (consoleLogs.length > 0) {
      console.log('\n--- Browser Console Logs ---');
      consoleLogs.forEach(log => console.log(log));
    }

    // Print any errors
    if (pageErrors.length > 0) {
      console.log('\n--- Page Errors ---');
      pageErrors.forEach(err => console.log(err));
    }

    // The video should be playing
    expect(isAdvancing).toBe(true);
  });

  test('Check video source and format compatibility', async ({ page, browserName }) => {
    console.log(`\n=== Format Compatibility Test (${browserName}) ===`);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const formatCheck = await page.evaluate(() => {
      const video = document.createElement('video');

      // Test various formats
      const formats = {
        'video/mp4': video.canPlayType('video/mp4'),
        'video/mp4; codecs="avc1.42E01E"': video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"': video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
        'video/mp4; codecs="avc1.64001E"': video.canPlayType('video/mp4; codecs="avc1.64001E"'),
        'video/mp4; codecs="hvc1"': video.canPlayType('video/mp4; codecs="hvc1"'),
        'video/webm': video.canPlayType('video/webm'),
        'video/webm; codecs="vp8"': video.canPlayType('video/webm; codecs="vp8"'),
        'video/webm; codecs="vp9"': video.canPlayType('video/webm; codecs="vp9"'),
        'video/ogg': video.canPlayType('video/ogg'),
      };

      // Get actual video element sources
      const pageVideo = document.querySelector('video');
      const sources = pageVideo ? Array.from(pageVideo.querySelectorAll('source')).map(s => ({
        src: s.src,
        type: s.type,
        canPlay: video.canPlayType(s.type)
      })) : [];

      return { formats, sources, currentSrc: pageVideo?.currentSrc };
    });

    console.log('Format support:', JSON.stringify(formatCheck.formats, null, 2));
    console.log('Video sources:', JSON.stringify(formatCheck.sources, null, 2));
    console.log('Currently playing:', formatCheck.currentSrc);
  });

  test('Video event timeline', async ({ page, browserName }) => {
    console.log(`\n=== Video Event Timeline (${browserName}) ===`);

    // Inject event tracker before navigation
    await page.addInitScript(() => {
      (window as any).__videoTimeline = [];
      const startTime = Date.now();

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLVideoElement) {
              const events = [
                'loadstart', 'progress', 'suspend', 'abort', 'error',
                'emptied', 'stalled', 'loadedmetadata', 'loadeddata',
                'canplay', 'canplaythrough', 'playing', 'waiting',
                'seeking', 'seeked', 'ended', 'play', 'pause', 'timeupdate'
              ];

              events.forEach(eventName => {
                node.addEventListener(eventName, () => {
                  const elapsed = Date.now() - startTime;
                  (window as any).__videoTimeline.push({
                    event: eventName,
                    elapsed: `+${elapsed}ms`,
                    time: node.currentTime.toFixed(2),
                    state: node.readyState,
                    paused: node.paused
                  });
                });
              });
            }
          });
        });
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for video to attempt playing
    await page.waitForTimeout(3000);

    // Trigger user interaction
    await page.mouse.click(400, 300);
    await page.waitForTimeout(3000);

    const timeline = await page.evaluate(() => (window as any).__videoTimeline || []);

    console.log('\nEvent Timeline:');
    // Filter out timeupdate spam, keep only first few
    let timeupdateCount = 0;
    timeline.forEach((entry: any) => {
      if (entry.event === 'timeupdate') {
        timeupdateCount++;
        if (timeupdateCount <= 3 || timeupdateCount % 10 === 0) {
          console.log(`  ${entry.elapsed}: ${entry.event} (time=${entry.time}, state=${entry.state}, paused=${entry.paused})`);
        }
      } else {
        console.log(`  ${entry.elapsed}: ${entry.event} (time=${entry.time}, state=${entry.state}, paused=${entry.paused})`);
      }
    });

    // Check for problematic events
    const hasStalled = timeline.some((e: any) => e.event === 'stalled');
    const hasError = timeline.some((e: any) => e.event === 'error');
    const hasPlaying = timeline.some((e: any) => e.event === 'playing');

    console.log('\n--- Summary ---');
    console.log(`Has 'stalled' event: ${hasStalled}`);
    console.log(`Has 'error' event: ${hasError}`);
    console.log(`Has 'playing' event: ${hasPlaying}`);

    if (hasStalled && !hasPlaying) {
      console.log('⚠️ Video stalled and never recovered!');
    }
  });
});
