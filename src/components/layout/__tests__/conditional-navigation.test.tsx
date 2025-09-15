import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ConditionalNavigation } from '../conditional-navigation';
import { ThemeProvider } from '@/components/providers/theme-provider';

// Mock next-auth
vi.mock('next-auth/react');
const mockUseSession = vi.mocked(useSession);

// Mock next/navigation
vi.mock('next/navigation');
const mockUsePathname = vi.mocked(usePathname);

// Mock navigation components
vi.mock('../top-navigation', () => ({
  TopNavigation: () => <div data-testid="top-navigation">Top Navigation</div>,
}));

vi.mock('../auth-navigation', () => ({
  AuthNavigation: () => <div data-testid="auth-navigation">Auth Navigation</div>,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="light">
      {component}
    </ThemeProvider>
  );
};

describe('ConditionalNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    });

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    // Should show loading skeleton
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    
    // Should not show actual navigation components
    expect(screen.queryByTestId('top-navigation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('auth-navigation')).not.toBeInTheDocument();
  });

  it('shows AuthNavigation when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('auth-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('top-navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows TopNavigation when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      status: 'authenticated',
      update: vi.fn(),
    });

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows AuthNavigation on auth pages even when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      status: 'authenticated',
      update: vi.fn(),
    });
    mockUsePathname.mockReturnValue('/auth/signin');

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('auth-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('top-navigation')).not.toBeInTheDocument();
  });

  it('shows AuthNavigation on signup page', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      status: 'authenticated',
      update: vi.fn(),
    });
    mockUsePathname.mockReturnValue('/auth/signup');

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('auth-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('top-navigation')).not.toBeInTheDocument();
  });

  it('shows TopNavigation on non-auth pages when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      status: 'authenticated',
      update: vi.fn(),
    });
    mockUsePathname.mockReturnValue('/tasks');

    renderWithTheme(
      <ConditionalNavigation>
        <div>Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-navigation')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    renderWithTheme(
      <ConditionalNavigation>
        <div data-testid="child-content">Child Content</div>
      </ConditionalNavigation>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});