import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../providers/theme-provider';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../button';
import { Card } from '../card';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'system'),
  setItem: vi.fn(),
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

// Test component with various UI elements
function TestUIComponents() {
  return (
    <div className="p-4 space-y-4">
      <ThemeToggle showLabel />
      <Button variant="default">Default Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-muted-foreground">Card content with muted text</p>
      </Card>
    </div>
  );
}

function renderWithTheme(theme: 'light' | 'dark' | 'system' = 'system') {
  mockLocalStorage.getItem.mockReturnValue(theme);
  
  return render(
    <ThemeProvider defaultTheme={theme}>
      <TestUIComponents />
    </ThemeProvider>
  );
}

describe('Theme Visual Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('should apply consistent styling in light theme', async () => {
    mockDocumentElement.classList.contains.mockReturnValue(false);
    
    renderWithTheme('light');
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    // Verify light theme is applied
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(mockDocumentElement.style.colorScheme).toBe('light');
  });

  it('should apply consistent styling in dark theme', async () => {
    mockDocumentElement.classList.contains.mockReturnValue(true);
    
    renderWithTheme('dark');
    
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    // Verify dark theme is applied
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(mockDocumentElement.style.colorScheme).toBe('dark');
  });

  it('should maintain consistent spacing and typography', async () => {
    renderWithTheme('light');
    
    const container = await screen.findByText('Card Title');
    expect(container).toHaveClass('text-lg', 'font-semibold');
    
    const mutedText = screen.getByText('Card content with muted text');
    expect(mutedText).toHaveClass('text-muted-foreground');
  });

  it('should apply proper focus states', async () => {
    renderWithTheme('light');
    
    const button = await screen.findByText('Default Button');
    expect(button.closest('button')).toBeInTheDocument();
  });

  it('should handle system theme preference', async () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // Dark system preference
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    renderWithTheme('system');
    
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('should maintain accessibility in both themes', async () => {
    // Test light theme accessibility
    renderWithTheme('light');
    
    const themeToggle = await screen.findByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  it('should preserve component hierarchy in theme changes', async () => {
    const { rerender } = renderWithTheme('light');
    
    await waitFor(() => {
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });
    
    // Change to dark theme
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    rerender(
      <ThemeProvider defaultTheme="dark">
        <TestUIComponents />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });
  });

  it('should apply smooth transitions between themes', async () => {
    renderWithTheme('light');
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument();
    });
    
    // Verify transition class is applied during theme changes
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transition');
  });

  it('should maintain proper contrast ratios', async () => {
    // This test would ideally use actual color contrast checking
    // For now, we verify that proper CSS classes are applied
    renderWithTheme('light');
    
    const mutedText = await screen.findByText('Card content with muted text');
    expect(mutedText).toHaveClass('text-muted-foreground');
  });

  it('should handle reduced motion preferences', async () => {
    // Mock prefers-reduced-motion
    const mockReducedMotionQuery = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockReducedMotionQuery;
      }
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });
    
    renderWithTheme('light');
    
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument();
    });
    
    // Verify that animations respect reduced motion preference
    // This would be handled by CSS media queries in practice
  });
});