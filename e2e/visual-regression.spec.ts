import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should match Tasks view screenshot', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements that might cause flaky tests
    await page.addStyleTag({
      content: `
        [data-testid="current-time"],
        .animate-pulse,
        .animate-spin {
          animation: none !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('tasks-view.png');
  });

  test('should match Calendar placeholder screenshot', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('calendar-placeholder.png');
  });

  test('should match AI placeholder screenshot', async ({ page }) => {
    await page.goto('/ai');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('ai-placeholder.png');
  });

  test('should match Mail placeholder screenshot', async ({ page }) => {
    await page.goto('/mail');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mail-placeholder.png');
  });

  test('should match task edit modal screenshot', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Create a task first
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Visual test task');
    await taskInput.press('Enter');
    
    // Open edit modal
    const taskCard = page.locator('text=Visual test task').first();
    await taskCard.click({ button: 'right' });
    await page.locator('text=Edit').click();
    
    // Wait for modal to be fully visible
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('task-edit-modal.png');
  });

  test('should match dark theme screenshots', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tasks-view-dark.png');
  });

  test('should match mobile layout screenshots', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tasks-view-mobile.png');
  });

  test('should match tablet layout screenshots', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tasks-view-tablet.png');
  });

  test('should match navigation states', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Test active navigation state
    await expect(page.locator('[data-testid="sidebar"]')).toHaveScreenshot('navigation-tasks-active.png');
    
    // Navigate to calendar and test state change
    await page.locator('[data-testid="nav-calendar"]').click();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="sidebar"]')).toHaveScreenshot('navigation-calendar-active.png');
  });

  test('should match loading states', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('/api/tasks', route => {
      // Delay response to capture loading state
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }, 2000);
    });
    
    await page.goto('/tasks');
    
    // Capture loading state
    await expect(page.locator('[data-testid="tasks-loading"]')).toHaveScreenshot('tasks-loading-state.png');
  });

  test('should match error states', async ({ page }) => {
    // Intercept API calls to simulate error
    await page.route('/api/tasks', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Wait for error state to appear
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    
    await expect(page.locator('[data-testid="error-message"]')).toHaveScreenshot('tasks-error-state.png');
  });

  test('should match empty states', async ({ page }) => {
    // Mock empty response
    await page.route('/api/tasks', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="someday-column"]')).toHaveScreenshot('empty-someday-column.png');
  });

  test('should match drag and drop visual states', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Create a task for dragging
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Drag test task');
    await taskInput.press('Enter');
    
    // Start drag operation
    const taskCard = page.locator('text=Drag test task').first();
    await taskCard.hover();
    
    // Capture hover state
    await expect(taskCard).toHaveScreenshot('task-card-hover.png');
    
    // Simulate drag start (this might require custom implementation)
    await taskCard.dispatchEvent('dragstart');
    
    // Capture drag indicators
    await expect(page.locator('[data-testid="day-column"]').first()).toHaveScreenshot('drop-zone-active.png');
  });
});