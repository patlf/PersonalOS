import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { TopNavigation } from '../top-navigation';
import { useNavigationStore } from '@/lib/stores/navigation-store';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('next/navigation');
vi.mock('@/lib/stores/navigation-store');
vi.mock('@/components/auth/user-avatar', () => ({
  UserAvatar: () => <div data-testid="user-avatar">User Avatar</div>
}));
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: ({ variant, size }: { variant?: string; size?: string }) => (
    <button data-testid="theme-toggle" data-variant={variant} data-size={size}>
      Theme Toggle
    </button>
  )
}));

const mockUseSession = vi.mocked(useSession);
const mockUsePathname = vi.mocked(usePathname);
const mockUseRouter = vi.mocked(useRouter);
const mockUseNavigationStore = vi.mocked(useNavigationStore);

const mockPush = vi.fn();
const mockSetActiveRoute = vi.fn();
const mockToggleMobileMenu = vi.fn();

describe('TopNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
    
    mockUsePathname.mockReturnValue('/tasks');
    
    mockUseNavigationStore.mockReturnValue({
      activeRoute: '/tasks',
      isMobileMenuOpen: false,
      isNavigationVisible: true,
      isNavigationCollapsed: false,
      setActiveRoute: mockSetActiveRoute,
      toggleMobileMenu: mockToggleMobileMenu,
      closeMobileMenu: vi.fn(),
      setNavigationVisibility: vi.fn(),
      setNavigationCollapsed: vi.fn(),
      resetNavigation: vi.fn(),
      setSidebarCollapsed: vi.fn(), // Backward compatibility
    });
    
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: '2024-01-01',
      },
      status: 'authenticated',
    });
  });

  it('renders the logo and brand name', () => {
    render(<TopNavigation />);
    
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('renders navigation items with correct labels', () => {
    render(<TopNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('shows "Soon" label for placeholder items', () => {
    render(<TopNavigation />);
    
    const soonLabels = screen.getAllByText('Soon');
    expect(soonLabels).toHaveLength(4); // Dashboard, Calendar, Mail, AI Assistant
  });

  it('highlights active navigation item', () => {
    render(<TopNavigation />);
    
    const tasksButton = screen.getByRole('button', { name: /tasks/i });
    expect(tasksButton).toHaveClass('bg-secondary');
  });

  it('handles navigation item clicks', async () => {
    render(<TopNavigation />);
    
    const calendarButton = screen.getByRole('button', { name: /calendar/i });
    fireEvent.click(calendarButton);
    
    await waitFor(() => {
      expect(mockSetActiveRoute).toHaveBeenCalledWith('/calendar');
      expect(mockPush).toHaveBeenCalledWith('/calendar');
    });
  });

  it('renders theme toggle', () => {
    render(<TopNavigation />);
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders user profile when authenticated', () => {
    render(<TopNavigation />);
    
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('does not render user profile when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    render(<TopNavigation />);
    
    expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument();
  });

  it('renders mobile menu trigger', () => {
    render(<TopNavigation />);
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    render(<TopNavigation />);
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(menuButton);
    
    expect(mockToggleMobileMenu).toHaveBeenCalled();
  });

  it('closes mobile menu when navigation item is clicked', async () => {
    mockUseNavigationStore.mockReturnValue({
      activeRoute: '/tasks',
      isMobileMenuOpen: true,
      isNavigationVisible: true,
      isNavigationCollapsed: false,
      setActiveRoute: mockSetActiveRoute,
      toggleMobileMenu: mockToggleMobileMenu,
      closeMobileMenu: vi.fn(),
      setNavigationVisibility: vi.fn(),
      setNavigationCollapsed: vi.fn(),
      resetNavigation: vi.fn(),
      setSidebarCollapsed: vi.fn(), // Backward compatibility
    });
    
    render(<TopNavigation />);
    
    // Click on a navigation item in mobile menu
    const calendarButton = screen.getAllByRole('button', { name: /calendar/i })[0];
    fireEvent.click(calendarButton);
    
    await waitFor(() => {
      expect(mockToggleMobileMenu).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<TopNavigation className="custom-class" />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('handles logo click navigation', async () => {
    render(<TopNavigation />);
    
    const logoLink = screen.getByRole('link');
    fireEvent.click(logoLink);
    
    await waitFor(() => {
      expect(mockSetActiveRoute).toHaveBeenCalledWith('/');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state before hydration', () => {
    // Mock useState to simulate pre-hydration state
    const mockSetState = vi.fn();
    vi.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, mockSetState]); // mounted = false
    
    render(<TopNavigation />);
    
    // Should render basic structure without interactive elements
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });
});