import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthNavigation } from '../auth-navigation';
import { ThemeProvider } from '@/components/providers/theme-provider';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock theme toggle
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: ({ variant, size }: any) => (
    <button data-testid="theme-toggle" data-variant={variant} data-size={size}>
      Theme Toggle
    </button>
  ),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="light">
      {component}
    </ThemeProvider>
  );
};

describe('AuthNavigation', () => {
  it('renders the logo and brand name', () => {
    renderWithTheme(<AuthNavigation />);
    
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('renders sign in and sign up buttons', () => {
    renderWithTheme(<AuthNavigation />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders theme toggle', () => {
    renderWithTheme(<AuthNavigation />);
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    renderWithTheme(<AuthNavigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sticky', 'top-0', 'z-50', 'h-16', 'border-b');
  });

  it('sign in button is hidden on small screens', () => {
    renderWithTheme(<AuthNavigation />);
    
    const signInButton = screen.getByRole('link', { name: /sign in/i });
    expect(signInButton).toHaveClass('hidden', 'sm:inline-flex');
  });

  it('sign up button is always visible', () => {
    renderWithTheme(<AuthNavigation />);
    
    const signUpButton = screen.getByRole('link', { name: /sign up/i });
    expect(signUpButton).not.toHaveClass('hidden');
  });

  it('logo links to home page', () => {
    renderWithTheme(<AuthNavigation />);
    
    const logoLink = screen.getByRole('link', { name: /productivity platform/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('applies custom className when provided', () => {
    renderWithTheme(<AuthNavigation className="custom-class" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });
});