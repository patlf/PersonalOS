import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSystemTheme, resolveTheme, applyTheme, getStoredTheme, setStoredTheme, isValidTheme } from '@/lib/theme';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
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

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

describe('Comprehensive Theme Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Theme Switching Functionality', () => {
    it('should detect system theme correctly', () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      expect(getSystemTheme()).toBe('light');

      mockMatchMedia.mockReturnValue({ matches: true });
      expect(getSystemTheme()).toBe('dark');
    });

    it('should resolve theme preferences correctly', () => {
      expect(resolveTheme('light', 'dark')).toBe('light');
      expect(resolveTheme('dark', 'light')).toBe('dark');
      expect(resolveTheme('system', 'light')).toBe('light');
      expect(resolveTheme('system', 'dark')).toBe('dark');
    });

    it('should apply theme to document', () => {
      applyTheme('dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');

      applyTheme('light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });

    it('should dispatch theme change events', () => {
      applyTheme('dark');
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themechange',
          detail: { theme: 'dark' }
        })
      );
    });
  });

  describe('Theme Persistence', () => {
    it('should store theme in localStorage', () => {
      setStoredTheme('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

      setStoredTheme('light', 'custom-key');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-key', 'light');
    });

    it('should retrieve theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      expect(getStoredTheme()).toBe('dark');

      mockLocalStorage.getItem.mockReturnValue('light');
      expect(getStoredTheme('custom-key')).toBe('light');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      expect(getStoredTheme()).toBe('system');

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      expect(() => setStoredTheme('dark')).not.toThrow();
    });

    it('should validate stored theme values', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');
      expect(getStoredTheme()).toBe('system');

      mockLocalStorage.getItem.mockReturnValue('');
      expect(getStoredTheme()).toBe('system');

      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getStoredTheme()).toBe('system');
    });
  });

  describe('System Theme Detection', () => {
    it('should handle matchMedia errors gracefully', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });
      expect(getSystemTheme()).toBe('light');
    });

    it('should return light theme when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(getSystemTheme()).toBe('light');
      global.window = originalWindow;
    });
  });

  describe('Theme Validation', () => {
    it('should validate theme values correctly', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('system')).toBe(true);
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
    });

    it('should not store invalid theme values', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      setStoredTheme('invalid-theme' as any);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Invalid theme value:', 'invalid-theme');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle document access errors', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;
      
      expect(() => applyTheme('dark')).not.toThrow();
      
      global.document = originalDocument;
    });

    it('should handle requestAnimationFrame errors', () => {
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = vi.fn(() => {
        throw new Error('requestAnimationFrame error');
      });
      
      // The function should throw since requestAnimationFrame failed
      expect(() => applyTheme('dark')).toThrow('requestAnimationFrame error');
      
      global.requestAnimationFrame = originalRAF;
    });
  });

  describe('Visual Regression Prevention', () => {
    beforeEach(() => {
      // Reset requestAnimationFrame mock for these tests
      global.requestAnimationFrame = vi.fn((cb) => {
        cb(0);
        return 0;
      });
    });

    it('should maintain consistent theme application', () => {
      // Test multiple theme switches to ensure consistency
      applyTheme('light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');

      applyTheme('dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');

      applyTheme('light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });

    it('should ensure theme changes are atomic', () => {
      applyTheme('dark');
      
      // Both class and colorScheme should be updated together
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  describe('Performance Considerations', () => {
    beforeEach(() => {
      // Reset requestAnimationFrame mock for these tests
      global.requestAnimationFrame = vi.fn((cb) => {
        cb(0);
        return 0;
      });
    });

    it('should use requestAnimationFrame for smooth transitions', () => {
      applyTheme('dark');
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle rapid theme changes efficiently', () => {
      // Simulate rapid theme changes
      applyTheme('light');
      applyTheme('dark');
      applyTheme('light');
      applyTheme('dark');

      // Should handle all changes without errors
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
  });
});