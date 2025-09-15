export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeState extends ThemeConfig {
  isLoading: boolean;
  isChanging: boolean;
}

/**
 * Get the current system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('Failed to get system theme:', error);
    return 'light';
  }
}

/**
 * Resolve theme preference to actual theme
 */
export function resolveTheme(theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' {
  return theme === 'system' ? systemTheme : theme;
}

/**
 * Apply theme to document with enhanced error handling
 */
export function applyTheme(resolvedTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Use requestAnimationFrame for smoother transitions
  requestAnimationFrame(() => {
    try {
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
      
      // Dispatch custom event for theme change
      const event = new CustomEvent('themechange', {
        detail: { theme: resolvedTheme }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  });
}

/**
 * Get stored theme preference with enhanced validation
 */
export function getStoredTheme(storageKey: string = 'theme'): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const stored = localStorage.getItem(storageKey);
    
    // Validate stored theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
    
    return 'system';
  } catch (error) {
    console.warn('Failed to get stored theme:', error);
    return 'system';
  }
}

/**
 * Store theme preference with enhanced error handling
 */
export function setStoredTheme(theme: Theme, storageKey: string = 'theme') {
  if (typeof window === 'undefined') return;
  
  try {
    // Validate theme before storing
    if (!['light', 'dark', 'system'].includes(theme)) {
      console.warn('Invalid theme value:', theme);
      return;
    }
    
    localStorage.setItem(storageKey, theme);
  } catch (error) {
    console.warn('Failed to store theme:', error);
  }
}

/**
 * Get complete theme preference state
 */
export function getThemePreference(storageKey?: string): { theme: Theme; systemTheme: 'light' | 'dark' } {
  const theme = getStoredTheme(storageKey);
  const systemTheme = getSystemTheme();
  return { theme, systemTheme };
}

/**
 * Create media query for system theme detection
 */
export function createThemeMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return window.matchMedia('(prefers-color-scheme: dark)');
  } catch (error) {
    console.warn('Failed to create theme media query:', error);
    return null;
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    console.warn('Failed to check reduced motion preference:', error);
    return false;
  }
}

/**
 * Validate theme value
 */
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && ['light', 'dark', 'system'].includes(value);
}

/**
 * Get theme with fallback
 */
export function getThemeWithFallback(theme: unknown, fallback: Theme = 'system'): Theme {
  return isValidTheme(theme) ? theme : fallback;
}