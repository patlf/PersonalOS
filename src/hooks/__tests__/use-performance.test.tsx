import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useComponentPerformance, 
  useApiPerformance, 
  useMemoryMonitoring,
  usePerformanceMetrics,
  useInteractionPerformance 
} from '../use-performance';
import { performanceMonitor } from '@/lib/performance';

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

describe('Performance Hooks', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
    vi.useRealTimers();
  });

  describe('useComponentPerformance', () => {
    it('should provide render measurement functions', () => {
      const { result } = renderHook(() => useComponentPerformance('TestComponent'));

      expect(result.current.startRender).toBeInstanceOf(Function);
      expect(result.current.endRender).toBeInstanceOf(Function);
    });

    it('should record mount duration on unmount', () => {
      const { unmount } = renderHook(() => useComponentPerformance('TestComponent'));

      // Fast-forward time
      vi.advanceTimersByTime(100);
      
      unmount();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('TestComponent-mount-duration');
      expect(metrics[0].type).toBe('render');
    });

    it('should record render duration when called', () => {
      const { result } = renderHook(() => useComponentPerformance('TestComponent'));

      act(() => {
        result.current.startRender();
      });

      // Fast-forward time
      vi.advanceTimersByTime(50);

      act(() => {
        result.current.endRender();
      });

      const metrics = performanceMonitor.getMetrics();
      const renderMetrics = metrics.filter(m => m.name === 'TestComponent-render-duration');
      expect(renderMetrics).toHaveLength(1);
      expect(renderMetrics[0].type).toBe('render');
    });
  });

  describe('useApiPerformance', () => {
    it('should measure successful API calls', async () => {
      const { result } = renderHook(() => useApiPerformance());

      const mockApiCall = vi.fn().mockResolvedValue('success');

      const response = await result.current.measureApiCall(mockApiCall, 'test-api');

      expect(response).toBe('success');
      expect(mockApiCall).toHaveBeenCalledOnce();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('api-test-api');
      expect(metrics[0].type).toBe('api');
      expect(metrics[0].metadata?.success).toBe(true);
    });

    it('should measure failed API calls', async () => {
      const { result } = renderHook(() => useApiPerformance());

      const error = new Error('API Error');
      const mockApiCall = vi.fn().mockRejectedValue(error);

      await expect(
        result.current.measureApiCall(mockApiCall, 'failing-api')
      ).rejects.toThrow('API Error');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('api-failing-api');
      expect(metrics[0].type).toBe('api');
      expect(metrics[0].metadata?.success).toBe(false);
      expect(metrics[0].metadata?.error).toBe('API Error');
    });
  });

  describe('useMemoryMonitoring', () => {
    it('should set up memory monitoring interval', () => {
      const { unmount } = renderHook(() => useMemoryMonitoring(1000));

      // Fast-forward time to trigger memory monitoring
      vi.advanceTimersByTime(1000);

      const metrics = performanceMonitor.getMetrics();
      const memoryMetrics = metrics.filter(m => m.name === 'memory-usage');
      expect(memoryMetrics.length).toBeGreaterThan(0);

      unmount();
    });

    it('should clean up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = renderHook(() => useMemoryMonitoring(1000));
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('usePerformanceMetrics', () => {
    it('should provide metric access functions', () => {
      const { result } = renderHook(() => usePerformanceMetrics());

      expect(result.current.getMetrics).toBeInstanceOf(Function);
      expect(result.current.getMetricsByType).toBeInstanceOf(Function);
      expect(result.current.getAverageMetric).toBeInstanceOf(Function);
      expect(result.current.clearMetrics).toBeInstanceOf(Function);
    });

    it('should return metrics correctly', () => {
      // Add a test metric
      performanceMonitor.addMetric({
        name: 'test-metric',
        duration: 100,
        timestamp: Date.now(),
        type: 'render',
      });

      const { result } = renderHook(() => usePerformanceMetrics());

      const metrics = result.current.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-metric');

      const renderMetrics = result.current.getMetricsByType('render');
      expect(renderMetrics).toHaveLength(1);

      const average = result.current.getAverageMetric('test-metric');
      expect(average).toBe(100);
    });

    it('should clear metrics', () => {
      // Add a test metric
      performanceMonitor.addMetric({
        name: 'test-metric',
        duration: 100,
        timestamp: Date.now(),
        type: 'render',
      });

      const { result } = renderHook(() => usePerformanceMetrics());

      expect(result.current.getMetrics()).toHaveLength(1);

      act(() => {
        result.current.clearMetrics();
      });

      expect(result.current.getMetrics()).toHaveLength(0);
    });
  });

  describe('useInteractionPerformance', () => {
    it('should measure synchronous interactions', () => {
      const { result } = renderHook(() => useInteractionPerformance());

      const testInteraction = vi.fn(() => 'result');
      const measuredInteraction = result.current.measureInteraction(testInteraction, 'click');

      const response = measuredInteraction();

      expect(response).toBe('result');
      expect(testInteraction).toHaveBeenCalledOnce();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('interaction-click');
      expect(metrics[0].type).toBe('interaction');
    });

    it('should measure asynchronous interactions', async () => {
      const { result } = renderHook(() => useInteractionPerformance());

      const asyncInteraction = vi.fn().mockResolvedValue('async-result');
      const measuredInteraction = result.current.measureInteraction(asyncInteraction, 'async-click');

      const response = await measuredInteraction();

      expect(response).toBe('async-result');
      expect(asyncInteraction).toHaveBeenCalledOnce();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('interaction-async-click');
      expect(metrics[0].type).toBe('interaction');
    });
  });
});