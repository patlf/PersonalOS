# Design System Style Guide

This document outlines the standardized styling patterns and components for the productivity platform, following shadcn/ui principles.

## Core Principles

1. **Consistency**: All components use the same design tokens and styling patterns
2. **Accessibility**: Focus states, color contrast, and keyboard navigation are built-in
3. **Responsiveness**: Mobile-first approach with consistent breakpoints
4. **Theme Support**: All components work seamlessly in light and dark modes
5. **Performance**: Optimized animations and transitions

## Design Tokens

### Colors
All colors use semantic tokens that automatically adapt to light/dark themes:

```typescript
// Primary colors
--primary: Main brand color
--primary-foreground: Text on primary background
--secondary: Secondary brand color
--secondary-foreground: Text on secondary background

// Surface colors
--background: Main background
--foreground: Main text color
--card: Card background
--card-foreground: Text on cards
--muted: Muted background
--muted-foreground: Muted text

// Interactive states
--hover-bg: Hover background
--hover-foreground: Hover text
--active-bg: Active/pressed background
--active-foreground: Active/pressed text
--focus-ring: Focus ring color

// Status colors
--destructive: Error/danger color
--destructive-foreground: Text on destructive background
```

### Spacing
Consistent spacing scale using rem units:

```typescript
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 3rem (48px)
--spacing-3xl: 4rem (64px)
```

### Typography
Responsive typography with consistent hierarchy:

```typescript
// Headings
h1: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
h2: "text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight"
h3: "text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight"
h4: "text-base sm:text-lg font-semibold tracking-tight"

// Body text
body: "text-sm sm:text-base leading-relaxed"
bodySmall: "text-xs sm:text-sm leading-relaxed"
muted: "text-muted-foreground text-sm"
caption: "text-muted-foreground text-xs"
```

## Component Patterns

### Interactive Elements

All interactive elements (buttons, links, clickable cards) should use consistent hover, focus, and active states:

```typescript
import { interactiveStyles } from '@/lib/component-styles';

// Usage
<button className={interactiveStyles({ variant: 'default', size: 'default' })}>
  Click me
</button>
```

**Variants:**
- `default`: Standard hover with accent background
- `primary`: Primary button styling with hover effects
- `secondary`: Secondary button styling
- `destructive`: Destructive/danger styling
- `ghost`: Minimal styling with hover effects
- `outline`: Outlined styling with hover fill

### Cards

Cards provide consistent container styling with proper shadows and spacing:

```typescript
import { cardStyles } from '@/lib/component-styles';

// Usage
<div className={cardStyles({ variant: 'default', padding: 'default' })}>
  Card content
</div>
```

**Variants:**
- `default`: Standard card with subtle shadow
- `interactive`: Hover effects for clickable cards
- `elevated`: Higher shadow for emphasis
- `flat`: No shadow for minimal design

**Padding Options:**
- `none`: No padding
- `sm`: Small padding (12px)
- `default`: Standard padding (16px)
- `lg`: Large padding (24px)
- `xl`: Extra large padding (32px)

### Form Inputs

Consistent styling for all form inputs with proper focus states:

```typescript
import { inputStyles } from '@/lib/component-styles';

// Usage
<input className={inputStyles({ variant: 'default', size: 'default' })} />
```

**Variants:**
- `default`: Standard input styling
- `error`: Error state with red border
- `success`: Success state with green border

### Badges and Tags

Consistent badge styling for status indicators and tags:

```typescript
import { badgeStyles } from '@/lib/component-styles';

// Usage
<span className={badgeStyles({ variant: 'default', size: 'default' })}>
  Badge text
</span>
```

**Variants:**
- `default`: Primary badge
- `secondary`: Secondary badge
- `destructive`: Error/danger badge
- `outline`: Outlined badge
- `success`: Success badge (green)
- `warning`: Warning badge (yellow)
- `info`: Info badge (blue)

### Priority and Status Indicators

Specialized styling for task priorities and statuses:

```typescript
import { priorityStyles, statusStyles } from '@/lib/component-styles';

// Priority badge
<span className={cn(badgeStyles({ size: 'sm' }), priorityStyles.high.badge)}>
  High Priority
</span>

// Status indicator
<div className={statusStyles.completed.dot} />
```

## Animation Patterns

### Micro-interactions

Subtle animations enhance user experience:

