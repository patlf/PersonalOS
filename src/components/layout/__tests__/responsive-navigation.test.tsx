import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSession } from 'next-auth/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TopNavigation } from '../top-navigation';
import { AuthNavigation } from '../auth-navigation';
import { ConditionalNavigation } from '../conditional-navigation';

// Test wrapper with theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light">
    {children}
  </ThemeProvider>
);

// Mock next-auth
vi.mock('next-auth/react');
const mockUseSession = vi.mocked(useSession);

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock navigation store
vi.mock('@/lib/stores/navigation-store', () => ({
  useNavigationStore: () => ({
    activeRoute: '/tasks',
    setActiveRoute: vi.fn(),
    isMobileMenuOpen: false,
    toggleMobileMenu: vi.fn(),
  }),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Responsive Navigation', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('TopNavigation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 'authenticated',
      } as any);
    });

    it('renders logo with responsive sizing', () => {
      render(<TopNavigation />, { wrapper: TestWrapper });
      
      const logo = screen.getByRole('link', { name: /productivity/i });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveClass('gap-2', 'sm:gap-3');
    });

    it('shows desktop navigation on large screens', () => {
      render(<TopNavigation />, { wrapper: TestWrapper });
      
      const tasksButtons = screen.getAllByText('Tasks');
      expect(tasksButtons.length).toBeGreaterThan(0);
    });

    it('shows mobile menu button on small screens', () => {
      render(<TopNavigation />, { wrapper: TestWrapper });
      
      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('applies responsive padding to container', () => {
      render(<TopNavigation />, { wrapper: TestWrapper });
      
      const container = screen.getByRole('navigation').firstChild;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('handles mobile menu interaction', async () => {
      render(<TopNavigation />, { wrapper: TestWrapper });
      
      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });
  });

  describe('AuthNavigation', () => {
    it('renders with responsive layout', () => {
      render(<AuthNavigation />, { wrapper: TestWrapper });
      
      const container = screen.getByRole('navigation').firstChild;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('shows sign in button only on larger screens', () => {
      render(<AuthNavigation />, { wrapper: TestWrapper });
      
      const signInButton = screen.getByRole('link', { name: 'Sign In' });
      expect(signInButton).toHaveClass('hidden', 'sm:inline-flex');
    });

    it('shows responsive sign up button text', () => {
      render(<AuthNavigation />, { wrapper: TestWrapper });
      
      const signUpButton = screen.getByRole('link', { name: /sign up|join/i });
      expect(signUpButton).toBeInTheDocument();
    });
  });

  describe('ConditionalNavigation', () => {
    it('shows loading state with responsive layout', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      } as any);

      render(
        <ConditionalNavigation>
          <div>Test content</div>
        </ConditionalNavigation>
      );
      
      const nav = screen.getByRole('navigation');
      const container = nav.firstChild;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('renders AuthNavigation for unauthenticated users', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      } as any);

      render(
        <TestWrapper>
          <ConditionalNavigation>
            <div>Test content</div>
          </ConditionalNavigation>
        </TestWrapper>
      );
      
      expect(screen.getByRole('link', { name: /sign up|join/i })).toBeInTheDocument();
    });

    it('renders TopNavigation for authenticated users', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 'authenticated',
      } as any);

      render(
        <TestWrapper>
          <ConditionalNavigation>
            <div>Test content</div>
          </ConditionalNavigation>
        </TestWrapper>
      );
      
      const tasksButtons = screen.getAllByText('Tasks');
      expect(tasksButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Breakpoints', () => {
    it('adapts to mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TopNavigation />, { wrapper: TestWrapper });
      
      // Mobile menu should be visible
      const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('adapts to tablet viewport', () => {
      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TopNavigation />, { wrapper: TestWrapper });
      
      // Should show tablet navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('adapts to desktop viewport', () => {
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<TopNavigation />, { wrapper: TestWrapper });
      
      // Should show full desktop navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });
});