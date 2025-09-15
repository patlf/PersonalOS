import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppSidebar } from '../app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

// Mock the navigation store
const mockUseNavigationStore = vi.fn()
vi.mock('@/lib/stores/navigation-store', () => ({
  useNavigationStore: () => mockUseNavigationStore(),
}))

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({ push: mockPush }),
}))

const renderAppSidebar = () => {
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  )
}

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNavigationStore.mockReturnValue({
      setSidebarCollapsed: vi.fn(),
      activeRoute: '/tasks',
      setActiveRoute: vi.fn(),
    })
  })

  it('renders all navigation items', () => {
    renderAppSidebar()
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Mail')).toBeInTheDocument()
  })

  it('shows the productivity platform branding', () => {
    renderAppSidebar()
    
    expect(screen.getByText('Productivity')).toBeInTheDocument()
    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('displays "Soon" indicator for placeholder items', () => {
    renderAppSidebar()
    
    const soonIndicators = screen.getAllByText('Soon')
    expect(soonIndicators).toHaveLength(3) // AI, Calendar, Mail are placeholders
  })

  it('highlights the active navigation item', () => {
    renderAppSidebar()
    
    const tasksButton = screen.getByRole('link', { name: /tasks/i })
    expect(tasksButton).toHaveAttribute('data-active', 'true')
  })

  it('renders footer items', () => {
    renderAppSidebar()
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('handles navigation clicks', () => {
    const mockSetActiveRoute = vi.fn()
    mockUseNavigationStore.mockReturnValue({
      setSidebarCollapsed: vi.fn(),
      activeRoute: '/tasks',
      setActiveRoute: mockSetActiveRoute,
    })

    renderAppSidebar()
    
    const aiButton = screen.getByRole('link', { name: /ai assistant/i })
    fireEvent.click(aiButton)
    
    expect(mockSetActiveRoute).toHaveBeenCalledWith('/ai')
    expect(mockPush).toHaveBeenCalledWith('/ai')
  })
})