/**
 * OnPar Enterprise Design System
 * Comprehensive design tokens for consistent UI/UX
 */

// Color System
export const colors = {
  // Brand Colors
  primary: {
    50: 'hsl(158 64% 95%)',
    100: 'hsl(158 64% 89%)',
    200: 'hsl(158 64% 78%)',
    300: 'hsl(158 64% 67%)',
    400: 'hsl(158 64% 56%)',
    500: 'hsl(158 64% 52%)', // Primary brand color
    600: 'hsl(158 64% 47%)',
    700: 'hsl(158 64% 42%)',
    800: 'hsl(158 64% 37%)',
    900: 'hsl(158 64% 32%)',
    950: 'hsl(158 64% 22%)',
  },
  
  secondary: {
    50: 'hsl(199 89% 95%)',
    100: 'hsl(199 89% 89%)',
    200: 'hsl(199 89% 78%)',
    300: 'hsl(199 89% 67%)',
    400: 'hsl(199 89% 56%)',
    500: 'hsl(199 89% 48%)', // Secondary brand color
    600: 'hsl(199 89% 43%)',
    700: 'hsl(199 89% 38%)',
    800: 'hsl(199 89% 33%)',
    900: 'hsl(199 89% 28%)',
    950: 'hsl(199 89% 18%)',
  },
  
  // Semantic Colors
  success: {
    50: 'hsl(142 76% 95%)',
    100: 'hsl(142 76% 89%)',
    200: 'hsl(142 76% 78%)',
    300: 'hsl(142 76% 67%)',
    400: 'hsl(142 76% 56%)',
    500: 'hsl(142 76% 45%)',
    600: 'hsl(142 76% 36%)', // Success color
    700: 'hsl(142 76% 31%)',
    800: 'hsl(142 76% 26%)',
    900: 'hsl(142 76% 21%)',
    950: 'hsl(142 76% 11%)',
  },
  
  warning: {
    50: 'hsl(45 93% 95%)',
    100: 'hsl(45 93% 89%)',
    200: 'hsl(45 93% 78%)',
    300: 'hsl(45 93% 67%)',
    400: 'hsl(45 93% 56%)',
    500: 'hsl(45 93% 47%)', // Warning color
    600: 'hsl(45 93% 42%)',
    700: 'hsl(45 93% 37%)',
    800: 'hsl(45 93% 32%)',
    900: 'hsl(45 93% 27%)',
    950: 'hsl(45 93% 17%)',
  },
  
  error: {
    50: 'hsl(0 84% 95%)',
    100: 'hsl(0 84% 89%)',
    200: 'hsl(0 84% 78%)',
    300: 'hsl(0 84% 67%)',
    400: 'hsl(0 84% 63%)',
    500: 'hsl(0 84% 60%)', // Error color
    600: 'hsl(0 84% 55%)',
    700: 'hsl(0 84% 50%)',
    800: 'hsl(0 84% 45%)',
    900: 'hsl(0 84% 40%)',
    950: 'hsl(0 84% 30%)',
  },
  
  info: {
    50: 'hsl(217 91% 95%)',
    100: 'hsl(217 91% 89%)',
    200: 'hsl(217 91% 78%)',
    300: 'hsl(217 91% 67%)',
    400: 'hsl(217 91% 63%)',
    500: 'hsl(217 91% 60%)', // Info color
    600: 'hsl(217 91% 55%)',
    700: 'hsl(217 91% 50%)',
    800: 'hsl(217 91% 45%)',
    900: 'hsl(217 91% 40%)',
    950: 'hsl(217 91% 30%)',
  },
  
  // Neutral Colors
  neutral: {
    50: 'hsl(220 13% 98%)',
    100: 'hsl(220 13% 95%)',
    200: 'hsl(220 13% 91%)',
    300: 'hsl(220 13% 85%)',
    400: 'hsl(220 13% 69%)',
    500: 'hsl(220 13% 53%)',
    600: 'hsl(215 16% 47%)',
    700: 'hsl(215 25% 27%)',
    800: 'hsl(215 28% 17%)',
    900: 'hsl(222 47% 11%)',
    950: 'hsl(222 47% 6%)',
  },
} as const

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// Spacing System (4px base unit)
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const

// Border Radius System
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const

// Animation System
export const animations = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
} as const

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  'modal-backdrop': '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  toast: '1080',
} as const

// Component Variants
export const componentVariants = {
  button: {
    size: {
      sm: {
        height: '2rem',
        padding: '0 0.75rem',
        fontSize: '0.875rem',
      },
      md: {
        height: '2.5rem',
        padding: '0 1rem',
        fontSize: '0.875rem',
      },
      lg: {
        height: '3rem',
        padding: '0 1.5rem',
        fontSize: '1rem',
      },
      xl: {
        height: '3.5rem',
        padding: '0 2rem',
        fontSize: '1.125rem',
      },
    },
    
    variant: {
      primary: {
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        border: '1px solid var(--primary)',
      },
      secondary: {
        background: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        border: '1px solid var(--secondary)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--foreground)',
        border: 'none',
      },
    },
  },
  
  card: {
    variant: {
      default: {
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      },
      elevated: {
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
      },
      interactive: {
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all var(--duration-normal) ease-out',
      },
    },
  },
} as const

// Utility functions for design tokens
export function getColor(path: string): string {
  const keys = path.split('.')
  let value: any = colors
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return typeof value === 'string' ? value : ''
}

export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key]
}

export function getFontSize(key: keyof typeof typography.fontSize): [string, { lineHeight: string }] {
  return typography.fontSize[key]
}

export function getShadow(key: keyof typeof shadows): string {
  return shadows[key]
}

export function getBorderRadius(key: keyof typeof borderRadius): string {
  return borderRadius[key]
}

// CSS-in-JS helper for creating consistent styles
export function createStyles(styles: Record<string, any>) {
  return styles
}

// Theme-aware utility for conditional styling
export function themeVariant<T>(lightValue: T, darkValue: T): T {
  if (typeof window === 'undefined') return lightValue
  
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? darkValue : lightValue
}

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  componentVariants,
  getColor,
  getSpacing,
  getFontSize,
  getShadow,
  getBorderRadius,
  createStyles,
  themeVariant,
}