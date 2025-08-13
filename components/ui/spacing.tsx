import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const stackVariants = cva("flex flex-col", {
  variants: {
    space: {
      0: "space-y-0",
      1: "space-y-1",
      2: "space-y-2",
      3: "space-y-3",
      4: "space-y-4",
      5: "space-y-5",
      6: "space-y-6",
      8: "space-y-8",
      10: "space-y-10",
      12: "space-y-12",
      16: "space-y-16",
      20: "space-y-20",
      24: "space-y-24",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
  },
  defaultVariants: {
    space: 4,
    align: "stretch",
    justify: "start",
  },
})

const inlineVariants = cva("flex flex-row", {
  variants: {
    space: {
      0: "space-x-0",
      1: "space-x-1",
      2: "space-x-2",
      3: "space-x-3",
      4: "space-x-4",
      5: "space-x-5",
      6: "space-x-6",
      8: "space-x-8",
      10: "space-x-10",
      12: "space-x-12",
      16: "space-x-16",
      20: "space-x-20",
      24: "space-x-24",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    space: 4,
    align: "center",
    justify: "start",
    wrap: false,
  },
})

const containerVariants = cva("w-full mx-auto", {
  variants: {
    size: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
      prose: "max-w-prose",
    },
    padding: {
      none: "",
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
      xl: "px-12",
    },
  },
  defaultVariants: {
    size: "xl",
    padding: "md",
  },
})

// Stack Component - Vertical spacing
export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, space, align, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ space, align, justify }), className)}
      {...props}
    />
  )
)
Stack.displayName = "Stack"

// Inline Component - Horizontal spacing
export interface InlineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineVariants> {}

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, space, align, justify, wrap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(inlineVariants({ space, align, justify, wrap }), className)}
      {...props}
    />
  )
)
Inline.displayName = "Inline"

// Container Component - Content width constraints
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  )
)
Container.displayName = "Container"

// Spacer Component - Flexible spacing
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof spacerSizes
  axis?: "horizontal" | "vertical" | "both"
}

const spacerSizes = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
  "4xl": "6rem",
  "5xl": "8rem",
} as const

export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = "md", axis = "vertical", style, ...props }, ref) => {
    const spacerStyle = React.useMemo(() => {
      const sizeValue = spacerSizes[size]
      
      switch (axis) {
        case "horizontal":
          return { width: sizeValue, height: "1px", ...style }
        case "vertical":
          return { height: sizeValue, width: "1px", ...style }
        case "both":
          return { width: sizeValue, height: sizeValue, ...style }
        default:
          return style
      }
    }, [size, axis, style])

    return (
      <div
        ref={ref}
        className={cn("flex-shrink-0", className)}
        style={spacerStyle}
        {...props}
      />
    )
  }
)
Spacer.displayName = "Spacer"

// Grid Component - CSS Grid layouts
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: keyof typeof stackVariants.variants.space
  responsive?: boolean
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 4, responsive = true, ...props }, ref) => {
    const gridClass = React.useMemo(() => {
      const baseClass = "grid"
      const colsClass = responsive 
        ? `grid-cols-1 md:grid-cols-${Math.min(cols, 2)} lg:grid-cols-${cols}`
        : `grid-cols-${cols}`
      const gapClass = `gap-${gap}`
      
      return cn(baseClass, colsClass, gapClass)
    }, [cols, gap, responsive])

    return (
      <div
        ref={ref}
        className={cn(gridClass, className)}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

// Section Component - Page sections with consistent spacing
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "tight" | "normal" | "loose" | "xl"
  as?: keyof JSX.IntrinsicElements
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "normal", as: Component = "section", ...props }, ref) => {
    const spacingClass = React.useMemo(() => {
      switch (spacing) {
        case "tight":
          return "py-8 lg:py-12"
        case "normal":
          return "py-16 lg:py-20"
        case "loose":
          return "py-24 lg:py-32"
        case "xl":
          return "py-32 lg:py-40"
        default:
          return "py-16 lg:py-20"
      }
    }, [spacing])

    return (
      <Component
        ref={ref}
        className={cn(spacingClass, className)}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"

// Export all variants for external use
export { stackVariants, inlineVariants, containerVariants }