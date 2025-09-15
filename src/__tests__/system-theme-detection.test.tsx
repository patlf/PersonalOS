import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider';
import { getSystemTheme, createThemeMediaQuery, prefersReducedMotion } from '@/lib/theme';

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

// Advanced matchMedia mock
class MockMediaQueryList {
  matches: boolean;
  media: string;
  private listeners: Array<(event: MediaQueryListEvent) => void> = [];

  constructor(query: string, matches: boolean = false) {
    this.media = query;
    this.matches = matches;
  }

  addEventListener(type: string, listener: (event: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }

  // Legacy support
  addListener(listener: (event: MediaQueryListEvent) => void): void {
    this.addEventListener('change', listener);
  }

  removeListener(listener: (event: MediaQueryListEvent) => void): void {
    this.removeEventListener('change', listener);
  }

  dispatchEvent(event: MediaQueryListEvent): boolean {
    this.listeners.forEach(listener => listener(event));
    return true;
  }

  // Test utility to simulate media query changes
  simulateChange(matches: boolean): void {
    this.matches = matches;
    const event = new MediaQueryListEvent('change', {
      matches,
      media: this.media,
    });
    this.dispatchEvent(event);
  }

  // Test utility to get listener count
  getListenerCount(): number {
    return this.listeners.length;
  }
}

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

// Mock setTimeout for transitions
global.setTimeout = vi.fn((cb, delay) => {
  if (delay === 300) {
    setTimeout(() => cb(), 0);
  } else {
    cb();
  }
  return 0 as any;
});

// Test component
function SystemThemeTest() {
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  
  return (
    <div data-testid="system-theme-test">
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="system-theme">{systemTheme}</div>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        System
      </button>
    </div>
  );
}

describe('System Theme Detection Tests', () => {
  let darkModeQuery: MockMediaQueryList;
  let reducedMotionQuery: MockMediaQueryList;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    
    darkModeQuery = new MockMediaQueryList('(prefers-color-scheme: dark)', false);
    reducedMotionQuery = new MockMediaQueryList('(prefers-reduced-motion: reduce)', false);
    
    mockMatchMedia.mockImplementation((query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return darkModeQuery;
      }
      if (query === '(prefers-reduced-motion: reduce)') {
        return reducedMotionQuery;
      }
      return new MockMediaQueryList(query);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic System Theme Detection', () => {
    it('should detect light system theme by default', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });
    });

    it('should detect dark system theme', async () => {
      darkModeQuery.matches = true;
      
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });

    it('should use getSystemTheme utility correctly', () => {
      darkModeQuery.matches = false;
      expect(getSystemTheme()).toBe('light');
      
      darkModeQuery.matches = true;
      expect(getSystemTheme()).toBe('dark');
    });

