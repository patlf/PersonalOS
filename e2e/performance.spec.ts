import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate to the main tasks page
    await page.goto('/tasks');
    
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: 0,
            ttfb: 0,
          };
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              metrics.cls += entry.value;
            }
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            if (entry.entryType === 'navigation') {
              metrics.ttfb = entry.responseStart - entry.requestStart;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
        
        // Fallback timeout
        setTimeout(() => resolve({
          lcp: performance.now(),
          fid: 0,
          cls: 0,
          fcp: performance.now(),
          ttfb: 0,
        }), 5000);
      });
    });
    
    // Core Web Vitals thresholds
    expect(performanceMetrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(performanceMetrics.fid).toBeLessThan(100);  // FID < 100ms
    expect(performanceMetrics.cls).toBeLessThan(0.1);  // CLS < 0.1
    expect(performanceMetrics.fcp).toBeLessThan(1800); // FCP < 1.8s
  });

  test('should load initial page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large task lists efficiently', async ({ page }) => {
    // Mock API to return large number of tasks
    await page.route('/api/tasks', route => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        estimatedDuration: 60,
        status: 'someday',
        scheduledDate: null,
        scheduledTime: null,
        tags: ['performance-test'],
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'test-user',
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeTasks),
      });
    });
    
    const startTime = Date.now();
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    const renderTime = Date.now() - startTime;
    
    // Should render large lists within reasonable time
    expect(renderTime).toBeLessThan(3000);
    
    // Test scrolling performance
    const scrollStartTime = Date.now();
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(100);
    const scrollTime = Date.now() - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(200);
  });

  test('should maintain performance during drag operations', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Create a task for dragging
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Performance test task');
    await taskInput.press('Enter');
    
    // Measure drag performance
    const taskCard = page.locator('text=Performance test task').first();
    const dayColumn = page.locator('[data-testid="day-column"]').first();
    
    const dragStartTime = Date.now();
    
    await taskCard.dragTo(dayColumn);
    
    const dragTime = Date.now() - dragStartTime;
    
    // Drag operation should complete quickly
    expect(dragTime).toBeLessThan(500);
  });

  test('should have efficient memory usage', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Perform various operations
    for (let i = 0; i < 10; i++) {
      const taskInput = page.locator('[data-testid="task-input"]').first();
      await taskInput.fill(`Memory test task ${i}`);
      await taskInput.press('Enter');
    }
    
    // Navigate between views
    await page.locator('[data-testid="nav-calendar"]').click();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="nav-tasks"]').click();
    await page.waitForLoadState('networkidle');
    
    // Check memory usage after operations
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory increase should be reasonable (less than 50MB)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('should have fast search performance', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Create multiple tasks for searching
    const taskInput = page.locator('[data-testid="task-input"]').first();
    
    for (let i = 0; i < 50; i++) {
      await taskInput.fill(`Search test task ${i}`);
      await taskInput.press('Enter');
    }
    
    // Test search performance
    const searchInput = page.locator('[data-testid="task-search"]');
    
    const searchStartTime = Date.now();
    await searchInput.fill('test task 25');
    
    // Wait for search results
    await page.waitForSelector('text=Search test task 25', { timeout: 1000 });
    
    const searchTime = Date.now() - searchStartTime;
    
    // Search should be fast
    expect(searchTime).toBeLessThan(300);
  });

  test('should handle rapid user interactions efficiently', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // Simulate rapid interactions
    for (let i = 0; i < 20; i++) {
      // Rapid task creation
      const taskInput = page.locator('[data-testid="task-input"]').first();
      await taskInput.fill(`Rapid task ${i}`);
      await taskInput.press('Enter');
      
      // Rapid navigation
      if (i % 5 === 0) {
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    // Should handle rapid interactions without significant delay
    expect(totalTime).toBeLessThan(5000);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Monitor frame rate during animations
    const frameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        let startTime = performance.now();
        
        function countFrames() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames);
          }
        }
        
        // Trigger animations by hovering over elements
        const elements = document.querySelectorAll('[data-testid="task-card"]');
        elements.forEach((el, index) => {
          setTimeout(() => {
            el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            setTimeout(() => {
              el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }, 50);
          }, index * 100);
        });
        
        requestAnimationFrame(countFrames);
      });
    });
    
    // Should maintain close to 60fps
    expect(frameRate).toBeGreaterThan(50);
  });

  test('should have efficient bundle size', async ({ page }) => {
    // Navigate to page and measure resource sizes
    const response = await page.goto('/tasks');
    
    // Get all network requests
    const requests = [];
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        requests.push({
          url: response.url(),
          size: response.headers()['content-length'] || 0,
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Calculate total bundle size
    const totalSize = requests.reduce((sum, req) => sum + parseInt(req.size), 0);
    
    // Bundle should be reasonable size (less than 2MB)
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
  });
});