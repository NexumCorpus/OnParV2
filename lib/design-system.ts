/**
 * OnPar Enterprise Design System
 * Complete design system implementation with utilities and constants
 */

// Re-export design tokens
export * from './design-tokens'

// Typography scale with semantic naming
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },

  // Font sizes with line heights
  fontSize: {
    // Display sizes for hero sections
    'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.05em' }],
    'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
    'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
    
    // Heading sizes
    'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
    'h2': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
    'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
    'h4': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
    'h5': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
    'h6': ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],
    
    // Body sizes
    'body-lg': ['1.125rem', { lineHeight: '1.7' }],
    'body': ['1rem', { lineHeight: '1.7' }],
    'body-sm': ['0.875rem', { lineHeight: '1.6' }],
    
    // Utility sizes
    'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
    'label': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
    'overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

// Spacing scale based on 4px grid
export const spacing = {
  // Base spacing units
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

// Layout breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Animation system
export const animations = {
  // Duration scale
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
  
  // Common transitions
  transition: {
    all: 'all var(--duration-normal) var(--easing-out)',
    colors: 'color var(--duration-fast) var(--easing-out), background-color var(--duration-fast) var(--easing-out), border-color var(--duration-fast) var(--easing-out)',
    opacity: 'opacity var(--duration-fast) var(--easing-out)',
    shadow: 'box-shadow var(--duration-normal) var(--easing-out)',
    transform: 'transform var(--duration-normal) var(--easing-out)',
  },
} as const

// Shadow system
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

// Border radius system
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

// Z-index scale
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

// Component size variants
export const componentSizes = {
  button: {
    sm: { height: '2rem', padding: '0 0.75rem', fontSize: '0.875rem' },
    default: { height: '2.5rem', padding: '0 1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' },
    xl: { height: '3.5rem', padding: '0 2rem', fontSize: '1.125rem' },
  },
  input: {
    sm: { height: '2rem', padding: '0 0.75rem', fontSize: '0.875rem' },
    default: { height: '2.5rem', padding: '0 1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', padding: '0 1.25rem', fontSize: '1rem' },
  },
  card: {
    sm: { padding: '1rem' },
    default: { padding: '1.5rem' },
    lg: { padding: '2rem' },
  },
} as const

// Utility functions
export const utils = {
  // Get spacing value
  spacing: (key: keyof typeof spacing) => spacing[key],
  
  // Get typography values
  fontSize: (key: keyof typeof typography.fontSize) => typography.fontSize[key],
  
  // Get shadow value
  shadow: (key: keyof typeof shadows) => shadows[key],
  
  // Get border radius value
  borderRadius: (key: keyof typeof borderRadius) => borderRadius[key],
  
  // Create responsive value
  responsive: <T>(values: { [K in keyof typeof breakpoints]?: T } & { default: T }) => {
    return values
  },
  
  // Create CSS custom property
  cssVar: (name: string, fallback?: string) => {
    return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`
  },
  
  // Create media query
  mediaQuery: (breakpoint: keyof typeof breakpoints) => {
    return `@media (min-width: ${breakpoints[breakpoint]})`
  },
} as const

// Design system configuration
export const designSystem = {
  typography,
  spacing,
  breakpoints,
  animations,
  shadows,
  borderRadius,
  zIndex,
  componentSizes,
  utils,
} as const

// Export individual systems for convenience
export {
  typography as typeSystem,
  spacing as spaceSystem,
  animations as animationSystem,
  shadows as shadowSystem,
  borderRadius as radiusSystem,
}

export default designSystem