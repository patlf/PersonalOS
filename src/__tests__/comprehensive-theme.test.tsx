import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

// Mock setTimeout for theme transitions
global.setTimeout = vi.fn((cb, delay) => {
  if (delay === 300) {
    setTimeout(() => cb(), 0);
  } else {
    cb();
  }
  return 0 as any;
});

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

// Test component that uses theme context
function ThemeTestComponent() {
  const { theme, resolvedTheme, systemTheme, setTheme, isLoading, isChanging } = useTheme();
  
  return (
    <div data-testid="theme-test-component">
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="system-theme">{systemTheme}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="is-changing">{isChanging.toString()}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        Set System
      </button>
    </div>
  );
}

// Comprehensive UI test component
function ComprehensiveUITest() {
  return (
    <div className="p-4 space-y-4 bg-background text-foreground">
      <ThemeToggle showLabel />
      <div className="grid gap-4">
        <Button variant="default">Default Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
      <Card className="p-4 border bg-card text-card-foreground">
        <h3 className="text-lg font-semibold text-foreground">Card Title</h3>
        <p className="text-muted-foreground">Muted text content</p>
        <p className="text-accent-foreground bg-accent p-2 rounded">Accent content</p>
      </Card>
      <div className="border rounded p-4 bg-secondary text-secondary-foreground">
        <p>Secondary background content</p>
      </div>
    </div>
  );
}

describe('Comprehensive Theme Tests', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Switching Functionality', () => {
    it('should initialize with system theme by default', async () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });
    });

    it('should switch to light theme correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setLightButton = await screen.findByTestId('set-light');
      await user.click(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });

    it('should switch to dark theme correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
    });

    it('should handle system theme changes dynamically', async () => {
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

      // Simulate system theme change to dark
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should apply smooth transitions during theme changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
      
      await waitFor(() => {
        expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('theme-transition');
      });
    });

    it('should prevent duplicate theme changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      const setDarkButton = screen.getByTestId('set-dark');
      await user.click(setDarkButton);

      // Should not trigger additional storage calls for same theme
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('theme', 'dark');
    });

    it('should dispatch custom theme change events', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'themechange',
            detail: { theme: 'dark' }
          })
        );
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should restore theme from localStorage on initialization', async () => {
      mockLocalStorage.setItem('theme', 'dark');
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should persist theme changes to localStorage', async () => {
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
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });

    it('should validate stored theme values', async () => {
      mockLocalStorage.setItem('theme', 'invalid-theme');
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });
  });

  describe('System Theme Detection', () => {
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

    it('should handle matchMedia errors gracefully', async () => {
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

    it('should cleanup system theme listeners on unmount', async () => {
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

    it('should not listen for system changes when enableSystem is false', async () => {
      render(
        <ThemeProvider enableSystem={false}>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });

      expect(mockMediaQueryList.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Changing States', () => {
    it('should show loading state during initialization', async () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Initially should be loading
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should show changing state during theme transitions', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      const setDarkButton = screen.getByTestId('set-dark');
      await user.click(setDarkButton);

      // Should briefly show changing state
      expect(screen.getByTestId('is-changing')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-changing')).toHaveTextContent('false');
      });
    });
  });

  describe('SSR Compatibility', () => {
    it('should handle server-side rendering', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        render(
          <ThemeProvider>
            <ThemeTestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      global.window = originalWindow;
    });

    it('should prevent hydration mismatches', async () => {
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Should initialize with consistent state
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });
  });

  describe('Visual Consistency', () => {
    it('should apply consistent theme classes across components', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ComprehensiveUITest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });

    it('should maintain visual consistency in dark theme', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ComprehensiveUITest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument();
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
    });

    it('should handle theme toggle component integration', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ComprehensiveUITest />
        </ThemeProvider>
      );

      const themeToggle = await screen.findByRole('button', { name: /toggle theme/i });
      await user.click(themeToggle);

      const darkOption = await screen.findByText('Dark');
      await user.click(darkOption);

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument();
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });
  });

  describe('Error Handling', () => {
    it('should handle theme provider context errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<ThemeTestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });

    it('should handle document access errors', async () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      expect(() => {
        render(
          <ThemeProvider>
            <ThemeTestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      global.document = originalDocument;
    });

    it('should handle requestAnimationFrame errors', async () => {
      global.requestAnimationFrame = vi.fn(() => {
        throw new Error('requestAnimationFrame error');
      });

      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      
      expect(() => user.click(setDarkButton)).not.toThrow();
    });
  });
});