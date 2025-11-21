/**
 * Performance Monitoring and Web Vitals Tracking
 * Measures and reports performance metrics for production optimization
 */

import React from 'react';
import { config } from './environment';

// Web Vitals interfaces
export interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

// Performance observer types
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationEntry?: PerformanceNavigationTiming;
}

// Performance rating thresholds
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
};

// Performance rating helper
const getRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Core Web Vitals measurement
class WebVitalsTracker {
  private metrics: WebVitals = {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private initializeTracking() {
    // Only track in production
    if (config.app.env !== 'production') return;

    this.trackNavigationTiming();
    this.trackLargestContentfulPaint();
    this.trackFirstInputDelay();
    this.trackCumulativeLayoutShift();
    this.trackFirstContentfulPaint();

    // Report metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => this.reportMetrics(), 2000);
    });
  }

  private trackNavigationTiming() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
    }
  }

  private trackLargestContentfulPaint() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        this.metrics.LCP = lastEntry.startTime;
        this.logMetric('LCP', this.metrics.LCP);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  private trackFirstInputDelay() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.FID = entry.processingStart - entry.startTime;
        this.logMetric('FID', this.metrics.FID);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  private trackCumulativeLayoutShift() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.metrics.CLS = clsValue;
      this.logMetric('CLS', this.metrics.CLS);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  private trackFirstContentfulPaint() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime;
          this.logMetric('FCP', this.metrics.FCP);
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  private logMetric(name: string, value: number) {
    const rating = getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      delta: 0,
      id: `${name}-${Date.now()}`,
    };

    // Console log in development
    if (config.app.env === 'development') {
      console.log(`📊 ${name}: ${Math.round(value)}ms (${rating})`);
    }

    // Send to analytics in production
    if (config.app.env === 'production' && config.analytics.googleAnalyticsId) {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.rating,
        event_category: 'Web Vitals',
      });
    }

    // Custom analytics endpoint
    if (config.analytics.sentryDsn) {
      this.sendToCustomEndpoint(metric);
    }
  }

  private sendToCustomEndpoint(metric: PerformanceMetric) {
    // Send to custom performance endpoint
    fetch('/api/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }

  public reportMetrics() {
    const report = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log comprehensive report
    console.group('📈 Performance Report');
    Object.entries(this.metrics).forEach(([key, value]) => {
      const rating = getRating(key, value);
      console.log(`${key}: ${Math.round(value)}ms (${rating})`);
    });
    console.groupEnd();

    // Send full report to analytics
    if (config.app.env === 'production') {
      this.sendFullReport(report);
    }
  }

  private sendFullReport(report: any) {
    // Send comprehensive performance report
    fetch('/api/performance/full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    }).catch(console.error);
  }

  public getMetrics(): WebVitals {
    return { ...this.metrics };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance budget checker
export class PerformanceBudget {
  private budgets = {
    // Core Web Vitals
    FCP: 1800,
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    
    // Resource sizes (KB)
    js: 200,      // JavaScript bundle size
    css: 50,      // CSS bundle size
    images: 1000, // Total image size
    total: 1500,  // Total page size
    
    // Network
    ttfb: 800,    // Time to First Byte
  };

  public checkBudget(metrics: WebVitals): string[] {
    const violations: string[] = [];

    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const value = metrics[metric as keyof WebVitals];
      if (value > budget) {
        violations.push(`${metric}: ${value}ms exceeds budget of ${budget}ms`);
      }
    });

    return violations;
  }

  public setBudget(metric: string, budget: number) {
    this.budgets[metric as keyof typeof this.budgets] = budget;
  }
}

// Resource timing tracker
export class ResourceTracker {
  private resources: PerformanceResourceTiming[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.trackResources();
    }
  }

  private trackResources() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.resources.push(...entries as PerformanceResourceTiming[]);
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  public getLargestResources(): PerformanceResourceTiming[] {
    return this.resources
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 10);
  }

  public getSlowestResources(): PerformanceResourceTiming[] {
    return this.resources
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 10);
  }

  public getTotalTransferSize(): number {
    return this.resources.reduce((total, resource) => total + resource.transferSize, 0);
  }
}

// Initialize performance tracking
export const performanceTracker = new WebVitalsTracker();
export const performanceBudget = new PerformanceBudget();
export const resourceTracker = new ResourceTracker();

// Performance utility functions
export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return result;
    }
  }) as T;
};

// Lazy loading performance hook
export const useLazyLoad = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return [setRef, isVisible] as const;
};