/**
 * OnPar Animation System
 * Comprehensive animation utilities and presets
 */

// Animation duration constants
export const DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const

// Easing functions
export const EASINGS = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// Animation presets for common use cases
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS['ease-out-back'] },
  },
  
  scaleInCenter: {
    initial: { opacity: 0, scale: 0.8, transformOrigin: 'center' },
    animate: { opacity: 1, scale: 1, transformOrigin: 'center' },
    exit: { opacity: 0, scale: 0.8, transformOrigin: 'center' },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS['ease-spring'] },
  },
  
  // Slide animations
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
  
  // Bounce animations
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: DURATIONS.slow / 1000, 
      ease: EASINGS['ease-out-back'],
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  
  // Rotation animations
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 },
    transition: { duration: DURATIONS.slow / 1000, ease: EASINGS.out },
  },
  
  // Flip animations
  flipIn: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
    transition: { duration: DURATIONS.slow / 1000, ease: EASINGS.out },
  },
  
  // Stagger animations for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: DURATIONS.normal / 1000, ease: EASINGS.out },
  },
} as const

// CSS animation classes for Tailwind
export const CSS_ANIMATIONS = {
  // Entrance animations
  'animate-fade-in': 'animate-in fade-in-0 duration-300',
  'animate-fade-in-up': 'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
  'animate-fade-in-down': 'animate-in fade-in-0 slide-in-from-top-4 duration-300',
  'animate-fade-in-left': 'animate-in fade-in-0 slide-in-from-left-4 duration-300',
  'animate-fade-in-right': 'animate-in fade-in-0 slide-in-from-right-4 duration-300',
  
  // Scale animations
  'animate-scale-in': 'animate-in zoom-in-95 duration-300',
  'animate-scale-in-bounce': 'animate-in zoom-in-90 duration-500 ease-out',
  
  // Hover animations
  'hover-lift': 'transition-all duration-200 hover:scale-105 hover:shadow-lg',
  'hover-glow': 'transition-all duration-200 hover:shadow-lg hover:shadow-primary/25',
  'hover-float': 'transition-transform duration-300 hover:-translate-y-1',
  
  // Loading animations
  'animate-pulse-soft': 'animate-pulse opacity-70',
  'animate-shimmer': 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
  
  // Success animations
  'animate-success': 'animate-in zoom-in-95 duration-300 ease-out',
  'animate-checkmark': 'animate-in zoom-in-90 duration-500 ease-out',
  
  // Error animations
  'animate-error': 'animate-in shake duration-500',
  'animate-shake': 'animate-bounce duration-500',
} as const

// Utility functions for animations
export const animationUtils = {
  // Create a delay for staggered animations
  createDelay: (index: number, baseDelay = 100) => ({
    animationDelay: `${index * baseDelay}ms`,
  }),
  
  // Create a spring transition
  createSpring: (stiffness = 300, damping = 20) => ({
    type: 'spring',
    stiffness,
    damping,
  }),
  
  // Create a custom easing transition
  createEasing: (duration = DURATIONS.normal, easing = EASINGS.out) => ({
    duration: duration / 1000,
    ease: easing,
  }),
  
  // Create a stagger configuration
  createStagger: (staggerChildren = 0.1, delayChildren = 0) => ({
    staggerChildren,
    delayChildren,
  }),
  
  // Combine multiple animation variants
  combineVariants: (...variants: any[]) => {
    return variants.reduce((combined, variant) => ({
      ...combined,
      ...variant,
    }), {})
  },
  
  // Create responsive animation (disable on mobile if needed)
  createResponsive: (animation: any, disableOnMobile = false) => {
    if (disableOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
      return {
        initial: animation.animate,
        animate: animation.animate,
        exit: animation.animate,
      }
    }
    return animation
  },
  
  // Create reduced motion variant
  createReducedMotion: (animation: any) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    }
    return animation
  },
} as const

// Page transition animations
export const PAGE_TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: EASINGS.out },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3, ease: EASINGS.out },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
    transition: { duration: 0.3, ease: EASINGS.out },
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.3, ease: EASINGS.out },
  },
} as const

// Modal/Dialog animations
export const MODAL_ANIMATIONS = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { duration: 0.2, ease: EASINGS.out },
  },
  
  drawer: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
    transition: { duration: 0.3, ease: EASINGS.out },
  },
} as const

// Export everything
export default {
  DURATIONS,
  EASINGS,
  ANIMATION_PRESETS,
  CSS_ANIMATIONS,
  animationUtils,
  PAGE_TRANSITIONS,
  MODAL_ANIMATIONS,
}