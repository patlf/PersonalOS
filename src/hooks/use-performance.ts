import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, PerformanceMetrics, monitorMemoryUsage } from '@/lib/performance';

/**
 * Hook for monitoring component performance
 */
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && performance?.now) {
      mountTime.current = performance.now();
      
      return () => {
        if (mountTime.current) {
          const mountDuration = performance.now() - mountTime.current;
          performanceMonitor.addMetric({
            name: `${componentName}-mount-duration`,
            duration: mountDuration,
            timestamp: Date.now(),
            type: 'render',
          });
        }
      };
    }
  }, [componentName]);

  const startRender = useCallback(() => {
    if (typeof window !== 'undefined' && performance?.now) {
      renderStartTime.current = performance.now();
    }
  }, []);

  const endRender = useCallback(() => {
    if (typeof window !== 'undefined' && performance?.now && renderStartTime.current) {
      const renderDuration = performance.now() - renderStartTime.current;
      performanceMonitor.addMetric({
        name: `${componentName}-render-duration`,
        duration: renderDuration,
        timestamp: Date.now(),
        type: 'render',
      });
    }
  }, [componentName]);

  return { startRender, endRender };
}

/**
 * Hook for monitoring API call performance
 */
export function useApiPerformance() {
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      performanceMonitor.addMetric({
        name: `api-${apiName}`,
        duration,
        timestamp: Date.now(),
        type: 'api',
        metadata: { success: true },
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      performanceMonitor.addMetric({
        name: `api-${apiName}`,
        duration,
        timestamp: Date.now(),
        type: 'api',
        metadata: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      });
      
      throw error;
    }
  }, []);

  return { measureApiCall };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitoring(intervalMs: number = 30000) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        monitorMemoryUsage();
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [intervalMs]);
}

/**
 * Hook for getting performance metrics
 */
export function usePerformanceMetrics() {
  const getMetrics = useCallback(() => {
    return performanceMonitor.getMetrics();
  }, []);

  const getMetricsByType = useCallback((type: PerformanceMetrics['type']) => {
    return performanceMonitor.getMetricsByType(type);
  }, []);

  const getAverageMetric = useCallback((name: string) => {
    return performanceMonitor.getAverageMetric(name);
  }, []);

  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
  }, []);

  return {
    getMetrics,
    getMetricsByType,
    getAverageMetric,
    clearMetrics,
  };
}

/**
 * Hook for monitoring interaction performance
 */
export function useInteractionPerformance() {
  const measureInteraction = useCallback(<T extends (...args: any[]) => any>(
    interaction: T,
    interactionName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = interaction(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          performanceMonitor.addMetric({
            name: `interaction-${interactionName}`,
            duration,
            timestamp: Date.now(),
            type: 'interaction',
          });
        });
      } else {
        const duration = performance.now() - start;
        performanceMonitor.addMetric({
          name: `interaction-${interactionName}`,
          duration,
          timestamp: Date.now(),
          type: 'interaction',
        });
        return result;
      }
    }) as T;
  }, []);

  return { measureInteraction };
}