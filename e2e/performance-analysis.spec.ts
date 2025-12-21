import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface PerformanceMetrics {
  viewport: string;
  page: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  consoleLogs: string[];
  networkRequests: {
    url: string;
    status: number;
    size: number;
    duration: number;
    type: string;
  }[];
  failedRequests: {
    url: string;
    status: number;
    error?: string;
  }[];
  slowRequests: {
    url: string;
    duration: number;
    size: number;
  }[];
  largeFiles: {
    url: string;
    size: number;
    type: string;
  }[];
  pageLoadTime: number;
  navigationTime?: number;
  jsErrors: string[];
  corsErrors: string[];
}

const viewports = [
  { name: 'Mobile (iPhone 12 Pro)', width: 390, height: 844 },
  { name: 'Tablet (iPad)', width: 768, height: 1024 },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080 }
];

const pages = [
  { name: 'Homepage', url: 'http://localhost:8080/' },
  { name: 'Services', url: 'http://localhost:8080/services' },
  { name: 'Booking', url: 'http://localhost:8080/booking' },
  { name: 'Shop', url: 'http://localhost:8080/shop' },
  { name: 'About', url: 'http://localhost:8080/about' },
  { name: 'Team', url: 'http://localhost:8080/team' },
  { name: 'Blog', url: 'http://localhost:8080/blog' },
  { name: 'Contact', url: 'http://localhost:8080/contact' }
];

async function collectPageMetrics(page: Page, viewport: string, pageName: string, url: string): Promise<PerformanceMetrics> {
  const metrics: PerformanceMetrics = {
    viewport,
    page: pageName,
    consoleErrors: [],
    consoleWarnings: [],
    consoleLogs: [],
    networkRequests: [],
    failedRequests: [],
    slowRequests: [],
    largeFiles: [],
    pageLoadTime: 0,
    jsErrors: [],
    corsErrors: []
  };

  // Collect console messages
  page.on('console', msg => {
    const text = msg.text();
    switch (msg.type()) {
      case 'error':
        metrics.consoleErrors.push(text);
        if (text.toLowerCase().includes('cors')) {
          metrics.corsErrors.push(text);
        }
        break;
      case 'warning':
        metrics.consoleWarnings.push(text);
        break;
      default:
        metrics.consoleLogs.push(text);
    }
  });

  // Collect JavaScript errors
  page.on('pageerror', error => {
    metrics.jsErrors.push(error.message);
  });

  // Track network requests
  const requests = new Map();

  page.on('request', request => {
    requests.set(request.url(), {
      url: request.url(),
      startTime: Date.now(),
      type: request.resourceType()
    });
  });

  page.on('response', async response => {
    const url = response.url();
    const request = requests.get(url);

    if (request) {
      const duration = Date.now() - request.startTime;
      let size = 0;

      try {
        const headers = response.headers();
        size = parseInt(headers['content-length'] || '0', 10);
      } catch (e) {
        // Ignore errors getting size
      }

      const requestData = {
        url,
        status: response.status(),
        size,
        duration,
        type: request.type
      };

      metrics.networkRequests.push(requestData);

      // Track failed requests
      if (response.status() >= 400) {
        metrics.failedRequests.push({
          url,
          status: response.status()
        });
      }

      // Track slow requests (>1 second)
      if (duration > 1000) {
        metrics.slowRequests.push({
          url,
          duration,
          size
        });
      }

      // Track large files (>500KB)
      if (size > 500000) {
        metrics.largeFiles.push({
          url,
          size,
          type: request.type
        });
      }
    }
  });

  // Navigate and measure load time
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  metrics.pageLoadTime = Date.now() - startTime;

  // Wait a bit for any delayed console messages
  await page.waitForTimeout(2000);

  return metrics;
}

