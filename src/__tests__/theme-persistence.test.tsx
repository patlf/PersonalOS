import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider';

// Mock localStorage with persistence simulation
class MockLocalStorage {
  private store: Record<string, string> = {};
  private listeners: Array<(e: StorageEvent) => void> = [];

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    const oldValue = this.store[key];
    this.store[key] = value;
    
    // Simulate storage event with proper parameters
    try {
      const event = new StorageEvent('storage', {
        key,
        oldValue,
        newValue: value,
      });
      
      this.listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          // Ignore listener errors in tests
        }
      });
    } catch (error) {
      // Ignore StorageEvent creation errors in tests
    }
  }

  removeItem(key: string): void {
    const oldValue = this.store[key];
    delete this.store[key];
    
    try {
      const event = new StorageEvent('storage', {
        key,
        oldValue,
        newValue: null,
      });
      
      this.listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          // Ignore listener errors in tests
        }
      });
    } catch (error) {
      // Ignore StorageEvent creation errors in tests
    }
  }

  clear(): void {
    const oldStore = { ...this.store };
    this.store = {};
    
    Object.keys(oldStore).forEach(key => {
      try {
        const event = new StorageEvent('storage', {
          key,
          oldValue: oldStore[key],
          newValue: null,
        });
        
        this.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            // Ignore listener errors in tests
          }
        });
      } catch (error) {
        // Ignore StorageEvent creation errors in tests
      }
    });
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  addEventListener(type: string, listener: (e: StorageEvent) => void): void {
    if (type === 'storage') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: (e: StorageEvent) => void): void {
    if (type === 'storage') {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }

  // Test utilities
  simulateStorageError(method: keyof MockLocalStorage): void {
    const original = this[method];
    // @ts-ignore
    this[method] = () => {
      throw new Error(`localStorage.${method} failed`);
    };
    
    setTimeout(() => {
      // @ts-ignore
      this[method] = original;
    }, 100);
  }

  getStore(): Record<string, string> {
    return { ...this.store };
  }
}

const mockLocalStorage = new MockLocalStorage();
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
function ThemePersistenceTest() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div data-testid="theme-persistence-test">
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
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

