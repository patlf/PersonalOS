/**
 * Performance monitoring utilities for the productivity platform
 */

// Performance metrics interface
export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction' | 'navigation';
  metadata?: Record<string, any>;
}

// Performance observer for monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.addMetric({
              name: 'page-load',
              duration: navEntry.loadEventEnd - navEntry.startTime,
              timestamp: Date.now(),
              type: 'navigation',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
                firstPaint: navEntry.loadEventStart - navEntry.startTime,
              }
            });
          }
        }
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation timing not supported');
      }

      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addMetric({
            name: 'largest-contentful-paint',
            duration: entry.startTime,
            timestamp: Date.now(),
            type: 'render',
            metadata: {
              element: (entry as any).element?.tagName,
              size: (entry as any).size,
            }
          });
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // Monitor first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // PerformanceEventTiming
          this.addMetric({
            name: 'first-input-delay',
            duration: fidEntry.processingStart - fidEntry.startTime,
            timestamp: Date.now(),
            type: 'interaction',
            metadata: {
              inputType: fidEntry.name,
            }
          });
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }
    }
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      if (metric.type === 'render' && metric.duration > 100) {
        console.warn(`Slow render detected: ${metric.name} took ${metric.duration}ms`);
      }
      if (metric.type === 'api' && metric.duration > 1000) {
        console.warn(`Slow API call detected: ${metric.name} took ${metric.duration}ms`);
      }
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getMetricsByType(type: PerformanceMetrics['type']): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(metric => metric.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance measurement decorators and utilities
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  type: PerformanceMetrics['type'] = 'interaction'
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        performanceMonitor.addMetric({
          name,
          duration,
          timestamp: Date.now(),
          type,
        });
      });
    } else {
      const duration = performance.now() - start;
      performanceMonitor.addMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
      });
      return result;
    }
  }) as T;
}

// React component performance measurement hook
export function usePerformanceMetric(name: string, dependencies: any[] = []) {
  if (typeof window !== 'undefined') {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      performanceMonitor.addMetric({
        name,
        duration,
        timestamp: Date.now(),
        type: 'render',
      });
    };
  }
  
  return () => {};
}

// Bundle size monitoring utilities
export function logBundleInfo() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Log initial bundle size information
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.group('Bundle Information');
    console.log('Scripts loaded:', scripts.length);
    console.log('Stylesheets loaded:', stylesheets.length);
    
    // Estimate total bundle size (rough approximation)
    let totalSize = 0;
    scripts.forEach((script: any) => {
      if (script.src && script.src.includes('/_next/')) {
        // This is a rough estimation - in production you'd want more accurate measurements
        totalSize += 100; // Rough estimate in KB
      }
    });
    
    console.log('Estimated bundle size:', `${totalSize}KB`);
    console.groupEnd();
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    
    performanceMonitor.addMetric({
      name: 'memory-usage',
      duration: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
      timestamp: Date.now(),
      type: 'render',
      metadata: {
        totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024,
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024,
      }
    });
  }
}

// Debounced function utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttled function utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}