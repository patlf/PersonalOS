"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsOptions {
  enableNavigation?: boolean;
  enableMobileMenuToggle?: boolean;
  enableTaskShortcuts?: boolean;
  enableWeekNavigation?: boolean;
  onQuickTaskCreate?: () => void;
  onTogglePastDays?: () => void;
  onWeekChange?: (direction: 'prev' | 'next') => void;
  onGlobalSearch?: () => void;
  onMobileMenuToggle?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { 
    enableNavigation = true, 
    enableMobileMenuToggle = true,
    enableTaskShortcuts = false,
    enableWeekNavigation = false,
    onQuickTaskCreate,
    onTogglePastDays,
    onWeekChange,
    onGlobalSearch,
    onMobileMenuToggle
  } = options;
  const router = useRouter();
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInInputField = target instanceof HTMLInputElement || 
                            target instanceof HTMLTextAreaElement || 
                            target.contentEditable === 'true';
      const isModifierPressed = event.metaKey || event.ctrlKey;
      
      // Store the last focused element for focus management
      if (document.activeElement && document.activeElement !== document.body) {
        lastFocusedElement.current = document.activeElement as HTMLElement;
      }

      // Task management shortcuts (with modifier keys)
      if (enableTaskShortcuts && isModifierPressed) {
        switch (event.key) {
          case 'k':
          case 'K':
            // Cmd/Ctrl + K for quick task creation
            event.preventDefault();
            onQuickTaskCreate?.();
            return;
          case 'p':
          case 'P':
            // Cmd/Ctrl + P for toggling past days
            event.preventDefault();
            onTogglePastDays?.();
            return;
          case '/':
            // Cmd/Ctrl + / for global search
            event.preventDefault();
            onGlobalSearch?.();
            return;
        }
      }

      // Week navigation with arrow keys (only when not in input fields)
      if (enableWeekNavigation && !isInInputField && !isModifierPressed) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            onWeekChange?.('prev');
            return;
          case 'ArrowRight':
            event.preventDefault();
            onWeekChange?.('next');
            return;
        }
      }

      // Escape key handling for focus management
      if (event.key === 'Escape' && !isModifierPressed) {
        // If we're in an input field, blur it and return focus to the last focused element
        if (isInInputField) {
          event.preventDefault();
          (target as HTMLInputElement | HTMLTextAreaElement).blur();
          if (lastFocusedElement.current && lastFocusedElement.current !== target) {
            lastFocusedElement.current.focus();
          }
          return;
        }
      }
      
      // Navigation shortcuts work without modifier keys
      if (enableNavigation && !isInInputField) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            router.push('/ai');
            return;
          case '2':
            event.preventDefault();
            router.push('/tasks');
            return;
          case '3':
            event.preventDefault();
            router.push('/calendar');
            return;
          case '4':
            event.preventDefault();
            router.push('/mail');
            return;
        }
      }

      if (!isModifierPressed) return;

      // Mobile menu toggle: Cmd/Ctrl + M (changed from B to M for mobile menu)
      if (enableMobileMenuToggle && onMobileMenuToggle && event.key === 'm') {
        event.preventDefault();
        onMobileMenuToggle();
        return;
      }

      // Other modifier-based shortcuts can go here if needed
    };

    const handleFocusIn = (event: FocusEvent) => {
      // Track focus changes for better focus management
      const target = event.target as HTMLElement;
      if (target && target !== document.body) {
        lastFocusedElement.current = target;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focusin', handleFocusIn);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focusin', handleFocusIn);
    };
  }, [
    enableNavigation, 
    enableMobileMenuToggle, 
    enableTaskShortcuts, 
    enableWeekNavigation,
    router, 
    onMobileMenuToggle, 
    onQuickTaskCreate, 
    onTogglePastDays, 
    onWeekChange,
    onGlobalSearch
  ]);

  // Return utility functions for focus management
  return {
    restoreFocus: () => {
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    },
    setFocusedElement: (element: HTMLElement) => {
      lastFocusedElement.current = element;
    }
  };
}