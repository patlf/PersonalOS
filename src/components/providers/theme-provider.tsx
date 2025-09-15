"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme, ThemeConfig, getSystemTheme, resolveTheme, applyTheme, getStoredTheme, setStoredTheme } from '@/lib/theme';

interface ThemeContextType extends ThemeConfig {
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
  isChanging: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'theme',
  enableSystem = true
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  // Initialize theme from storage and system preference
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Get stored theme and system preference synchronously
      const storedTheme = getStoredTheme(storageKey);
      const currentSystemTheme = getSystemTheme();
      
      // Update state
      setThemeState(storedTheme);
      setSystemTheme(currentSystemTheme);
      
      // Apply initial theme
      const resolved = resolveTheme(storedTheme, currentSystemTheme);
      applyTheme(resolved);
      
      // Set mounted and loading state
      setMounted(true);
      setIsLoading(false);
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      // Fallback to default theme
      setThemeState(defaultTheme);
      setSystemTheme('light');
      applyTheme(defaultTheme === 'system' ? 'light' : defaultTheme);
      setMounted(true);
      setIsLoading(false);
    }
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || !enableSystem) return;

    let mediaQuery: MediaQueryList | null = null;
    
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setSystemTheme(newSystemTheme);
        
        // If using system theme, apply the new system preference with smooth transition
        if (theme === 'system') {
          setIsChanging(true);
          
          // Add transition class before applying theme
          document.documentElement.classList.add('theme-transition');
          applyTheme(newSystemTheme);
          
          // Remove transition class and loading state after animation completes
          setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
            setIsChanging(false);
          }, 300);
        }
      };

      // Use the newer addEventListener API
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        if (mediaQuery) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        }
      };
    } catch (error) {
      console.warn('Failed to setup system theme listener:', error);
    }
  }, [theme, mounted, enableSystem]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme === theme) return;
    
    try {
      setIsChanging(true);
      setThemeState(newTheme);
      setStoredTheme(newTheme, storageKey);
      
      const resolved = resolveTheme(newTheme, systemTheme);
      
      // Add smooth transition for theme changes
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('theme-transition');
        applyTheme(resolved);
        
        // Remove transition class and loading state after animation completes
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
          setIsChanging(false);
        }, 300);
      } else {
        setIsChanging(false);
      }
    } catch (error) {
      console.warn('Failed to set theme:', error);
      setIsChanging(false);
    }
  }, [theme, systemTheme, storageKey]);

  const resolvedTheme = resolveTheme(theme, systemTheme);

  const value: ThemeContextType = {
    theme,
    systemTheme,
    resolvedTheme,
    setTheme,
    isLoading,
    isChanging,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}