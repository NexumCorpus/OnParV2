import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display variants for hero sections
      "display-2xl": "text-display-2xl font-black tracking-tight",
      "display-xl": "text-display-xl font-extrabold tracking-tight",
      "display-lg": "text-display-lg font-bold tracking-tight",
      
      // Heading variants
      h1: "text-h1 font-bold tracking-tight",
      h2: "text-h2 font-semibold tracking-tight",
      h3: "text-h3 font-semibold tracking-tight",
      h4: "text-h4 font-semibold tracking-tight",
      h5: "text-h5 font-medium",
      h6: "text-h6 font-medium",
      
      // Body variants
      "body-lg": "text-body-lg leading-relaxed",
      body: "text-body leading-relaxed",
      "body-sm": "text-body-sm leading-normal",
      
      // Utility variants
      caption: "text-caption font-medium tracking-wide",
      label: "text-label font-medium",
      overline: "text-overline font-semibold tracking-widest uppercase",
      mono: "text-mono font-mono text-sm",
      
      // Special variants
      lead: "text-xl text-muted-foreground leading-relaxed",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
      info: "text-info",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    align: "left",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements
  gradient?: boolean
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, weight, as, gradient = false, ...props }, ref) => {
    const Component = as || getDefaultElement(variant)
    
    return (
      <Component
        className={cn(
          typographyVariants({ variant, color, align, weight }),
          gradient && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

// Helper function to determine default HTML element based on variant
function getDefaultElement(variant: string | null | undefined): keyof JSX.IntrinsicElements {
  switch (variant) {
    case "display-2xl":
    case "display-xl":
    case "display-lg":
    case "h1":
      return "h1"
    case "h2":
      return "h2"
    case "h3":
      return "h3"
    case "h4":
      return "h4"
    case "h5":
      return "h5"
    case "h6":
      return "h6"
    case "caption":
    case "label":
    case "overline":
    case "small":
    case "muted":
      return "span"
    case "mono":
      return "code"
    default:
      return "p"
  }
}

// Convenience components for common use cases
export const Heading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & { level: 1 | 2 | 3 | 4 | 5 | 6 }
>(({ level, ...props }, ref) => (
  <Typography
    variant={`h${level}` as any}
    as={`h${level}` as any}
    ref={ref}
    {...props}
  />
))
Heading.displayName = "Heading"

export const Text = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} {...props} />
)
Text.displayName = "Text"

export const Display = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & { size: "2xl" | "xl" | "lg" }
>(({ size, ...props }, ref) => (
  <Typography
    variant={`display-${size}` as any}
    as="h1"
    ref={ref}
    {...props}
  />
))
Display.displayName = "Display"

export const Label = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography variant="label" as="span" ref={ref} {...props} />
)
Label.displayName = "Label"

export const Caption = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography variant="caption" as="span" ref={ref} {...props} />
)
Caption.displayName = "Caption"

export const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography variant="mono" as="code" ref={ref} {...props} />
)
Code.displayName = "Code"

export { Typography, typographyVariants }