    it('should handle matchMedia not supported', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      expect(getSystemTheme()).toBe('light'); // Fallback
    });
  });

  describe('Dynamic System Theme Changes', () => {
    it('should respond to system theme changes when using system theme', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });

      // Simulate system theme change to dark
      act(() => {
        darkModeQuery.simulateChange(true);
      });

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should not respond to system changes when using explicit theme', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="light">
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Simulate system theme change
      act(() => {
        darkModeQuery.simulateChange(true);
      });

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light'); // Should remain light
      });
    });

    it('should apply smooth transitions during system theme changes', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });

      // Simulate system theme change
      act(() => {
        darkModeQuery.simulateChange(true);
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
      
      await waitFor(() => {
        expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('theme-transition');
      });
    });

    it('should handle rapid system theme changes', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Rapid changes
      act(() => {
        darkModeQuery.simulateChange(true);
        darkModeQuery.simulateChange(false);
        darkModeQuery.simulateChange(true);
      });

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });
  });

  describe('Media Query Management', () => {
    it('should create media query correctly', () => {
      const mediaQuery = createThemeMediaQuery();
      expect(mediaQuery).toBe(darkModeQuery);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should handle createThemeMediaQuery errors', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia failed');
      });

      const mediaQuery = createThemeMediaQuery();
      expect(mediaQuery).toBeNull();
    });

    it('should add event listeners correctly', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(darkModeQuery.getListenerCount()).toBe(1);
      });
    });

    it('should remove event listeners on unmount', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(darkModeQuery.getListenerCount()).toBe(1);
      });

      unmount();

      expect(darkModeQuery.getListenerCount()).toBe(0);
    });

    it('should handle legacy addListener/removeListener API', async () => {
      // Mock legacy API
      const legacyQuery = {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };

      mockMatchMedia.mockReturnValue(legacyQuery);

      const { unmount } = render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(legacyQuery.addListener).toHaveBeenCalled();
      });

      unmount();

      expect(legacyQuery.removeListener).toHaveBeenCalled();
    });
  });

  describe('Reduced Motion Detection', () => {
    it('should detect reduced motion preference', () => {
      reducedMotionQuery.matches = false;
      expect(prefersReducedMotion()).toBe(false);
      
      reducedMotionQuery.matches = true;
      expect(prefersReducedMotion()).toBe(true);
    });

    it('should handle reduced motion detection errors', () => {
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          throw new Error('matchMedia failed');
        }
        return darkModeQuery;
      });

      expect(prefersReducedMotion()).toBe(false); // Fallback
    });

    it('should respect reduced motion in theme transitions', async () => {
      reducedMotionQuery.matches = true;
      
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Simulate system theme change
      act(() => {
        darkModeQuery.simulateChange(true);
      });

      // Should still apply theme but potentially with different transition handling
      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });
  });

  describe('Multiple Media Query Support', () => {
    it('should handle multiple media queries simultaneously', async () => {
      const contrastQuery = new MockMediaQueryList('(prefers-contrast: high)', false);
      
      mockMatchMedia.mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') return darkModeQuery;
        if (query === '(prefers-reduced-motion: reduce)') return reducedMotionQuery;
        if (query === '(prefers-contrast: high)') return contrastQuery;
        return new MockMediaQueryList(query);
      });

      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Simulate multiple preference changes
      act(() => {
        darkModeQuery.simulateChange(true);
        reducedMotionQuery.simulateChange(true);
        contrastQuery.simulateChange(true);
      });

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });

    it('should handle media query listener errors', async () => {
      const errorQuery = {
        matches: false,
        addEventListener: vi.fn(() => {
          throw new Error('addEventListener failed');
        }),
        removeEventListener: vi.fn(),
      };

      mockMatchMedia.mockReturnValue(errorQuery);

      expect(() => {
        render(
          <ThemeProvider>
            <SystemThemeTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle browsers without matchMedia', async () => {
      // @ts-ignore
      delete window.matchMedia;

      expect(() => {
        render(
          <ThemeProvider>
            <SystemThemeTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });
    });

    it('should handle browsers with partial matchMedia support', async () => {
      const partialQuery = {
        matches: false,
        // Missing addEventListener/removeEventListener
      };

      mockMatchMedia.mockReturnValue(partialQuery);

      expect(() => {
        render(
          <ThemeProvider>
            <SystemThemeTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });
    });

    it('should handle SSR environment', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(getSystemTheme()).toBe('light');
      expect(createThemeMediaQuery()).toBeNull();
      expect(prefersReducedMotion()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple providers', async () => {
      const providers = Array.from({ length: 5 }, (_, i) => (
        <ThemeProvider key={i} storageKey={`theme-${i}`}>
          <SystemThemeTest />
        </ThemeProvider>
      ));

      const { unmount } = render(<div>{providers}</div>);

      await waitFor(() => {
        expect(darkModeQuery.getListenerCount()).toBe(5);
      });

      unmount();

      expect(darkModeQuery.getListenerCount()).toBe(0);
    });

    it('should handle provider remounting without listener accumulation', async () => {
      const { unmount, rerender } = render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(darkModeQuery.getListenerCount()).toBe(1);
      });

      unmount();
      expect(darkModeQuery.getListenerCount()).toBe(0);

      rerender(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(darkModeQuery.getListenerCount()).toBe(1);
      });
    });

    it('should debounce system theme changes', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Rapid system theme changes
      act(() => {
        for (let i = 0; i < 10; i++) {
          darkModeQuery.simulateChange(i % 2 === 0);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });

      // Should not cause excessive DOM updates
      expect(mockDocumentElement.classList.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle system theme detection during component unmount', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Trigger system change during unmount
      unmount();
      
      act(() => {
        darkModeQuery.simulateChange(true);
      });

      // Should not cause errors
      expect(() => darkModeQuery.simulateChange(false)).not.toThrow();
    });

    it('should handle malformed media query responses', async () => {
      const malformedQuery = {
        matches: 'not-a-boolean' as any,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      mockMatchMedia.mockReturnValue(malformedQuery);

      expect(() => {
        render(
          <ThemeProvider>
            <SystemThemeTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
      });
    });

    it('should handle concurrent system theme changes', async () => {
      render(
        <ThemeProvider>
          <SystemThemeTest />
        </ThemeProvider>
      );

      // Simulate concurrent changes from multiple sources
      const promises = Array.from({ length: 5 }, (_, i) =>
        new Promise<void>(resolve => {
          setTimeout(() => {
            act(() => {
              darkModeQuery.simulateChange(i % 2 === 0);
            });
            resolve();
          }, i * 10);
        })
      );

      await Promise.all(promises);

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toBeInTheDocument();
      });
    });
  });
});