import { create } from 'zustand';

/**
 * Navigation Store - Updated for Horizontal Navigation System
 * 
 * This store manages navigation state for the horizontal top navigation bar.
 * It supports:
 * - Active route tracking for proper highlighting
 * - Mobile menu state management
 * - Navigation visibility control
 * - Navigation collapsed state for responsive design
 * - Reset functionality for clean state management
 * - Backward compatibility with sidebar components (deprecated)
 */

interface NavigationState {
  activeRoute: string;
  isMobileMenuOpen: boolean;
  isNavigationVisible: boolean;
  isNavigationCollapsed: boolean;
  setActiveRoute: (route: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setNavigationVisibility: (visible: boolean) => void;
  setNavigationCollapsed: (collapsed: boolean) => void;
  resetNavigation: () => void;
  // Backward compatibility for sidebar (deprecated)
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  activeRoute: '/',
  isMobileMenuOpen: false,
  isNavigationVisible: true,
  isNavigationCollapsed: false,
  setActiveRoute: (route) => set({ activeRoute: route }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setNavigationVisibility: (visible) => set({ isNavigationVisible: visible }),
  setNavigationCollapsed: (collapsed) => set({ isNavigationCollapsed: collapsed }),
  resetNavigation: () => set({
    activeRoute: '/',
    isMobileMenuOpen: false,
    isNavigationVisible: true,
    isNavigationCollapsed: false,
  }),
  // Backward compatibility for sidebar (deprecated) - maps to isNavigationCollapsed
  setSidebarCollapsed: (collapsed) => set({ isNavigationCollapsed: collapsed }),
}));