```typescript
import { animationStyles } from '@/lib/component-styles';

// Hover animations
<button className={animationStyles.scale}>Scale on hover</button>
<div className={animationStyles.lift}>Lift on hover</div>
<div className={animationStyles.glow}>Glow on hover</div>

// Entrance animations
<div className={animationStyles.fadeIn}>Fade in</div>
<div className={animationStyles.slideInLeft}>Slide from left</div>
```

### Loading States

Consistent loading animations:

```typescript
// Pulse for skeleton loading
<div className={animationStyles.pulse}>Loading...</div>

// Spin for loading indicators
<div className={animationStyles.spin}>⟳</div>
```

## Layout Patterns

### Responsive Containers

Consistent container patterns for different content types:

```typescript
import { layoutStyles } from '@/lib/component-styles';

// Standard container
<div className={layoutStyles.container}>Content</div>

// Tight container for focused content
<div className={layoutStyles.containerTight}>Content</div>

// Wide container for dashboard layouts
<div className={layoutStyles.containerWide}>Content</div>
```

### Flex Layouts

Common flex patterns:

```typescript
// Center content
<div className={layoutStyles.flexCenter}>Centered</div>

// Space between items
<div className={layoutStyles.flexBetween}>
  <span>Left</span>
  <span>Right</span>
</div>

// Column layout
<div className={layoutStyles.flexCol}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid Layouts

Responsive grid patterns:

```typescript
// Responsive 1-3 column grid
<div className={layoutStyles.gridResponsive}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Two column grid
<div className={layoutStyles.gridTwoCol}>
  <div>Left</div>
  <div>Right</div>
</div>
```

## Form Patterns

### Form Structure

Consistent form layouts:

```typescript
import { formStyles } from '@/lib/component-styles';

<form className={formStyles.form}>
  <div className={formStyles.formGroup}>
    <label>Field Label</label>
    <input />
  </div>
  
  <div className={formStyles.formGrid}>
    <div className={formStyles.formGroup}>
      <label>Field 1</label>
      <input />
    </div>
    <div className={formStyles.formGroup}>
      <label>Field 2</label>
      <input />
    </div>
  </div>
  
  <div className={formStyles.formActions}>
    <button type="button">Cancel</button>
    <button type="submit">Save</button>
  </div>
</form>
```

## Responsive Design

### Breakpoints

Consistent breakpoint system:

```css
/* Mobile first approach */
xs: 475px   /* Extra small devices */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Utilities

Use responsive spacing and sizing:

```typescript
import { spacingStyles } from '@/lib/component-styles';

// Responsive padding
<div className={spacingStyles.paddingResponsive}>Content</div>

// Responsive gaps
<div className={spacingStyles.gapResponsive}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Accessibility

### Focus States

All interactive elements have consistent focus indicators:

```css
/* Automatic focus ring */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

### Color Contrast

All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

### Keyboard Navigation

All interactive elements support keyboard navigation:
- Tab order follows visual order
- Enter/Space activate buttons
- Escape closes modals/dropdowns
- Arrow keys navigate lists/menus

## Best Practices

### Component Development

1. **Use semantic tokens**: Always use CSS custom properties instead of hardcoded colors
2. **Import standardized styles**: Use the component-styles utilities instead of custom classes
3. **Follow naming conventions**: Use descriptive, consistent class names
4. **Test in both themes**: Ensure components work in light and dark modes
5. **Consider mobile first**: Design for mobile, enhance for desktop

### Performance

1. **Minimize custom CSS**: Use utility classes and standardized patterns
2. **Optimize animations**: Use transform and opacity for smooth animations
3. **Lazy load heavy components**: Use React.lazy for large components
4. **Minimize re-renders**: Use React.memo and useMemo appropriately

### Maintenance

1. **Document component APIs**: Include TypeScript interfaces and JSDoc comments
2. **Write tests**: Include unit tests for component behavior
3. **Update style guide**: Keep this document current with changes
4. **Review regularly**: Conduct periodic design system reviews

## Migration Guide

When updating existing components to use the standardized styles:

1. **Import utilities**: Add component-styles imports
2. **Replace custom classes**: Use standardized variants instead of custom CSS
3. **Update color references**: Use semantic color tokens
4. **Test thoroughly**: Verify appearance in both themes and all breakpoints
5. **Update tests**: Ensure tests still pass with new class names

## Examples

See the following components for reference implementations:
- `src/components/tasks/task-card.tsx` - Card styling with badges
- `src/components/tasks/task-input.tsx` - Form patterns
- `src/components/ui/theme-toggle.tsx` - Interactive elements with animations
- `src/components/mail/mail-view.tsx` - Layout patterns and responsive design