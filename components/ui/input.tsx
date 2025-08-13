import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-[var(--radius-md)] border-2 bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-[var(--duration-normal)]",
  {
    variants: {
      variant: {
        default: "border-border bg-background hover:border-border/80 focus-visible:border-primary/60",
        filled: "border-transparent bg-muted hover:bg-muted/80 focus-visible:bg-background focus-visible:border-primary/60",
        ghost: "border-transparent bg-transparent hover:bg-muted/50 focus-visible:bg-muted focus-visible:border-primary/60",
        success: "border-success/30 bg-success/5 focus-visible:border-success/60 focus-visible:ring-success/20",
        warning: "border-warning/30 bg-warning/5 focus-visible:border-warning/60 focus-visible:ring-warning/20",
        destructive: "border-destructive/30 bg-destructive/5 focus-visible:border-destructive/60 focus-visible:ring-destructive/20",
      },
      size: {
        sm: "h-8 px-3 py-1 text-sm",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
        xl: "h-14 px-6 py-4 text-lg",
      },
      animation: {
        none: "",
        focus: "focus-visible:scale-[1.02]",
        glow: "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]",
        lift: "focus-visible:shadow-[var(--shadow-md)] focus-visible:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "focus",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  success?: boolean
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    type, 
    leftIcon, 
    rightIcon, 
    error, 
    success, 
    loading,
    disabled,
    ...props 
  }, ref) => {
    // Determine variant based on state
    const finalVariant = React.useMemo(() => {
      if (error) return "destructive"
      if (success) return "success"
      return variant
    }, [error, success, variant])

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: finalVariant, size, animation }),
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      />
    )

    if (leftIcon || rightIcon || loading) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {(rightIcon || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

// Enhanced Input with floating label
export interface FloatingInputProps extends InputProps {
  label: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn("peer", className)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=" "
          {...props}
        />
        <label
          className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary",
            (focused || hasValue) && "top-2 text-xs text-primary"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { Input, inputVariants }