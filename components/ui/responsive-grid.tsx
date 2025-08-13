import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
    autoFit: {
      true: '',
      false: '',
    },
    autoFill: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
    autoFit: false,
    autoFill: false,
  },
})

export interface ResponsiveGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  minItemWidth?: string
}

export const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols, gap, autoFit, autoFill, minItemWidth = '280px', style, ...props }, ref) => {
    const gridStyle = React.useMemo(() => {
      if (autoFit) {
        return {
          ...style,
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        }
      }
      if (autoFill) {
        return {
          ...style,
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        }
      }
      return style
    }, [autoFit, autoFill, minItemWidth, style])

    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ 
            cols: autoFit || autoFill ? undefined : cols, 
            gap 
          }),
          className
        )}
        style={gridStyle}
        {...props}
      />
    )
  }
)
ResponsiveGrid.displayName = 'ResponsiveGrid'

// Specialized grid components for common layouts
export const MetricsGrid = React.forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'cols' | 'autoFit'>
>(({ className, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    cols={4}
    className={cn('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}
    {...props}
  />
))
MetricsGrid.displayName = 'MetricsGrid'

export const CardsGrid = React.forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'autoFit' | 'minItemWidth'>
>(({ className, cols = 3, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    autoFit
    minItemWidth="320px"
    className={className}
    {...props}
  />
))
CardsGrid.displayName = 'CardsGrid'

export const DashboardGrid = React.forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'cols'>
>(({ className, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    cols={12}
    className={cn('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-12', className)}
    {...props}
  />
))
DashboardGrid.displayName = 'DashboardGrid'

// Masonry-style grid for varied content heights
export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: number
}

export const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 4, children, ...props }, ref) => {
    const columnClasses = {
      1: 'columns-1',
      2: 'columns-1 md:columns-2',
      3: 'columns-1 md:columns-2 lg:columns-3',
      4: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4',
      5: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5',
      6: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-6',
    }

    const gapClasses = {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          columnClasses[columns],
          gapClasses[gap as keyof typeof gapClasses] || 'gap-4',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="break-inside-avoid mb-4">
            {child}
          </div>
        ))}
      </div>
    )
  }
)
MasonryGrid.displayName = 'MasonryGrid'

// Flex-based responsive layout
export interface FlexGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: string
  gap?: number
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const FlexGrid = React.forwardRef<HTMLDivElement, FlexGridProps>(
  ({ 
    className, 
    minItemWidth = '280px', 
    gap = 4, 
    justify = 'start',
    align = 'stretch',
    style,
    ...props 
  }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }

    const gapClasses = {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap',
          justifyClasses[justify],
          alignClasses[align],
          gapClasses[gap as keyof typeof gapClasses] || 'gap-4',
          className
        )}
        style={{
          ...style,
        }}
        {...props}
      >
        {React.Children.map(props.children, (child, index) => (
          <div
            key={index}
            style={{ 
              flex: `1 1 ${minItemWidth}`,
              minWidth: minItemWidth,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
FlexGrid.displayName = 'FlexGrid'

export { gridVariants }