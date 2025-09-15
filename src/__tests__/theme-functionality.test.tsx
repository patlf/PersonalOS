import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'system'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
  style: {
    colorScheme: '',
  },
};
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  cb(0);
  return 0;
});

// Mock setTimeout
global.setTimeout = vi.fn((cb) => {
  cb();
  return 0 as any;
});

// Test component
function ThemeTestComponent() {
  const { theme, resolvedTheme, systemTheme, setTheme, isLoading, isChanging } = useTheme();

  return (
    <div data-testid="theme-test">
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="system-theme">{systemTheme}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="is-changing">{isChanging.toString()}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        System
      </button>
    </div>
  );
}

describe('Theme Functionality Tests', () => {
  let mockMediaQueryList: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();

    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
  });

  describe('Theme Switching', () => {
    it('should switch to light theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setLightButton = await screen.findByTestId('set-light');
      await user.click(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });

    it('should switch to dark theme', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
    });

    it('should apply smooth transitions', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
    });
  });

  describe('Theme Persistence', () => {
    it('should restore theme from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should persist theme changes', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setLightButton = await screen.findByTestId('set-light');
      await user.click(setLightButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => {
        render(
          <ThemeProvider>
            <ThemeTestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('system');
      });
    });

    it('should validate stored theme values', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('system');
      });
    });
  });

  describe('System Theme Detection', () => {
    it('should detect light system theme', async () => {
      mockMediaQueryList.matches = false;

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });
    });

    it('should detect dark system theme', async () => {
      mockMediaQueryList.matches = true;

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });

    it('should handle matchMedia errors', async () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      expect(() => {
        render(
          <ThemeProvider>
            <ThemeTestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });
    });

    it('should setup system theme listeners', async () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
          'change',
          expect.any(Function)
        );
      });
    });

    it('should cleanup listeners on unmount', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', async () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Should eventually not be loading
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle theme provider context errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        render(<ThemeTestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should use custom storage key', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider storageKey="custom-theme">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-theme', 'dark');
    });

    it('should handle custom default theme', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });
  });
});