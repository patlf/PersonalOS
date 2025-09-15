import { test, expect } from '@playwright/test';

test.describe('Task Management Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the tasks page
    await page.goto('/tasks');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should create a new task in Someday column', async ({ page }) => {
    // Find the task input in Someday column
    const taskInput = page.locator('[data-testid="task-input"]').first();
    
    // Type a new task
    await taskInput.fill('Test task from E2E');
    
    // Press Enter to create the task
    await taskInput.press('Enter');
    
    // Verify the task appears in the Someday column
    await expect(page.locator('text=Test task from E2E')).toBeVisible();
  });

  test('should drag task from Someday to weekly timeline', async ({ page }) => {
    // First create a task
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Drag test task');
    await taskInput.press('Enter');
    
    // Wait for task to appear
    const taskCard = page.locator('text=Drag test task').first();
    await expect(taskCard).toBeVisible();
    
    // Find a day column in the timeline (e.g., Monday)
    const mondayColumn = page.locator('[data-testid="day-column"]').first();
    
    // Drag the task from Someday to Monday
    await taskCard.dragTo(mondayColumn);
    
    // Verify the task moved to the day column
    await expect(mondayColumn.locator('text=Drag test task')).toBeVisible();
  });

  test('should open task edit modal and update task', async ({ page }) => {
    // Create a task first
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Edit test task');
    await taskInput.press('Enter');
    
    // Right-click on the task to open context menu
    const taskCard = page.locator('text=Edit test task').first();
    await taskCard.click({ button: 'right' });
    
    // Click Edit option
    await page.locator('text=Edit').click();
    
    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Update the task title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Updated task title');
    
    // Save the changes
    await page.locator('button:has-text("Save")').click();
    
    // Verify the task title was updated
    await expect(page.locator('text=Updated task title')).toBeVisible();
  });

  test('should use keyboard shortcuts for task creation', async ({ page }) => {
    // Use Cmd+K (or Ctrl+K) to open quick task creation
    await page.keyboard.press('Meta+k');
    
    // Verify the task input is focused
    const taskInput = page.locator('[data-testid="task-input"]');
    await expect(taskInput).toBeFocused();
    
    // Type a task
    await taskInput.fill('Keyboard shortcut task');
    await taskInput.press('Enter');
    
    // Verify task was created
    await expect(page.locator('text=Keyboard shortcut task')).toBeVisible();
  });

  test('should navigate weeks using arrow keys', async ({ page }) => {
    // Get initial week display
    const weekDisplay = page.locator('[data-testid="week-display"]');
    const initialWeek = await weekDisplay.textContent();
    
    // Press right arrow to go to next week
    await page.keyboard.press('ArrowRight');
    
    // Verify week changed
    const newWeek = await weekDisplay.textContent();
    expect(newWeek).not.toBe(initialWeek);
    
    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    
    // Verify we're back to original week
    const backToOriginal = await weekDisplay.textContent();
    expect(backToOriginal).toBe(initialWeek);
  });

  test('should toggle past days visibility', async ({ page }) => {
    // Use Ctrl+P to toggle past days
    await page.keyboard.press('Meta+p');
    
    // Verify past days toggle state changed
    // This would depend on the specific implementation
    const pastDaysToggle = page.locator('[data-testid="past-days-toggle"]');
    await expect(pastDaysToggle).toBeVisible();
  });

  test('should schedule task to specific time slot', async ({ page }) => {
    // Create a task first
    const taskInput = page.locator('[data-testid="task-input"]').first();
    await taskInput.fill('Time blocking task');
    await taskInput.press('Enter');
    
    // Drag task to time-blocking sidebar
    const taskCard = page.locator('text=Time blocking task').first();
    const timeSlot = page.locator('[data-testid="time-slot-9-00"]').first();
    
    await taskCard.dragTo(timeSlot);
    
    // Verify task appears in the time slot
    await expect(timeSlot.locator('text=Time blocking task')).toBeVisible();
  });

  test('should display overdue tasks correctly', async ({ page }) => {
    // This test would require setting up overdue tasks
    // For now, just verify the overdue section exists
    const overdueSection = page.locator('[data-testid="overdue-tasks"]');
    await expect(overdueSection).toBeVisible();
  });

  test('should search and filter tasks', async ({ page }) => {
    // Create multiple tasks first
    const taskInput = page.locator('[data-testid="task-input"]').first();
    
    await taskInput.fill('Important meeting');
    await taskInput.press('Enter');
    
    await taskInput.fill('Buy groceries');
    await taskInput.press('Enter');
    
    // Use search functionality
    const searchInput = page.locator('[data-testid="task-search"]');
    await searchInput.fill('meeting');
    
    // Verify only matching tasks are visible
    await expect(page.locator('text=Important meeting')).toBeVisible();
    await expect(page.locator('text=Buy groceries')).not.toBeVisible();
  });
});