test.describe('Comprehensive Performance Analysis', () => {
  const allMetrics: PerformanceMetrics[] = [];

  for (const viewport of viewports) {
    test.describe(`${viewport.name}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const testPage of pages) {
        test(`Analyze ${testPage.name}`, async ({ page }) => {
          console.log(`\n========================================`);
          console.log(`Testing: ${testPage.name} on ${viewport.name}`);
          console.log(`========================================`);

          const metrics = await collectPageMetrics(page, viewport.name, testPage.name, testPage.url);
          allMetrics.push(metrics);

          // Log immediate findings
          console.log(`\n📊 Quick Stats:`);
          console.log(`  - Page Load Time: ${metrics.pageLoadTime}ms`);
          console.log(`  - Console Errors: ${metrics.consoleErrors.length}`);
          console.log(`  - Console Warnings: ${metrics.consoleWarnings.length}`);
          console.log(`  - Network Requests: ${metrics.networkRequests.length}`);
          console.log(`  - Failed Requests: ${metrics.failedRequests.length}`);
          console.log(`  - Slow Requests (>1s): ${metrics.slowRequests.length}`);
          console.log(`  - Large Files (>500KB): ${metrics.largeFiles.length}`);
          console.log(`  - JS Errors: ${metrics.jsErrors.length}`);
          console.log(`  - CORS Errors: ${metrics.corsErrors.length}`);

          if (metrics.consoleErrors.length > 0) {
            console.log(`\n❌ Console Errors:`);
            metrics.consoleErrors.forEach(err => console.log(`  - ${err}`));
          }

          if (metrics.failedRequests.length > 0) {
            console.log(`\n🔴 Failed Requests:`);
            metrics.failedRequests.forEach(req => {
              console.log(`  - ${req.status}: ${req.url}`);
            });
          }

          if (metrics.slowRequests.length > 0) {
            console.log(`\n🐌 Slow Requests (>1s):`);
            metrics.slowRequests.forEach(req => {
              console.log(`  - ${req.duration}ms: ${req.url} (${(req.size / 1024).toFixed(2)}KB)`);
            });
          }

          if (metrics.largeFiles.length > 0) {
            console.log(`\n📦 Large Files (>500KB):`);
            metrics.largeFiles.forEach(file => {
              console.log(`  - ${(file.size / 1024).toFixed(2)}KB [${file.type}]: ${file.url}`);
            });
          }

          if (metrics.jsErrors.length > 0) {
            console.log(`\n⚠️ JavaScript Errors:`);
            metrics.jsErrors.forEach(err => console.log(`  - ${err}`));
          }

          // Take a screenshot for visual verification
          await page.screenshot({
            path: `e2e/screenshots/perf-${viewport.name.replace(/[^a-z0-9]/gi, '-')}-${testPage.name.toLowerCase()}.png`,
            fullPage: true
          });
        });
      }
    });
  }

  test.afterAll(async () => {
    // Generate comprehensive report
    const reportPath = path.join(__dirname, '..', 'PERFORMANCE_REPORT.md');
    let report = `# Zavira Salon - Comprehensive Performance Analysis Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `**Test Scope:** ${pages.length} pages × ${viewports.length} viewports = ${allMetrics.length} test scenarios\n\n`;

    // Executive Summary
    report += `## 📊 Executive Summary\n\n`;

    const totalErrors = allMetrics.reduce((sum, m) => sum + m.consoleErrors.length, 0);
    const totalWarnings = allMetrics.reduce((sum, m) => sum + m.consoleWarnings.length, 0);
    const totalFailedRequests = allMetrics.reduce((sum, m) => sum + m.failedRequests.length, 0);
    const totalSlowRequests = allMetrics.reduce((sum, m) => sum + m.slowRequests.length, 0);
    const totalJsErrors = allMetrics.reduce((sum, m) => sum + m.jsErrors.length, 0);
    const totalCorsErrors = allMetrics.reduce((sum, m) => sum + m.corsErrors.length, 0);
    const avgLoadTime = allMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / allMetrics.length;

    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Console Errors | ${totalErrors} |\n`;
    report += `| Total Console Warnings | ${totalWarnings} |\n`;
    report += `| Total Failed Requests | ${totalFailedRequests} |\n`;
    report += `| Total Slow Requests (>1s) | ${totalSlowRequests} |\n`;
    report += `| Total JavaScript Errors | ${totalJsErrors} |\n`;
    report += `| Total CORS Errors | ${totalCorsErrors} |\n`;
    report += `| Average Page Load Time | ${avgLoadTime.toFixed(2)}ms |\n\n`;

    // Critical Issues
    report += `## 🚨 Critical Issues\n\n`;

    const criticalIssues: { page: string; viewport: string; issue: string; severity: string }[] = [];

    allMetrics.forEach(m => {
      if (m.jsErrors.length > 0) {
        m.jsErrors.forEach(err => {
          criticalIssues.push({
            page: m.page,
            viewport: m.viewport,
            issue: `JavaScript Error: ${err}`,
            severity: 'CRITICAL'
          });
        });
      }

      if (m.corsErrors.length > 0) {
        m.corsErrors.forEach(err => {
          criticalIssues.push({
            page: m.page,
            viewport: m.viewport,
            issue: `CORS Error: ${err}`,
            severity: 'HIGH'
          });
        });
      }

      if (m.failedRequests.length > 0) {
        m.failedRequests.forEach(req => {
          if (req.status === 404) {
            criticalIssues.push({
              page: m.page,
              viewport: m.viewport,
              issue: `404 Not Found: ${req.url}`,
              severity: 'MEDIUM'
            });
          } else if (req.status >= 500) {
            criticalIssues.push({
              page: m.page,
              viewport: m.viewport,
              issue: `${req.status} Server Error: ${req.url}`,
              severity: 'CRITICAL'
            });
          }
        });
      }
    });

    if (criticalIssues.length > 0) {
      report += `| Severity | Page | Viewport | Issue |\n`;
      report += `|----------|------|----------|-------|\n`;
      criticalIssues.forEach(issue => {
        report += `| ${issue.severity} | ${issue.page} | ${issue.viewport} | ${issue.issue} |\n`;
      });
    } else {
      report += `✅ No critical issues detected!\n`;
    }
    report += `\n`;

    // Performance by Viewport
    report += `## 📱 Performance by Viewport\n\n`;

    for (const viewport of viewports) {
      const viewportMetrics = allMetrics.filter(m => m.viewport === viewport.name);
      const avgLoad = viewportMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / viewportMetrics.length;
      const errors = viewportMetrics.reduce((sum, m) => sum + m.consoleErrors.length, 0);

      report += `### ${viewport.name}\n\n`;
      report += `- **Average Load Time:** ${avgLoad.toFixed(2)}ms\n`;
      report += `- **Total Errors:** ${errors}\n`;
      report += `- **Pages Tested:** ${viewportMetrics.length}\n\n`;
    }

    // Performance by Page
    report += `## 📄 Performance by Page\n\n`;
    report += `| Page | Avg Load Time | Errors | Warnings | Failed Requests | Slow Requests |\n`;
    report += `|------|---------------|--------|----------|-----------------|---------------|\n`;

    for (const testPage of pages) {
      const pageMetrics = allMetrics.filter(m => m.page === testPage.name);
      const avgLoad = pageMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / pageMetrics.length;
      const errors = pageMetrics.reduce((sum, m) => sum + m.consoleErrors.length, 0);
      const warnings = pageMetrics.reduce((sum, m) => sum + m.consoleWarnings.length, 0);
      const failed = pageMetrics.reduce((sum, m) => sum + m.failedRequests.length, 0);
      const slow = pageMetrics.reduce((sum, m) => sum + m.slowRequests.length, 0);

      report += `| ${testPage.name} | ${avgLoad.toFixed(2)}ms | ${errors} | ${warnings} | ${failed} | ${slow} |\n`;
    }
    report += `\n`;

    // Network Performance
    report += `## 🌐 Network Performance Analysis\n\n`;

    const allRequests = allMetrics.flatMap(m => m.networkRequests);
    const uniqueUrls = [...new Set(allRequests.map(r => r.url))];

    report += `- **Total Requests:** ${allRequests.length}\n`;
    report += `- **Unique URLs:** ${uniqueUrls.length}\n`;
    report += `- **Duplicate Requests:** ${allRequests.length - uniqueUrls.length}\n\n`;

    // Slow Requests Summary
    const allSlowRequests = allMetrics.flatMap(m => m.slowRequests);
    if (allSlowRequests.length > 0) {
      report += `### 🐌 Slow Requests (>1 second)\n\n`;

      const slowByUrl = new Map<string, { count: number; avgDuration: number; totalSize: number }>();

      allSlowRequests.forEach(req => {
        const existing = slowByUrl.get(req.url) || { count: 0, avgDuration: 0, totalSize: 0 };
        existing.count++;
        existing.avgDuration = (existing.avgDuration * (existing.count - 1) + req.duration) / existing.count;
        existing.totalSize += req.size;
        slowByUrl.set(req.url, existing);
      });

      report += `| URL | Occurrences | Avg Duration | Total Size |\n`;
      report += `|-----|-------------|--------------|------------|\n`;

      [...slowByUrl.entries()]
        .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
        .slice(0, 20)
        .forEach(([url, data]) => {
          report += `| ${url} | ${data.count} | ${data.avgDuration.toFixed(2)}ms | ${(data.totalSize / 1024).toFixed(2)}KB |\n`;
        });
      report += `\n`;
    }

    // Large Files Summary
    const allLargeFiles = allMetrics.flatMap(m => m.largeFiles);
    if (allLargeFiles.length > 0) {
      report += `### 📦 Large Files (>500KB)\n\n`;

      const largeByUrl = new Map<string, { size: number; type: string }>();

      allLargeFiles.forEach(file => {
        if (!largeByUrl.has(file.url)) {
          largeByUrl.set(file.url, { size: file.size, type: file.type });
        }
      });

      report += `| URL | Size | Type |\n`;
      report += `|-----|------|------|\n`;

      [...largeByUrl.entries()]
        .sort((a, b) => b[1].size - a[1].size)
        .forEach(([url, data]) => {
          report += `| ${url} | ${(data.size / 1024).toFixed(2)}KB | ${data.type} |\n`;
        });
      report += `\n`;
    }

    // Recommendations
    report += `## 💡 Recommendations\n\n`;

    if (totalErrors > 0) {
      report += `### Fix Console Errors\n`;
      report += `- **Priority:** HIGH\n`;
      report += `- **Found:** ${totalErrors} console errors across all pages\n`;
      report += `- **Action:** Review and fix all console errors to improve stability\n\n`;
    }

    if (totalFailedRequests > 0) {
      report += `### Resolve Failed Network Requests\n`;
      report += `- **Priority:** HIGH\n`;
      report += `- **Found:** ${totalFailedRequests} failed requests (404s, 500s)\n`;
      report += `- **Action:** Fix broken URLs and missing resources\n\n`;
    }

    if (totalSlowRequests > 0) {
      report += `### Optimize Slow Loading Resources\n`;
      report += `- **Priority:** MEDIUM\n`;
      report += `- **Found:** ${totalSlowRequests} requests taking over 1 second\n`;
      report += `- **Action:** Implement caching, compression, or CDN for slow resources\n\n`;
    }

    if (allLargeFiles.length > 0) {
      report += `### Compress Large Files\n`;
      report += `- **Priority:** MEDIUM\n`;
      report += `- **Found:** ${allLargeFiles.length} files over 500KB\n`;
      report += `- **Action:** Optimize images, implement lazy loading, use modern formats (WebP, AVIF)\n\n`;
    }

    if (avgLoadTime > 3000) {
      report += `### Improve Page Load Time\n`;
      report += `- **Priority:** HIGH\n`;
      report += `- **Average Load Time:** ${avgLoadTime.toFixed(2)}ms\n`;
      report += `- **Target:** <3000ms\n`;
      report += `- **Action:** Reduce bundle size, implement code splitting, optimize critical rendering path\n\n`;
    }

    if (totalCorsErrors > 0) {
      report += `### Fix CORS Issues\n`;
      report += `- **Priority:** HIGH\n`;
      report += `- **Found:** ${totalCorsErrors} CORS errors\n`;
      report += `- **Action:** Configure proper CORS headers on backend or use proxy\n\n`;
    }

    // Detailed Metrics
    report += `## 📋 Detailed Metrics by Test Scenario\n\n`;

    allMetrics.forEach(m => {
      report += `### ${m.page} - ${m.viewport}\n\n`;
      report += `- **Page Load Time:** ${m.pageLoadTime}ms\n`;
      report += `- **Console Errors:** ${m.consoleErrors.length}\n`;
      report += `- **Console Warnings:** ${m.consoleWarnings.length}\n`;
      report += `- **Network Requests:** ${m.networkRequests.length}\n`;
      report += `- **Failed Requests:** ${m.failedRequests.length}\n`;
      report += `- **Slow Requests:** ${m.slowRequests.length}\n`;
      report += `- **Large Files:** ${m.largeFiles.length}\n`;
      report += `- **JS Errors:** ${m.jsErrors.length}\n\n`;

      if (m.consoleErrors.length > 0) {
        report += `**Console Errors:**\n`;
        m.consoleErrors.forEach(err => report += `- ${err}\n`);
        report += `\n`;
      }

      if (m.failedRequests.length > 0) {
        report += `**Failed Requests:**\n`;
        m.failedRequests.forEach(req => report += `- ${req.status}: ${req.url}\n`);
        report += `\n`;
      }

      report += `---\n\n`;
    });

    // Save report
    fs.writeFileSync(reportPath, report);
    console.log(`\n\n✅ Performance report generated: ${reportPath}`);
  });
});
