// Enhanced design tokens for the new theme system
export const designTokens = {
  colors: {
    // Base semantic colors
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    
    // Card and surface colors
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    popover: 'hsl(var(--popover))',
    popoverForeground: 'hsl(var(--popover-foreground))',
    
    // Brand and accent colors
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    
    // State colors
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    ring: 'hsl(var(--ring))',
    
    // Navigation colors
    navBackground: 'hsl(var(--nav-background))',
    navForeground: 'hsl(var(--nav-foreground))',
    navBorder: 'hsl(var(--nav-border))',
    
    // Interactive states
    hoverBg: 'hsl(var(--hover-bg))',
    hoverForeground: 'hsl(var(--hover-foreground))',
    activeBg: 'hsl(var(--active-bg))',
    activeForeground: 'hsl(var(--active-foreground))',
    focusRing: 'hsl(var(--focus-ring))',
    
    // Chart colors
    chart1: 'hsl(var(--chart-1))',
    chart2: 'hsl(var(--chart-2))',
    chart3: 'hsl(var(--chart-3))',
    chart4: 'hsl(var(--chart-4))',
    chart5: 'hsl(var(--chart-5))',
    
    // Legacy sidebar colors (for backward compatibility)
    sidebar: 'hsl(var(--sidebar))',
    sidebarForeground: 'hsl(var(--sidebar-foreground))',
    sidebarPrimary: 'hsl(var(--sidebar-primary))',
    sidebarPrimaryForeground: 'hsl(var(--sidebar-primary-foreground))',
    sidebarAccent: 'hsl(var(--sidebar-accent))',
    sidebarAccentForeground: 'hsl(var(--sidebar-accent-foreground))',
    sidebarBorder: 'hsl(var(--sidebar-border))',
    sidebarRing: 'hsl(var(--sidebar-ring))',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    default: 'var(--radius)',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    nav: 'var(--nav-shadow)',
  },
  
  typography: {
    fontSans: 'var(--font-sans)',
    fontMono: 'var(--font-mono)',
  },
  
  layout: {
    navHeight: 'var(--nav-height)',
    navPaddingX: 'var(--nav-padding-x)',
    contentPaddingX: 'var(--content-padding-x)',
    contentPaddingY: 'var(--content-padding-y)',
    contentMaxWidth: 'var(--content-max-width)',
  },
  
  transitions: {
    nav: 'var(--nav-transition)',
    theme: 'all 0.3s ease-in-out',
    default: 'all 0.2s ease-out',
    fast: 'all 0.15s ease-out',
    slow: 'all 0.4s ease-out',
  },
} as const;

// Type helpers for design tokens
export type DesignTokens = typeof designTokens;
export type ColorTokens = keyof typeof designTokens.colors;
export type SpacingTokens = keyof typeof designTokens.spacing;
export type RadiusTokens = keyof typeof designTokens.borderRadius;
export type ShadowTokens = keyof typeof designTokens.shadows;
export type LayoutTokens = keyof typeof designTokens.layout;
export type TransitionTokens = keyof typeof designTokens.transitions;