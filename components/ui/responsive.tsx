import * as React from 'react'
import { useBreakpoint, useMediaQuery, useResponsiveValue } from '@/hooks/use-breakpoint'
import type { Breakpoint } from '@/hooks/use-breakpoint'

// Show/Hide components based on breakpoints
interface ShowProps {
  above?: Breakpoint
  below?: Breakpoint
  only?: Breakpoint | Breakpoint[]
  children: React.ReactNode
}

export function Show({ above, below, only, children }: ShowProps) {
  const { currentBreakpoint } = useBreakpoint()
  
  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  
  let shouldShow = true
  
  if (above) {
    const aboveIndex = breakpointOrder.indexOf(above)
    shouldShow = shouldShow && currentIndex >= aboveIndex
  }
  
  if (below) {
    const belowIndex = breakpointOrder.indexOf(below)
    shouldShow = shouldShow && currentIndex < belowIndex
  }
  
  if (only) {
    const onlyBreakpoints = Array.isArray(only) ? only : [only]
    shouldShow = shouldShow && onlyBreakpoints.includes(currentBreakpoint)
  }
  
  return shouldShow ? <>{children}</> : null
}

export function Hide({ above, below, only, children }: ShowProps) {
  const { currentBreakpoint } = useBreakpoint()
  
  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  
  let shouldHide = false
  
  if (above) {
    const aboveIndex = breakpointOrder.indexOf(above)
    shouldHide = shouldHide || currentIndex >= aboveIndex
  }
  
  if (below) {
    const belowIndex = breakpointOrder.indexOf(below)
    shouldHide = shouldHide || currentIndex < belowIndex
  }
  
  if (only) {
    const onlyBreakpoints = Array.isArray(only) ? only : [only]
    shouldHide = shouldHide || onlyBreakpoints.includes(currentBreakpoint)
  }
  
  return !shouldHide ? <>{children}</> : null
}

// Responsive text component
interface ResponsiveTextProps {
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
  default: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export function ResponsiveText({ 
  sm, md, lg, xl, '2xl': xl2, default: defaultText, as: Component = 'span', className 
}: ResponsiveTextProps) {
  const text = useResponsiveValue({
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    default: defaultText,
  })
  
  return <Component className={className}>{text}</Component>
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  sm?: number
  md?: number
  lg?: number
  xl?: number
  '2xl'?: number
  default: number
  axis?: 'x' | 'y' | 'both'
  className?: string
}

export function ResponsiveSpacing({ 
  sm, md, lg, xl, '2xl': xl2, default: defaultSpacing, axis = 'both', className 
}: ResponsiveSpacingProps) {
  const spacing = useResponsiveValue({
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    default: defaultSpacing,
  })
  
  const getSpacingClass = (value: number) => {
    switch (axis) {
      case 'x':
        return `px-${value}`
      case 'y':
        return `py-${value}`
      default:
        return `p-${value}`
    }
  }
  
  return <div className={`${getSpacingClass(spacing)} ${className || ''}`} />
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
    default: string
  }
  padding?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
    default: string
  }
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth,
  padding 
}: ResponsiveContainerProps) {
  const containerMaxWidth = maxWidth ? useResponsiveValue(maxWidth) : 'none'
  const containerPadding = padding ? useResponsiveValue(padding) : '1rem'
  
  return (
    <div 
      className={`mx-auto ${className || ''}`}
      style={{
        maxWidth: containerMaxWidth,
        padding: containerPadding,
      }}
    >
      {children}
    </div>
  )
}

// Responsive grid columns
interface ResponsiveColumnsProps {
  children: React.ReactNode
  columns: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
    default: number
  }
  gap?: number
  className?: string
}

export function ResponsiveColumns({ 
  children, 
  columns, 
  gap = 4, 
  className 
}: ResponsiveColumnsProps) {
  const columnCount = useResponsiveValue(columns)
  
  const getGridClass = (cols: number) => {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    }
    return colsMap[cols] || 'grid-cols-1'
  }
  
  return (
    <div className={`grid ${getGridClass(columnCount)} gap-${gap} ${className || ''}`}>
      {children}
    </div>
  )
}

// Mobile/Desktop specific components
export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <Show below="lg">{children}</Show>
}

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <Show above="lg">{children}</Show>
}

export function TabletOnly({ children }: { children: React.ReactNode }) {
  return <Show only={['md', 'lg']}>{children}</Show>
}

// Responsive image component
interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
  alt: string
}

export function ResponsiveImage({ 
  src, 
  mobileSrc, 
  tabletSrc, 
  desktopSrc, 
  alt, 
  className,
  ...props 
}: ResponsiveImageProps) {
  const { isMobile, currentBreakpoint } = useBreakpoint()
  
  const getImageSrc = () => {
    if (currentBreakpoint === 'sm' && mobileSrc) return mobileSrc
    if ((currentBreakpoint === 'md' || currentBreakpoint === 'lg') && tabletSrc) return tabletSrc
    if ((currentBreakpoint === 'xl' || currentBreakpoint === '2xl') && desktopSrc) return desktopSrc
    return src
  }
  
  return (
    <img 
      src={getImageSrc()} 
      alt={alt} 
      className={className}
      {...props}
    />
  )
}

// Hook-based responsive component
interface UseResponsiveProps<T> {
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
  default: T
}

export function useResponsive<T>(values: UseResponsiveProps<T>): T {
  return useResponsiveValue(values)
}

// Responsive render prop component
interface ResponsiveRenderProps {
  children: (breakpoint: {
    currentBreakpoint: Breakpoint
    isSmall: boolean
    isMedium: boolean
    isLarge: boolean
    isXLarge: boolean
    is2XLarge: boolean
    isDesktop: boolean
    isMobile: boolean
  }) => React.ReactNode
}

export function ResponsiveRender({ children }: ResponsiveRenderProps) {
  const breakpointInfo = useBreakpoint()
  return <>{children(breakpointInfo)}</>
}

export {
  useBreakpoint,
  useMediaQuery,
  useResponsiveValue,
}