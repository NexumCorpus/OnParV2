import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] border px-6 py-5 text-sm shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-normal)] [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-6 [&>svg]:top-6 [&>svg]:text-current animate-in slide-in-from-top-2 fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border/60",
        success: "border-success/30 text-success-foreground bg-success/10 [&>svg]:text-success",
        warning: "border-warning/30 text-warning-foreground bg-warning/10 [&>svg]:text-warning",
        destructive: "border-destructive/30 text-destructive-foreground bg-destructive/10 [&>svg]:text-destructive",
        info: "border-info/30 text-info-foreground bg-info/10 [&>svg]:text-info",
      },
      size: {
        sm: "px-4 py-3 text-xs",
        default: "px-6 py-5 text-sm",
        lg: "px-8 py-6 text-base",
      },
      animation: {
        none: "",
        slide: "animate-in slide-in-from-top-2 fade-in-0 duration-300",
        bounce: "animate-in bounce-in-from-top duration-500",
        fade: "animate-in fade-in-0 duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "slide",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, animation, dismissible = false, onDismiss, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, size, animation }), className)}
      {...props}
    >
      {icon && <div className="absolute left-6 top-6">{icon}</div>}
      <div className={cn(icon && "pl-8")}>
        {children}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-2 font-bold leading-none tracking-tight text-base", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed [&_p]:leading-relaxed font-medium", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }