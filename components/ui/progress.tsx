import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full shadow-inner transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-muted",
        success: "bg-success/20",
        warning: "bg-warning/20",
        destructive: "bg-destructive/20",
        info: "bg-info/20",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-700 ease-out relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-hover",
        success: "bg-gradient-to-r from-success to-success/80",
        warning: "bg-gradient-to-r from-warning to-warning/80",
        destructive: "bg-gradient-to-r from-destructive to-destructive/80",
        info: "bg-gradient-to-r from-info to-info/80",
        gradient: "bg-gradient-to-r from-primary via-secondary to-info",
      },
      animated: {
        true: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-100%] after:animate-[shimmer_2s_infinite]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  animated?: boolean
  showValue?: boolean
  label?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, variant, size, animated = false, showValue = false, label, value, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0)
  
  // Animate value changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value || 0)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground font-mono">
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ variant, size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant, animated }))}
          style={{ transform: `translateX(-${100 - displayValue}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Circular Progress Component
export interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  variant?: "default" | "success" | "warning" | "destructive" | "info"
  showValue?: boolean
  animated?: boolean
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    value, 
    size = 40, 
    strokeWidth = 4, 
    className, 
    variant = "default",
    showValue = false,
    animated = true,
    ...props 
  }, ref) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    const colorMap = {
      default: "stroke-primary",
      success: "stroke-success",
      warning: "stroke-warning",
      destructive: "stroke-destructive",
      info: "stroke-info",
    }

    return (
      <div 
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted opacity-20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              colorMap[variant],
              animated && "transition-all duration-700 ease-out"
            )}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-foreground">
              {Math.round(value)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { Progress, progressVariants }