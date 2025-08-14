import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] active:scale-[0.98] border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] active:scale-[0.98] border border-secondary/20",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] active:scale-[0.98] border border-success/20",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] active:scale-[0.98] border border-warning/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] active:scale-[0.98] border border-destructive/20",
        outline: "border-2 border-border bg-background hover:bg-surface hover:text-foreground hover:border-primary/50 hover:shadow-[var(--shadow-sm)] hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98] p-0 h-auto",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary-hover shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] active:scale-[0.98] border-0",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[var(--radius)]",
        default: "h-10 px-4 py-2 text-sm rounded-[var(--radius-md)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-lg)]",
        xl: "h-14 px-8 text-lg rounded-[var(--radius-xl)] font-bold",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
        "icon-sm": "h-8 w-8 rounded-[var(--radius)]",
        "icon-lg": "h-12 w-12 rounded-[var(--radius-lg)]",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        <div className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }