import { test, expect, Page } from '@playwright/test';

test.describe('Theme Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        .theme-transition {
          transition: none !important;
        }
      `
    });
  });

  async function setTheme(page: Page, theme: 'light' | 'dark' | 'system') {
    // Click theme toggle
    await page.locator('[data-testid="theme-toggle"]').click();
    
    // Select theme option
    await page.locator(`text=${theme.charAt(0).toUpperCase() + theme.slice(1)}`).click();
    
    // Wait for theme to be applied
    await page.waitForTimeout(100);
  }

  async function waitForThemeApplication(page: Page, expectedTheme: 'light' | 'dark') {
    // Wait for theme class to be applied to document
    await page.waitForFunction(
      (theme) => {
        const hasClass = document.documentElement.classList.contains('dark');
        return theme === 'dark' ? hasClass : !hasClass;
      },
      expectedTheme
    );
  }

  test.describe('Light Theme Visual Tests', () => {
    test('should match light theme homepage', async ({ page }) => {
      await page.goto('/');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      await expect(page).toHaveScreenshot('homepage-light.png');
    });

    test('should match light theme tasks page', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('tasks-light.png');
    });

    test('should match light theme calendar page', async ({ page }) => {
      await page.goto('/calendar');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('calendar-light.png');
    });

    test('should match light theme navigation', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const navigation = page.locator('[data-testid="top-navigation"]');
      await expect(navigation).toHaveScreenshot('navigation-light.png');
    });

    test('should match light theme buttons and controls', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      // Create a task to show various UI elements
      await page.locator('[data-testid="task-input"]').first().fill('Test task for visual regression');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      const taskCard = page.locator('text=Test task for visual regression').first();
      await expect(taskCard).toHaveScreenshot('task-card-light.png');
    });

    test('should match light theme modal dialogs', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      // Create and edit a task to show modal
      await page.locator('[data-testid="task-input"]').first().fill('Modal test task');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      await page.locator('text=Modal test task').first().click({ button: 'right' });
      await page.locator('text=Edit').click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveScreenshot('task-modal-light.png');
    });
  });

  test.describe('Dark Theme Visual Tests', () => {
    test('should match dark theme homepage', async ({ page }) => {
      await page.goto('/');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      await expect(page).toHaveScreenshot('homepage-dark.png');
    });

    test('should match dark theme tasks page', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('tasks-dark.png');
    });

    test('should match dark theme calendar page', async ({ page }) => {
      await page.goto('/calendar');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('calendar-dark.png');
    });

    test('should match dark theme navigation', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const navigation = page.locator('[data-testid="top-navigation"]');
      await expect(navigation).toHaveScreenshot('navigation-dark.png');
    });

    test('should match dark theme buttons and controls', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      // Create a task to show various UI elements
      await page.locator('[data-testid="task-input"]').first().fill('Dark theme test task');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      const taskCard = page.locator('text=Dark theme test task').first();
      await expect(taskCard).toHaveScreenshot('task-card-dark.png');
    });

    test('should match dark theme modal dialogs', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      // Create and edit a task to show modal
      await page.locator('[data-testid="task-input"]').first().fill('Dark modal test task');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      await page.locator('text=Dark modal test task').first().click({ button: 'right' });
      await page.locator('text=Edit').click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveScreenshot('task-modal-dark.png');
    });
  });

  test.describe('Theme Toggle Visual Tests', () => {
    test('should match theme toggle dropdown in light mode', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      await page.locator('[data-testid="theme-toggle"]').click();
      
      const dropdown = page.locator('[role="menu"]');
      await expect(dropdown).toHaveScreenshot('theme-toggle-dropdown-light.png');
    });

    test('should match theme toggle dropdown in dark mode', async ({ page }) => {
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      await page.locator('[data-testid="theme-toggle"]').click();
      
      const dropdown = page.locator('[role="menu"]');
      await expect(dropdown).toHaveScreenshot('theme-toggle-dropdown-dark.png');
    });

    test('should show correct theme toggle icon states', async ({ page }) => {
      await page.goto('/tasks');
      
      // Test light theme icon
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const lightToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(lightToggle).toHaveScreenshot('theme-toggle-light-icon.png');
      
      // Test dark theme icon
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const darkToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(darkToggle).toHaveScreenshot('theme-toggle-dark-icon.png');
    });
  });

  test.describe('Theme Transition Visual Tests', () => {
    test('should handle theme switching without visual glitches', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Start with light theme
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      // Take screenshot before transition
      await expect(page).toHaveScreenshot('before-theme-transition.png');
      
      // Switch to dark theme
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      // Take screenshot after transition
      await expect(page).toHaveScreenshot('after-theme-transition.png');
    });

    test('should maintain layout consistency across theme changes', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Create some content for layout testing
      await page.locator('[data-testid="task-input"]').first().fill('Layout consistency test');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      // Test light theme layout
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const lightLayout = page.locator('[data-testid="tasks-view"]');
      await expect(lightLayout).toHaveScreenshot('layout-light.png');
      
      // Test dark theme layout
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const darkLayout = page.locator('[data-testid="tasks-view"]');
      await expect(darkLayout).toHaveScreenshot('layout-dark.png');
    });
  });

  test.describe('Responsive Theme Visual Tests', () => {
    test('should match mobile light theme', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      await expect(page).toHaveScreenshot('mobile-light.png');
    });

    test('should match mobile dark theme', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      await expect(page).toHaveScreenshot('mobile-dark.png');
    });

    test('should match tablet light theme', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      await expect(page).toHaveScreenshot('tablet-light.png');
    });

    test('should match tablet dark theme', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      await expect(page).toHaveScreenshot('tablet-dark.png');
    });
  });

  test.describe('Component-Specific Theme Visual Tests', () => {
    test('should match form elements in both themes', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Light theme forms
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const lightForm = page.locator('form');
      await expect(lightForm).toHaveScreenshot('form-light.png');
      
      // Dark theme forms
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const darkForm = page.locator('form');
      await expect(darkForm).toHaveScreenshot('form-dark.png');
    });

    test('should match card components in both themes', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Create a task to show card component
      await page.locator('[data-testid="task-input"]').first().fill('Card theme test');
      await page.locator('[data-testid="task-input"]').first().press('Enter');
      
      // Light theme card
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const lightCard = page.locator('text=Card theme test').first().locator('..');
      await expect(lightCard).toHaveScreenshot('card-light.png');
      
      // Dark theme card
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const darkCard = page.locator('text=Card theme test').first().locator('..');
      await expect(darkCard).toHaveScreenshot('card-dark.png');
    });

    test('should match button variants in both themes', async ({ page }) => {
      await page.goto('/tasks');
      
      // Light theme buttons
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      const lightButtons = page.locator('[data-testid="task-actions"]').first();
      await expect(lightButtons).toHaveScreenshot('buttons-light.png');
      
      // Dark theme buttons
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      const darkButtons = page.locator('[data-testid="task-actions"]').first();
      await expect(darkButtons).toHaveScreenshot('buttons-dark.png');
    });
  });

  test.describe('Accessibility Visual Tests', () => {
    test('should maintain focus indicators in both themes', async ({ page }) => {
      await page.goto('/tasks');
      
      // Light theme focus
      await page.emulateMedia({ colorScheme: 'light' });
      await waitForThemeApplication(page, 'light');
      
      await page.locator('[data-testid="task-input"]').first().focus();
      const lightFocus = page.locator('[data-testid="task-input"]').first();
      await expect(lightFocus).toHaveScreenshot('focus-light.png');
      
      // Dark theme focus
      await page.emulateMedia({ colorScheme: 'dark' });
      await waitForThemeApplication(page, 'dark');
      
      await page.locator('[data-testid="task-input"]').first().focus();
      const darkFocus = page.locator('[data-testid="task-input"]').first();
      await expect(darkFocus).toHaveScreenshot('focus-dark.png');
    });

    test('should show proper contrast in both themes', async ({ page }) => {
      await page.goto('/tasks');
      
      // Test high contrast scenarios
      await page.emulateMedia({ colorScheme: 'light', forcedColors: 'active' });
      await waitForThemeApplication(page, 'light');
      
      await expect(page).toHaveScreenshot('high-contrast-light.png');
      
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
      await waitForThemeApplication(page, 'dark');
      
      await expect(page).toHaveScreenshot('high-contrast-dark.png');
    });
  });
});