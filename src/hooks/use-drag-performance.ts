'use client';

import { useCallback, useRef, useMemo } from 'react';
import { throttle, debounce } from 'lodash';

interface DragPerformanceOptions {
  throttleMs?: number;
  debounceMs?: number;
  enableRAF?: boolean;
}

export function useDragPerformance({
  throttleMs = 16, // ~60fps
  debounceMs = 100,
  enableRAF = true,
}: DragPerformanceOptions = {}) {
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Throttled update function for smooth animations
  const throttledUpdate = useCallback(
    throttle((callback: () => void) => {
      if (enableRAF) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
        
        rafIdRef.current = requestAnimationFrame(() => {
          const now = performance.now();
          if (now - lastUpdateRef.current >= throttleMs) {
            callback();
            lastUpdateRef.current = now;
          }
        });
      } else {
        callback();
      }
    }, throttleMs),
    [throttleMs, enableRAF]
  );

  // Debounced update for less frequent operations
  const debouncedUpdate = useCallback(
    debounce((callback: () => void) => {
      callback();
    }, debounceMs),
    [debounceMs]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    throttledUpdate.cancel();
    debouncedUpdate.cancel();
  }, [throttledUpdate, debouncedUpdate]);

  // Memoized performance utilities
  const performanceUtils = useMemo(() => ({
    throttledUpdate,
    debouncedUpdate,
    cleanup,
    
    // Batch DOM updates
    batchUpdate: (updates: (() => void)[]) => {
      throttledUpdate(() => {
        updates.forEach(update => update());
      });
    },
    
    // Optimize element queries
    memoizedQuery: (() => {
      const cache = new Map<string, Element | null>();
      return (selector: string) => {
        if (!cache.has(selector)) {
          cache.set(selector, document.querySelector(selector));
        }
        return cache.get(selector);
      };
    })(),
    
    // Measure performance
    measurePerformance: (name: string, fn: () => void) => {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.debug(`${name} took ${end - start} milliseconds`);
    },
  }), [throttledUpdate, debouncedUpdate, cleanup]);

  return performanceUtils;
}

// Hook for optimizing drag state updates
export function useDragStateOptimization() {
  const stateRef = useRef<any>({});
  const { throttledUpdate } = useDragPerformance();

  const updateState = useCallback((newState: any, callback?: () => void) => {
    // Only update if state actually changed
    const hasChanged = Object.keys(newState).some(
      key => stateRef.current[key] !== newState[key]
    );

    if (hasChanged) {
      stateRef.current = { ...stateRef.current, ...newState };
      if (callback) {
        throttledUpdate(callback);
      }
    }
  }, [throttledUpdate]);

  const getState = useCallback(() => stateRef.current, []);

  return { updateState, getState };
}

// Hook for optimizing collision detection
export function useCollisionOptimization() {
  const collisionCacheRef = useRef(new Map<string, any>());
  const lastCollisionTimeRef = useRef<number>(0);

  const getCachedCollision = useCallback((key: string) => {
    return collisionCacheRef.current.get(key);
  }, []);

  const setCachedCollision = useCallback((key: string, value: any) => {
    const now = performance.now();
    
    // Clear old cache entries periodically
    if (now - lastCollisionTimeRef.current > 1000) {
      collisionCacheRef.current.clear();
      lastCollisionTimeRef.current = now;
    }
    
    collisionCacheRef.current.set(key, value);
  }, []);

  const clearCollisionCache = useCallback(() => {
    collisionCacheRef.current.clear();
  }, []);

  return {
    getCachedCollision,
    setCachedCollision,
    clearCollisionCache,
  };
}