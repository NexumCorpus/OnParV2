import { useState, useEffect } from 'react'

// Breakpoint definitions matching Tailwind CSS
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof breakpoints

// Hook to get current breakpoint
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm')
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else {
        setCurrentBreakpoint('sm')
      }
    }

    // Set initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    currentBreakpoint,
    windowWidth,
    isSmall: currentBreakpoint === 'sm',
    isMedium: currentBreakpoint === 'md',
    isLarge: currentBreakpoint === 'lg',
    isXLarge: currentBreakpoint === 'xl',
    is2XLarge: currentBreakpoint === '2xl',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl',
    isMobile: currentBreakpoint === 'sm' || currentBreakpoint === 'md',
  }
}

// Hook to check if screen is at least a certain breakpoint
export function useMediaQuery(breakpoint: Breakpoint) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return matches
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
  default: T
}): T {
  const { currentBreakpoint } = useBreakpoint()

  // Return the value for the current breakpoint or fall back to smaller breakpoints
  if (values[currentBreakpoint]) {
    return values[currentBreakpoint]!
  }

  // Fallback logic
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp]) {
      return values[bp]!
    }
  }

  return values.default
}

// Hook to detect mobile devices
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}

// Hook to detect touch devices
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      )
    }

    checkTouch()
  }, [])

  return isTouchDevice
}

// Hook for container queries (experimental)
export function useContainerQuery(containerRef: React.RefObject<HTMLElement>, breakpoint: number) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMatches(entry.contentRect.width >= breakpoint)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [containerRef, breakpoint])

  return matches
}

// Utility functions
export const breakpointUtils = {
  // Get breakpoint value
  getBreakpointValue: (breakpoint: Breakpoint) => breakpoints[breakpoint],
  
  // Check if current width matches breakpoint
  matchesBreakpoint: (width: number, breakpoint: Breakpoint) => width >= breakpoints[breakpoint],
  
  // Get all breakpoints
  getAllBreakpoints: () => breakpoints,
  
  // Create media query string
  createMediaQuery: (breakpoint: Breakpoint) => `(min-width: ${breakpoints[breakpoint]}px)`,
  
  // Get next smaller breakpoint
  getSmallerBreakpoint: (breakpoint: Breakpoint): Breakpoint | null => {
    const order: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
    const index = order.indexOf(breakpoint)
    return index > 0 ? order[index - 1] : null
  },
  
  // Get next larger breakpoint
  getLargerBreakpoint: (breakpoint: Breakpoint): Breakpoint | null => {
    const order: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
    const index = order.indexOf(breakpoint)
    return index < order.length - 1 ? order[index + 1] : null
  },
}

export { breakpoints }
export type { Breakpoint }