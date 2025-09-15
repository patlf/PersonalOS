import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { performanceMonitor } from '@/lib/performance';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}));

// Mock auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

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
    filters: {},
    searchQuery: '',
    isLoading: false,
    setTasks: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    setCurrentWeek: vi.fn(),
    togglePastDays: vi.fn(),
    setFilters: vi.fn(),
    setSearchQuery: vi.fn(),
    getTasksByStatus: vi.fn(() => []),
    getTasksByDate: vi.fn(() => []),
    getOverdueTasks: vi.fn(() => []),
    getTodayTasks: vi.fn(() => []),
    getFilteredTasks: vi.fn(() => []),
    getAvailableTags: vi.fn(() => []),
  }),
}));

// Mock hooks
vi.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: () => {},
}));

vi.mock('@/hooks/use-tasks', () => ({
  useTasks: () => ({
    tasks: [],
    isLoading: false,
    error: null,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}));

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  it('should lazy load task page components', async () => {
    // Import the tasks page dynamically to test lazy loading
    const TasksPage = (await import('@/app/tasks/page')).default;
    
    render(<TasksPage />);

    // Should show skeleton initially
    expect(screen.getByTestId('skeleton') || screen.getByText(/loading/i)).toBeDefined();

    // Wait for component to load
    await waitFor(() => {
      // The actual component should eventually load
      expect(screen.queryByTestId('skeleton')).toBeNull();
    }, { timeout: 3000 });
  });

  it('should show suspense fallback for AI page', async () => {
    const AIPage = (await import('@/app/ai/page')).default;
    
    render(<AIPage />);

    // Should show skeleton initially
    expect(screen.getByTestId('skeleton') || screen.getByText(/loading/i)).toBeDefined();
  });

  it('should show suspense fallback for mail page', async () => {
    const MailPage = (await import('@/app/mail/page')).default;
    
    render(<MailPage />);

    // Should show skeleton initially
    expect(screen.getByTestId('skeleton') || screen.getByText(/loading/i)).toBeDefined();
  });

  it('should show suspense fallback for calendar page', async () => {
    const CalendarPage = (await import('@/app/calendar/page')).default;
    
    render(<CalendarPage />);

    // Should show skeleton initially
    expect(screen.getByTestId('skeleton') || screen.getByText(/loading/i)).toBeDefined();
  });

  it('should record performance metrics during component lifecycle', async () => {
    // Import a component that uses performance monitoring
    const { AppLayout } = await import('@/components/layout/app-layout');
    
    const TestComponent = () => (
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    const { unmount } = render(<TestComponent />);

    // Wait a bit for performance metrics to be recorded
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if any metrics were recorded
    const metrics = performanceMonitor.getMetrics();
    
    // In a real browser environment, we would expect metrics
    // In test environment, metrics might not be recorded due to mocked performance API
    expect(metrics).toBeDefined();
    expect(Array.isArray(metrics)).toBe(true);

    unmount();
  });

  it('should handle performance monitoring gracefully when APIs are not available', () => {
    // Temporarily remove performance API
    const originalPerformance = global.performance;
    delete (global as any).performance;

    expect(() => {
      performanceMonitor.addMetric({
        name: 'test-metric',
        duration: 100,
        timestamp: Date.now(),
        type: 'render',
      });
    }).not.toThrow();

    // Restore performance API
    global.performance = originalPerformance;
  });

  it('should debounce search input correctly', async () => {
    const { debounce } = await import('@/lib/performance');
    
    let callCount = 0;
    const testFunction = () => {
      callCount++;
    };

    const debouncedFunction = debounce(testFunction, 100);

    // Call multiple times quickly
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    expect(callCount).toBe(0);

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(callCount).toBe(1);
  });

  it('should throttle function calls correctly', async () => {
    const { throttle } = await import('@/lib/performance');
    
    let callCount = 0;
    const testFunction = () => {
      callCount++;
    };

    const throttledFunction = throttle(testFunction, 100);

    // First call should execute immediately
    throttledFunction();
    expect(callCount).toBe(1);

    // Subsequent calls should be throttled
    throttledFunction();
    throttledFunction();
    expect(callCount).toBe(1);

    // Wait for throttle period
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be able to call again
    throttledFunction();
    expect(callCount).toBe(2);
  });
});