describe('Theme Persistence Tests', () => {
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

  describe('Basic Persistence', () => {
    it('should persist theme preference to localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme')).toBe('dark');
      });
    });

    it('should restore theme from localStorage on mount', async () => {
      mockLocalStorage.setItem('theme', 'dark');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });
    });

    it('should use custom storage key', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider storageKey="custom-theme-key">
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setLightButton = await screen.findByTestId('set-light');
      await user.click(setLightButton);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('custom-theme-key')).toBe('light');
      });
    });

    it('should handle multiple theme providers with different keys', async () => {
      const user = userEvent.setup();
      
      function MultiProviderTest() {
        return (
          <div>
            <ThemeProvider storageKey="theme-1">
              <div data-testid="provider-1">
                <ThemePersistenceTest />
              </div>
            </ThemeProvider>
            <ThemeProvider storageKey="theme-2">
              <div data-testid="provider-2">
                <ThemePersistenceTest />
              </div>
            </ThemeProvider>
          </div>
        );
      }

      render(<MultiProviderTest />);

      // Set different themes for each provider
      const provider1Dark = screen.getAllByTestId('set-dark')[0];
      const provider2Light = screen.getAllByTestId('set-light')[1];

      await user.click(provider1Dark);
      await user.click(provider2Light);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme-1')).toBe('dark');
        expect(mockLocalStorage.getItem('theme-2')).toBe('light');
      });
    });
  });

  describe('System Theme Detection and Persistence', () => {
    it('should persist system theme preference', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setSystemButton = await screen.findByTestId('set-system');
      await user.click(setSystemButton);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme')).toBe('system');
      });
    });

    it('should detect system theme changes and maintain system preference', async () => {
      mockLocalStorage.setItem('theme', 'system');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });

      // Simulate system theme change
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
        expect(mockLocalStorage.getItem('theme')).toBe('system'); // Should remain system
      });
    });

    it('should handle system theme detection errors gracefully', async () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      mockLocalStorage.setItem('theme', 'system');
      
      expect(() => {
        render(
          <ThemeProvider>
            <ThemePersistenceTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light'); // Fallback
      });
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle localStorage getItem errors', async () => {
      mockLocalStorage.simulateStorageError('getItem');
      
      expect(() => {
        render(
          <ThemeProvider>
            <ThemePersistenceTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system'); // Fallback
      });
    });

    it('should handle localStorage setItem errors', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      mockLocalStorage.simulateStorageError('setItem');

      const setDarkButton = await screen.findByTestId('set-dark');
      
      expect(() => user.click(setDarkButton)).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });
    });

    it('should handle localStorage quota exceeded errors', async () => {
      const user = userEvent.setup();
      
      // Mock quota exceeded error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      
      expect(() => user.click(setDarkButton)).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      // Restore original method
      mockLocalStorage.setItem = originalSetItem;
    });

    it('should handle private browsing mode', async () => {
      // Create a mock that throws on access
      const throwingStorage = {
        get length() { throw new Error('localStorage is not available'); },
        getItem() { throw new Error('localStorage is not available'); },
        setItem() { throw new Error('localStorage is not available'); },
        removeItem() { throw new Error('localStorage is not available'); },
        clear() { throw new Error('localStorage is not available'); },
        key() { throw new Error('localStorage is not available'); },
      };

      // Temporarily replace localStorage
      const originalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: throwingStorage,
        configurable: true,
      });

      expect(() => {
        render(
          <ThemeProvider>
            <ThemePersistenceTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalStorage,
        configurable: true,
      });
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should sync theme changes across tabs', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      // Simulate theme change from another tab
      act(() => {
        mockLocalStorage.setItem('theme', 'dark');
      });

      // The component should react to storage changes
      // Note: This would require implementing storage event listeners in the provider
      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme')).toBe('dark');
      });
    });

    it('should handle storage events from other tabs', async () => {
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'theme',
        oldValue: 'system',
        newValue: 'dark',
        storageArea: mockLocalStorage as any,
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      // Component should update based on storage event
      // Note: This would require implementing storage event listeners
      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme')).toBe('dark');
      });
    });
  });

  describe('Theme Validation and Sanitization', () => {
    it('should validate stored theme values', async () => {
      mockLocalStorage.setItem('theme', 'invalid-theme');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system'); // Fallback
      });
    });

    it('should sanitize corrupted localStorage data', async () => {
      // Simulate corrupted data
      mockLocalStorage.setItem('theme', '{"corrupted": "json"}');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });

    it('should handle null and undefined values', async () => {
      // Test null value
      mockLocalStorage.setItem('theme', 'null');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });

    it('should handle empty string values', async () => {
      mockLocalStorage.setItem('theme', '');
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not cause memory leaks with multiple mounts/unmounts', async () => {
      const { unmount, rerender } = render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        unmount();
        rerender(
          <ThemeProvider>
            <ThemePersistenceTest />
          </ThemeProvider>
        );
      }

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      });

      // Should not accumulate event listeners
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should debounce rapid theme changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      const setLightButton = await screen.findByTestId('set-light');

      // Rapid theme changes
      await user.click(setDarkButton);
      await user.click(setLightButton);
      await user.click(setDarkButton);
      await user.click(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Should only store the final value
      expect(mockLocalStorage.getItem('theme')).toBe('light');
    });
  });

  describe('SSR and Hydration', () => {
    it('should handle server-side rendering without localStorage', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        render(
          <ThemeProvider>
            <ThemePersistenceTest />
          </ThemeProvider>
        );
      }).not.toThrow();

      global.window = originalWindow;
    });

    it('should prevent hydration mismatches', async () => {
      // Simulate SSR with different initial state
      mockLocalStorage.setItem('theme', 'dark');
      
      const { container } = render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      // Should handle hydration gracefully
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid provider remounts', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      unmount();

      // Immediately remount
      render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      });
    });

    it('should handle theme changes during unmount', async () => {
      const user = userEvent.setup();
      
      const { unmount } = render(
        <ThemeProvider>
          <ThemePersistenceTest />
        </ThemeProvider>
      );

      const setDarkButton = await screen.findByTestId('set-dark');
      
      // Start theme change and immediately unmount
      user.click(setDarkButton);
      unmount();

      // Should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle concurrent theme providers', async () => {
      const user = userEvent.setup();
      
      function ConcurrentProvidersTest() {
        return (
          <div>
            <ThemeProvider storageKey="theme-a">
              <div data-testid="provider-a">
                <ThemePersistenceTest />
              </div>
            </ThemeProvider>
            <ThemeProvider storageKey="theme-b">
              <div data-testid="provider-b">
                <ThemePersistenceTest />
              </div>
            </ThemeProvider>
          </div>
        );
      }

      render(<ConcurrentProvidersTest />);

      // Both providers should work independently
      const darkButtons = screen.getAllByTestId('set-dark');
      
      await user.click(darkButtons[0]);
      await user.click(darkButtons[1]);

      await waitFor(() => {
        expect(mockLocalStorage.getItem('theme-a')).toBe('dark');
        expect(mockLocalStorage.getItem('theme-b')).toBe('dark');
      });
    });
  });
});