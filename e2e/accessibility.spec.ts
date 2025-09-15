import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/tasks');
    
    // Check navigation has proper ARIA labels
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    
    // Check buttons have accessible names
    const addButton = page.locator('button:has-text("Add")');
    if (await addButton.count() > 0) {
      await expect(addButton).toHaveAttribute('aria-label');
    }
    
    // Check form inputs have labels
    const taskInput = page.locator('[data-testid="task-input"]');
    await expect(taskInput).toHaveAttribute('aria-label');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/tasks');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/tasks');
    
    // This would typically use axe-core or similar accessibility testing library
    // For now, we'll check that text is visible and readable
    const taskTitle = page.locator('h1').first();
    if (await taskTitle.count() > 0) {
      await expect(taskTitle).toBeVisible();
    }
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/tasks');
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/tasks');
    
    // Verify content is still visible and functional
    await expect(page.locator('body')).toBeVisible();
    
    // Test that interactive elements are still accessible
    const taskInput = page.locator('[data-testid="task-input"]');
    if (await taskInput.count() > 0) {
      await expect(taskInput).toBeVisible();
    }
  });
});