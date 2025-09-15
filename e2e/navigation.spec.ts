import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout', () => {
  test('should navigate between different modules', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to Tasks
    await page.locator('[data-testid="nav-tasks"]').click();
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible();
    
    // Test navigation to Calendar
    await page.locator('[data-testid="nav-calendar"]').click();
    await expect(page).toHaveURL('/calendar');
    await expect(page.locator('text=Coming Soon')).toBeVisible();
    
    // Test navigation to AI
    await page.locator('[data-testid="nav-ai"]').click();
    await expect(page).toHaveURL('/ai');
    await expect(page.locator('text=Coming Soon')).toBeVisible();
    
    // Test navigation to Mail
    await page.locator('[data-testid="nav-mail"]').click();
    await expect(page).toHaveURL('/mail');
    await expect(page.locator('text=Coming Soon')).toBeVisible();
  });

  test('should show active navigation state', async ({ page }) => {
    await page.goto('/tasks');
    
    // Verify Tasks nav item is active
    const tasksNav = page.locator('[data-testid="nav-tasks"]');
    await expect(tasksNav).toHaveClass(/active/);
    
    // Navigate to Calendar and verify state change
    await page.locator('[data-testid="nav-calendar"]').click();
    await expect(page.locator('[data-testid="nav-calendar"]')).toHaveClass(/active/);
    await expect(tasksNav).not.toHaveClass(/active/);
  });

  test('should display tooltips on navigation items', async ({ page }) => {
    await page.goto('/');
    
    // Hover over navigation items and verify tooltips
    await page.locator('[data-testid="nav-tasks"]').hover();
    await expect(page.locator('text=Tasks')).toBeVisible();
    
    await page.locator('[data-testid="nav-calendar"]').hover();
    await expect(page.locator('text=Calendar')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tasks');
    
    // Verify layout adapts to mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Test that content is still accessible
    await expect(page.locator('[data-testid="task-input"]')).toBeVisible();
  });
});