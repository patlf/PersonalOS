import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  performanceMonitor, 
  measurePerformance, 
  debounce, 
  throttle,
  PerformanceMetrics 
} from '../performance';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 20, // 20MB
    jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('PerformanceMonitor', () => {
    it('should add and retrieve metrics', () => {
      const metric: PerformanceMetrics = {
        name: 'test-metric',
        duration: 100,
        timestamp: Date.now(),
        type: 'render',
      };

      performanceMonitor.addMetric(metric);
      const metrics = performanceMonitor.getMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(metric);
    });

    it('should filter metrics by type', () => {
      const renderMetric: PerformanceMetrics = {
        name: 'render-test',
        duration: 50,
        timestamp: Date.now(),
        type: 'render',
      };

      const apiMetric: PerformanceMetrics = {
        name: 'api-test',
        duration: 200,
        timestamp: Date.now(),
        type: 'api',
      };

      performanceMonitor.addMetric(renderMetric);
      performanceMonitor.addMetric(apiMetric);

      const renderMetrics = performanceMonitor.getMetricsByType('render');
      const apiMetrics = performanceMonitor.getMetricsByType('api');

      expect(renderMetrics).toHaveLength(1);
      expect(renderMetrics[0]).toEqual(renderMetric);
      expect(apiMetrics).toHaveLength(1);
      expect(apiMetrics[0]).toEqual(apiMetric);
    });

    it('should calculate average metrics', () => {
      const metrics = [
        { name: 'test', duration: 100, timestamp: Date.now(), type: 'render' as const },
        { name: 'test', duration: 200, timestamp: Date.now(), type: 'render' as const },
        { name: 'test', duration: 300, timestamp: Date.now(), type: 'render' as const },
      ];

      metrics.forEach(metric => performanceMonitor.addMetric(metric));

      const average = performanceMonitor.getAverageMetric('test');
      expect(average).toBe(200);
    });

    it('should limit metrics to prevent memory leaks', () => {
      // Add more than 100 metrics
      for (let i = 0; i < 150; i++) {
        performanceMonitor.addMetric({
          name: `metric-${i}`,
          duration: i,
          timestamp: Date.now(),
          type: 'render',
        });
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(100);
      
      // Should keep the most recent metrics
      expect(metrics[0].name).toBe('metric-50');
      expect(metrics[99].name).toBe('metric-149');
    });

    it('should clear all metrics', () => {
      performanceMonitor.addMetric({
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        type: 'render',
      });

      expect(performanceMonitor.getMetrics()).toHaveLength(1);
      
      performanceMonitor.clearMetrics();
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });
  });

  describe('measurePerformance', () => {
    it('should measure synchronous function performance', () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
        return 'result';
      };

      const measuredFunction = measurePerformance(testFunction, 'sync-test', 'interaction');
      const result = measuredFunction();

      expect(result).toBe('result');
      expect(callCount).toBe(1);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('sync-test');
      expect(metrics[0].type).toBe('interaction');
    });

    it('should measure asynchronous function performance', async () => {
      let callCount = 0;
      const asyncFunction = async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      };

      const measuredFunction = measurePerformance(asyncFunction, 'async-test', 'api');
      const result = await measuredFunction();

      expect(result).toBe('async-result');
      expect(callCount).toBe(1);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('async-test');
      expect(metrics[0].type).toBe('api');
    });

    it('should handle function errors and still record metrics', async () => {
      const errorFunction = async () => {
        throw new Error('Test error');
      };

      const measuredFunction = measurePerformance(errorFunction, 'error-test', 'api');

      await expect(measuredFunction()).rejects.toThrow('Test error');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('error-test');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
      };

      const debouncedFunction = debounce(testFunction, 100);

      // Call multiple times quickly
      debouncedFunction();
      debouncedFunction();
      debouncedFunction();

      expect(callCount).toBe(0);

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(callCount).toBe(1);
    });

    it('should reset debounce timer on subsequent calls', async () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
      };

      const debouncedFunction = debounce(testFunction, 100);

      debouncedFunction();
      
      // Call again before timer expires
      setTimeout(() => debouncedFunction(), 50);
      
      // Wait for first timer
      await new Promise(resolve => setTimeout(resolve, 120));
      expect(callCount).toBe(0);

      // Wait for second timer
      await new Promise(resolve => setTimeout(resolve, 80));
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
      };

      const throttledFunction = throttle(testFunction, 100);

      // First call should execute immediately
      throttledFunction();
      expect(callCount).toBe(1);

      // Subsequent calls should be throttled
      throttledFunction();
      throttledFunction();
      expect(callCount).toBe(1);

      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be able to call again
      throttledFunction();
      expect(callCount).toBe(2);
    });
  });
});

describe('Performance Utilities', () => {
  it('should handle missing performance API gracefully', () => {
    const originalPerformance = global.performance;
    
    // Remove performance API
    delete (global as any).performance;

    expect(() => {
      measurePerformance(() => 'test', 'test-without-performance');
    }).not.toThrow();

    // Restore performance API
    global.performance = originalPerformance;
  });
});