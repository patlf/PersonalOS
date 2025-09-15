import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';

// Mock the theme provider hook
const mockSetTheme = vi.fn();

vi.mock('../../providers/theme-provider', () => ({
  useTheme: vi.fn(() => ({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: mockSetTheme,
    systemTheme: 'light',
  })),
}));

function renderThemeToggle(props = {}) {
  return render(<ThemeToggle {...props} />);
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render theme toggle button', () => {
    renderThemeToggle();
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderThemeToggle();
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    const screenReaderText = screen.getByText('Toggle theme');
    expect(screenReaderText).toHaveClass('sr-only');
  });

  it('should apply custom className', () => {
    renderThemeToggle({ className: 'custom-class' });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should show label when showLabel is true', () => {
    renderThemeToggle({ showLabel: true });
    
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should display correct icon for resolved theme', () => {
    renderThemeToggle();
    
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle theme context correctly', () => {
    renderThemeToggle();
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});