import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppLayout } from '../app-layout'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/theme-provider'

// Mock the navigation store
const mockUseNavigationStore = vi.fn()
vi.mock('@/lib/stores/navigation-store', () => ({
  useNavigationStore: () => mockUseNavigationStore(),
}))

// Mock keyboard shortcuts hook
vi.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => children,
  useSession: () => ({
    data: { user: { id: '1', email: 'test@example.com' } },
    status: 'authenticated',
    update: vi.fn(),
  }),
}))

// Mock performance hooks
vi.mock('@/hooks/use-performance', () => ({
  useComponentPerformance: () => ({
    startRender: vi.fn(),
    endRender: vi.fn(),
  }),
  useMemoryMonitoring: vi.fn(),
}))

// Mock performance and error handling utilities
vi.mock('@/lib/performance', () => ({
  logBundleInfo: vi.fn(),
}))

vi.mock('@/lib/error-handling', () => ({
  setupGlobalErrorHandling: vi.fn(),
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="light">
      <SessionProvider>
        {component}
      </SessionProvider>
    </ThemeProvider>
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNavigationStore.mockReturnValue({
      setActiveRoute: vi.fn(),
      sidebarCollapsed: false,
      activeRoute: '/tasks',
      setSidebarCollapsed: vi.fn(),
      toggleSidebar: vi.fn(),
    })
  })

  it('renders children content', () => {
    renderWithProviders(
      <AppLayout>
        <div data-testid="test-content">Test Content</div>
      </AppLayout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('renders the navigation', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    
    // Should render TopNavigation for authenticated users
    expect(screen.getByText('Productivity')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('applies correct layout structure', () => {
    const { container } = renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    
    const layoutContainer = container.querySelector('.flex.min-h-screen')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('updates active route when pathname changes', () => {
    const mockSetActiveRoute = vi.fn()
    mockUseNavigationStore.mockReturnValue({
      setActiveRoute: mockSetActiveRoute,
      sidebarCollapsed: false,
      activeRoute: '/tasks',
      setSidebarCollapsed: vi.fn(),
      toggleSidebar: vi.fn(),
      isMobileMenuOpen: false,
      toggleMobileMenu: vi.fn(),
      isNavigationVisible: true,
      setNavigationVisibility: vi.fn(),
    })

    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )
    
    expect(mockSetActiveRoute).toHaveBeenCalledWith('/tasks')
  })
})