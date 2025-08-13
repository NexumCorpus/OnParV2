import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-[var(--duration-normal)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        outline: "text-foreground border-border bg-background hover:bg-muted hover:text-foreground hover:border-primary/50 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:scale-105",
        ghost: "border-transparent text-foreground hover:bg-muted hover:text-foreground hover:scale-105",
        gradient: "border-transparent bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary-hover shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:scale-105",
      },
      size: {
        sm: "px-2 py-0.5 text-xs h-5",
        default: "px-3 py-1 text-xs h-6",
        lg: "px-4 py-1.5 text-sm h-7",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        ping: "animate-ping",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
}

function Badge({ 
  className, 
  variant, 
  size, 
  animation, 
  icon, 
  dot = false, 
  removable = false, 
  onRemove,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, animation }), className)} {...props}>
      {dot && (
        <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-pulse" />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }