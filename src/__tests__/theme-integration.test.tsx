import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TopNavigation } from '@/components/layout/top-navigation';
import { TasksView } from '@/components/tasks/tasks-view';
import { QueryClient, QueryProvider } from '@tanstack/react-query';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

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
    // Simulate theme transition delay
    setTimeout(() => cb(), 0);
  } else {
    cb();
  }
  return 0 as any;
});

// Mock Zustand stores
vi.mock('@/lib/stores/navigation-store', () => ({
  useNavigationStore: () => ({
    activeRoute: '/tasks',
    isMobileMenuOpen: false,
    isNavigationVisible: true,
    isNavigationCollapsed: false,
    setActiveRoute: vi.fn(),
    toggleMobileMenu: vi.fn(),
    closeMobileMenu: vi.fn(),
    setNavigationVisibility: vi.fn(),
    setNavigationCollapsed: vi.fn(),
    resetNavigation: vi.fn(),
    setSidebarCollapsed: vi.fn(), // Backward compatibility
  }),
}));

vi.mock('@/lib/stores/task-store', () => ({
  useTaskStore: () => ({
    tasks: [],
    currentWeek: new Date(),
    showPastDays: false,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    setCurrentWeek: vi.fn(),
    togglePastDays: vi.fn(),
  }),
}));

// Mock auth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

// Mock sidebar hook
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: any) => <div data-testid="sidebar" {...props}>{children}</div>,
  SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
  SidebarFooter: ({ children }: any) => <div data-testid="sidebar-footer">{children}</div>,
  SidebarHeader: ({ children }: any) => <div data-testid="sidebar-header">{children}</div>,
  SidebarMenu: ({ children }: any) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuButton: ({ children, ...props }: any) => <button data-testid="sidebar-menu-button" {...props}>{children}</button>,
  SidebarMenuItem: ({ children }: any) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarSeparator: () => <hr data-testid="sidebar-separator" />,
  useSidebar: () => ({
    state: 'expanded',
    open: true,
    setOpen: vi.fn(),
    openMobile: false,
    setOpenMobile: vi.fn(),
    isMobile: false,
    toggleSidebar: vi.fn(),
  }),
}));

function TestApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <TopNavigation />
          <main className="flex-1 overflow-hidden">
            <TasksView />
          </main>
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}

describe('Theme Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('should initialize with system theme preference', async () => {
    render(<TestApp />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    // Should apply light theme by default (system preference)
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(mockDocumentElement.style.colorScheme).toBe('light');
  });

  it('should toggle theme across entire application', async () => {
    render(<TestApp />);
    
    // Find and click theme toggle
    const themeToggle = await screen.findByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);
    
    // Click dark theme option
    const darkOption = await screen.findByText('Dark');
    await user.click(darkOption);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(mockDocumentElement.style.colorScheme).toBe('dark');
    });
  });

  it('should persist theme preference across page reloads', async () => {
    // Simulate stored dark theme
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<TestApp />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    // Should apply stored dark theme
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(mockDocumentElement.style.colorScheme).toBe('dark');
  });

  it('should handle system theme changes dynamically', async () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    render(<TestApp />);
    
    await waitFor(() => {
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
    
    // Simulate system theme change to dark
    const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
    fireEvent(window, new Event('change'));
    changeHandler({ matches: true });
    
    // Should apply transition class for smooth change
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
  });

  it('should maintain theme consistency across components', async () => {
    render(<TestApp />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    // All components should receive the same theme context
    const sidebar = screen.getByTestId('sidebar');
    const main = screen.getByRole('main');
    
    expect(sidebar).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('should handle theme switching with smooth transitions', async () => {
    render(<TestApp />);
    
    const themeToggle = await screen.findByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);
    
    const lightOption = await screen.findByText('Light');
    await user.click(lightOption);
    
    // Should add transition class
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
    
    // Should remove transition class after delay
    await waitFor(() => {
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('theme-transition');
    });
  });

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    // Should not crash and fallback to system theme
    expect(() => render(<TestApp />)).not.toThrow();
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('should respect reduced motion preferences', async () => {
    // Mock prefers-reduced-motion
    mockMatchMedia.mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });
    
    render(<TestApp />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    // Theme changes should still work with reduced motion
    const themeToggle = await screen.findByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);
    
    const darkOption = await screen.findByText('Dark');
    await user.click(darkOption);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should handle SSR hydration correctly', async () => {
    // Mock SSR environment
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    // Should not crash during SSR
    expect(() => render(<TestApp />)).not.toThrow();
    
    // Restore window
    global.window = originalWindow;
  });

  it('should cleanup event listeners on unmount', async () => {
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    const { unmount } = render(<TestApp />);
    
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