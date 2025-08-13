import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from "@/lib/utils"

const loadingVariants = cva("", {
  variants: {
    variant: {
      spinner: "animate-spin rounded-full border-2 border-muted border-t-primary",
      dots: "flex space-x-1",
      pulse: "rounded-full bg-primary animate-pulse",
      bars: "flex space-x-1 items-end",
      wave: "flex space-x-0.5 items-center",
      orbit: "relative",
      skeleton: "animate-pulse bg-muted rounded",
      icon: "animate-spin",
    },
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    color: {
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      destructive: "",
      muted: "",
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "md",
    color: "primary",
  },
})

export interface LoadingProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string
}

export function Loading({ 
  className, 
  variant = "icon",
  size = "md",
  color = "primary",
  text,
  ...props 
}: LoadingProps) {
  const sizeMap = {
    xs: { spinner: "w-3 h-3", dot: "w-1 h-1", bar: "w-0.5 h-2", icon: "h-3 w-3" },
    sm: { spinner: "w-4 h-4", dot: "w-1.5 h-1.5", bar: "w-0.5 h-3", icon: "h-4 w-4" },
    md: { spinner: "w-6 h-6", dot: "w-2 h-2", bar: "w-1 h-4", icon: "h-6 w-6" },
    lg: { spinner: "w-8 h-8", dot: "w-3 h-3", bar: "w-1 h-6", icon: "h-8 w-8" },
    xl: { spinner: "w-12 h-12", dot: "w-4 h-4", bar: "w-1.5 h-8", icon: "h-12 w-12" },
  }

  const colorMap = {
    primary: "text-primary border-t-primary bg-primary",
    secondary: "text-secondary border-t-secondary bg-secondary", 
    success: "text-success border-t-success bg-success",
    warning: "text-warning border-t-warning bg-warning",
    destructive: "text-destructive border-t-destructive bg-destructive",
    muted: "text-muted-foreground border-t-muted-foreground bg-muted-foreground",
  }

  const renderIcon = () => (
    <Loader2 className={cn(
      loadingVariants({ variant: "icon" }),
      sizeMap[size].icon,
      colorMap[color],
      className
    )} />
  )

  const renderSpinner = () => (
    <div 
      className={cn(
        loadingVariants({ variant: "spinner" }),
        sizeMap[size].spinner,
        colorMap[color],
        className
      )}
      {...props}
    />
  )

  const renderDots = () => (
    <div className={cn(loadingVariants({ variant: "dots" }), className)} {...props}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            sizeMap[size].dot,
            colorMap[color]
          )}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div 
      className={cn(
        loadingVariants({ variant: "pulse" }),
        sizeMap[size].spinner,
        colorMap[color],
        className
      )}
      {...props}
    />
  )

  const renderBars = () => (
    <div className={cn(loadingVariants({ variant: "bars" }), className)} {...props}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-sm",
            sizeMap[size].bar,
            colorMap[color]
          )}
          style={{ 
            animationDelay: `${i * 100}ms`,
            animationDuration: "1s"
          }}
        />
      ))}
    </div>
  )

  const renderWave = () => (
    <div className={cn(loadingVariants({ variant: "wave" }), className)} {...props}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            sizeMap[size].dot,
            colorMap[color]
          )}
          style={{ 
            animationDelay: `${i * 100}ms`,
            animationDuration: "1.4s"
          }}
        />
      ))}
    </div>
  )

  const renderOrbit = () => (
    <div 
      className={cn(
        loadingVariants({ variant: "orbit" }),
        sizeMap[size].spinner,
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 animate-spin">
        <div className={cn(
          "absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full",
          sizeMap[size].dot,
          colorMap[color]
        )} />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}>
        <div className={cn(
          "absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full",
          sizeMap[size].dot,
          colorMap[color]
        )} />
      </div>
    </div>
  )

  const renderSkeleton = () => (
    <div 
      className={cn(
        loadingVariants({ variant: "skeleton" }),
        "h-4 w-full",
        className
      )}
      {...props}
    />
  )

  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return renderSpinner()
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "bars":
        return renderBars()
      case "wave":
        return renderWave()
      case "orbit":
        return renderOrbit()
      case "skeleton":
        return renderSkeleton()
      default:
        return renderIcon()
    }
  }

  if (text) {
    return (
      <div className="flex items-center justify-center space-x-3">
        {renderLoading()}
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
      </div>
    )
  }

  return renderLoading()
}

// Enhanced loading page with OnPar branding
export function LoadingPage({ message = "Loading OnPar Dashboard" }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background">
      <div className="text-center space-y-6">
        <div className="relative">
          <Loading variant="orbit" size="xl" color="primary" />
          <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{message}</h3>
          <p className="text-muted-foreground">Preparing your restaurant insights...</p>
        </div>
      </div>
    </div>
  )
}

// Simple spinner for inline use
export function LoadingSpinner({ className, size = "sm" }: { className?: string, size?: "xs" | "sm" | "md" | "lg" }) {
  return <Loading variant="icon" size={size} className={className} />
}

// Skeleton components for loading states
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  avatar?: boolean
}

export function Skeleton({ className, lines = 1, avatar = false, ...props }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)} {...props}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-muted h-10 w-10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-muted rounded",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export { loadingVariants }