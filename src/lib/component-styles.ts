/**
 * Standardized component styling utilities following shadcn/ui principles
 * This file provides consistent styling patterns for all components
 */

import { cva, type VariantProps } from "class-variance-authority";

// Base interactive element styles with consistent hover, focus, and active states
export const interactiveStyles = cva(
  "transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        primary: "hover:bg-primary/90 active:bg-primary/80",
        secondary: "hover:bg-secondary/80 active:bg-secondary/70",
        destructive: "hover:bg-destructive/90 active:bg-destructive/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "hover:bg-accent hover:text-accent-foreground border border-input",
        warm: "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm hover:shadow-md",
        darkPanel: "bg-card hover:bg-card/80 border border-border/50 hover:border-border transition-colors",
        minimal: "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9",
        iconSm: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Card component styles with consistent spacing and shadows
export const cardStyles = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        interactive: "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        elevated: "shadow-md hover:shadow-lg",
        flat: "shadow-none border-border/50",
        darkPanel: "bg-card/50 border-border/30 backdrop-blur-sm",
        task: "bg-card hover:bg-card/80 border-l-4 border-l-transparent hover:border-l-amber-500 transition-all duration-200",
        calendar: "bg-card/30 border-border/20 hover:bg-card/50 backdrop-blur-sm",
      },
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

// Input field styles with consistent theming
export const inputStyles = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200 ease-out placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        error: "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        success: "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-9 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Badge/chip styles with consistent theming
export const badgeStyles = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Priority indicator styles
export const priorityStyles = {
  low: {
    badge: "bg-muted text-muted-foreground border-border",
    border: "border-l-muted-foreground/30",
    dot: "bg-muted-foreground/30",
  },
  medium: {
    badge: "bg-primary/10 text-primary border-primary/20",
    border: "border-l-primary",
    dot: "bg-primary",
  },
  high: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    border: "border-l-destructive",
    dot: "bg-destructive",
  },
} as const;

// Status indicator styles
export const statusStyles = {
  someday: {
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  scheduled: {
    badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  completed: {
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    dot: "bg-green-500",
  },
} as const;

// Animation classes for micro-interactions
export const animationStyles = {
  // Hover animations
  lift: "hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out",
  scale: "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 ease-out",
  glow: "hover:shadow-md hover:shadow-primary/20 transition-all duration-200 ease-out",
  
  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
  
  // Entrance animations
  fadeIn: "animate-in fade-in duration-300",
  slideInLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInRight: "animate-in slide-in-from-right-4 duration-300",
  slideInUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideInDown: "animate-in slide-in-from-top-4 duration-300",
  
  // Exit animations
  fadeOut: "animate-out fade-out duration-200",
  slideOutLeft: "animate-out slide-out-to-left-4 duration-200",
  slideOutRight: "animate-out slide-out-to-right-4 duration-200",
  slideOutUp: "animate-out slide-out-to-top-4 duration-200",
  slideOutDown: "animate-out slide-out-to-bottom-4 duration-200",
} as const;

// Responsive spacing utilities
export const spacingStyles = {
  // Padding
  paddingResponsive: "p-3 sm:p-4 md:p-6",
  paddingResponsiveX: "px-3 sm:px-4 md:px-6",
  paddingResponsiveY: "py-3 sm:py-4 md:py-6",
  
  // Margins
  marginResponsive: "m-3 sm:m-4 md:m-6",
  marginResponsiveX: "mx-3 sm:mx-4 md:mx-6",
  marginResponsiveY: "my-3 sm:my-4 md:my-6",
  
  // Gaps
  gapResponsive: "gap-3 sm:gap-4 md:gap-6",
  gapResponsiveX: "gap-x-3 sm:gap-x-4 md:gap-x-6",
  gapResponsiveY: "gap-y-3 sm:gap-y-4 md:gap-y-6",
} as const;

// Typography styles with consistent hierarchy
export const typographyStyles = {
  // Headings
  h1: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
  h2: "text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight",
  h3: "text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight",
  h4: "text-base sm:text-lg font-semibold tracking-tight",
  h5: "text-sm sm:text-base font-semibold tracking-tight",
  h6: "text-xs sm:text-sm font-semibold tracking-tight",
  
  // Body text
  body: "text-sm sm:text-base leading-relaxed",
  bodySmall: "text-xs sm:text-sm leading-relaxed",
  bodyLarge: "text-base sm:text-lg leading-relaxed",
  
  // Special text
  muted: "text-muted-foreground text-sm",
  caption: "text-muted-foreground text-xs",
  code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
  
  // Links
  link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors duration-200",
} as const;

// Layout utilities for consistent spacing and alignment
export const layoutStyles = {
  // Containers
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  containerTight: "container mx-auto px-3 sm:px-4 md:px-6 max-w-4xl",
  containerWide: "container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl",
  
  // Flex layouts
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  flexEnd: "flex items-center justify-end",
  flexCol: "flex flex-col",
  flexColCenter: "flex flex-col items-center justify-center",
  
  // Grid layouts
  gridResponsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
  gridTwoCol: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  gridThreeCol: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
  gridFourCol: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6",
} as const;

// Form styles for consistent form layouts
export const formStyles = {
  // Form containers
  form: "space-y-4",
  formSection: "space-y-3",
  formGroup: "space-y-2",
  
  // Form layouts
  formGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  formInline: "flex flex-col sm:flex-row gap-4 sm:items-end",
  
  // Form actions
  formActions: "flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t",
  formActionsInline: "flex gap-2 justify-end",
} as const;

// Export type helpers
export type InteractiveVariants = VariantProps<typeof interactiveStyles>;
export type CardVariants = VariantProps<typeof cardStyles>;
export type InputVariants = VariantProps<typeof inputStyles>;
export type BadgeVariants = VariantProps<typeof badgeStyles>;