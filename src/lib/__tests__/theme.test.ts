import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getSystemTheme, 
  resolveTheme, 
  applyTheme, 
  getStoredTheme, 
  setStoredTheme,
  getThemePreference,
  createThemeMediaQuery
} from '../theme';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

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

describe('Theme utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should return "dark" when system prefers dark mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
      });

      const result = getSystemTheme();
      expect(result).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return "light" when system prefers light mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
      });

      const result = getSystemTheme();
      expect(result).toBe('light');
    });

    it('should return "light" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = getSystemTheme();
      expect(result).toBe('light');

      global.window = originalWindow;
    });
  });

  describe('resolveTheme', () => {
    it('should return system theme when theme is "system"', () => {
      expect(resolveTheme('system', 'dark')).toBe('dark');
      expect(resolveTheme('system', 'light')).toBe('light');
    });

    it('should return the theme itself when not "system"', () => {
      expect(resolveTheme('dark', 'light')).toBe('dark');
      expect(resolveTheme('light', 'dark')).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should add "dark" class and set color-scheme when resolved theme is dark', () => {
      applyTheme('dark');
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
    });

    it('should remove "dark" class and set color-scheme when resolved theme is light', () => {
      applyTheme('light');
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('light');
    });
  });

  describe('getStoredTheme', () => {
    it('should return stored theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      const result = getStoredTheme();
      expect(result).toBe('dark');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should return "system" when no theme is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = getStoredTheme();
      expect(result).toBe('system');
    });

    it('should return "system" for invalid stored values', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');
      
      const result = getStoredTheme();
      expect(result).toBe('system');
    });

    it('should return "system" when localStorage throws error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const result = getStoredTheme();
      expect(result).toBe('system');
    });

    it('should return "system" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = getStoredTheme();
      expect(result).toBe('system');

      global.window = originalWindow;
    });
  });

  describe('setStoredTheme', () => {
    it('should store theme in localStorage', () => {
      setStoredTheme('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should not throw when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => setStoredTheme('dark')).not.toThrow();
    });

    it('should not throw when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => setStoredTheme('dark')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('getThemePreference', () => {
    it('should return both theme and system theme', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      mockMatchMedia.mockReturnValue({ matches: true });

      const result = getThemePreference();
      expect(result).toEqual({
        theme: 'dark',
        systemTheme: 'dark'
      });
    });

    it('should handle system theme fallback', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({ matches: false });

      const result = getThemePreference();
      expect(result).toEqual({
        theme: 'system',
        systemTheme: 'light'
      });
    });
  });

  describe('createThemeMediaQuery', () => {
    it('should return media query when window is available', () => {
      const mockMediaQuery = { matches: false };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const result = createThemeMediaQuery();
      expect(result).toBe(mockMediaQuery);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = createThemeMediaQuery();
      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });
});