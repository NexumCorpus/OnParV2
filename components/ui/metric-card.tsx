'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Typography } from '@/components/ui/typography'
import { Stack, Inline } from '@/components/ui/spacing'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  Percent,
  Hash,
  Calendar,
  type LucideIcon
} from 'lucide-react'

const metricCardVariants = cva(
  'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-card border-border/50 hover:border-primary/30 hover:shadow-md',
        elevated: 'bg-card border-border/40 shadow-md hover:shadow-lg hover:border-primary/30',
        gradient: 'bg-gradient-to-br from-card to-muted/20 border-border/40 hover:shadow-lg',
        glass: 'bg-card/80 backdrop-blur-sm border-border/30 hover:bg-card/90',
        success: 'bg-success/5 border-success/20 hover:border-success/40 hover:bg-success/10',
        warning: 'bg-warning/5 border-warning/20 hover:border-warning/40 hover:bg-warning/10',
        destructive: 'bg-destructive/5 border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10',
        info: 'bg-info/5 border-info/20 hover:border-info/40 hover:bg-info/10',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface TrendData {
  value: number
  label: string
  period?: string
  isPositive?: boolean
  isNeutral?: boolean
}

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  trend?: TrendData
  subtitle?: string
  description?: string
  progress?: {
    value: number
    max?: number
    label?: string
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  }
  badge?: {
    text: string
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'
  }
  loading?: boolean
  animated?: boolean
  onClick?: () => void
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({
    className,
    variant,
    size,
    title,
    value,
    icon: Icon,
    iconColor,
    trend,
    subtitle,
    description,
    progress,
    badge,
    loading = false,
    animated = true,
    onClick,
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)

    // Animate value changes
    React.useEffect(() => {
      if (animated && typeof value === 'number') {
        const timer = setTimeout(() => {
          setDisplayValue(value)
        }, 200)
        return () => clearTimeout(timer)
      }
    }, [value, animated])

    // Intersection observer for entrance animation
    React.useEffect(() => {
      if (!animated) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      const element = ref as React.RefObject<HTMLDivElement>
      if (element.current) {
        observer.observe(element.current)
      }

      return () => observer.disconnect()
    }, [animated, ref])

    const getTrendIcon = () => {
      if (!trend) return null
      
      if (trend.isNeutral) return <ArrowRight className="w-4 h-4" />
      if (trend.isPositive) return <TrendingUp className="w-4 h-4" />
      return <TrendingDown className="w-4 h-4" />
    }

    const getTrendColor = () => {
      if (!trend) return 'text-muted-foreground'
      
      if (trend.isNeutral) return 'text-muted-foreground'
      if (trend.isPositive) return 'text-success'
      return 'text-destructive'
    }

    const formatValue = (val: string | number) => {
      if (typeof val === 'number' && animated) {
        return displayValue.toLocaleString()
      }
      return val.toString()
    }

    return (
      <Card
        ref={ref}
        className={cn(
          metricCardVariants({ variant, size }),
          animated && 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
          animated && !isVisible && 'opacity-0 translate-y-4',
          animated && isVisible && 'opacity-100 translate-y-0',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <Typography variant="label" color="muted" className="font-medium">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="muted">
                {subtitle}
              </Typography>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {badge && (
              <Badge variant={badge.variant} size="sm">
                {badge.text}
              </Badge>
            )}
            {Icon && (
              <div className={cn(
                'p-2 rounded-lg transition-colors group-hover:scale-110 duration-300',
                iconColor || 'bg-primary/10 text-primary group-hover:bg-primary/20'
              )}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Stack space={4}>
            {/* Main Value */}
            <div className="space-y-1">
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              ) : (
                <Typography 
                  variant="display-lg" 
                  weight="bold"
                  className={cn(
                    'transition-all duration-700',
                    animated && 'animate-in zoom-in-50 duration-700 delay-300'
                  )}
                >
                  {formatValue(value)}
                </Typography>
              )}
              
              {description && (
                <Typography variant="small" color="muted">
                  {description}
                </Typography>
              )}
            </div>

            {/* Trend Indicator */}
            {trend && !loading && (
              <Inline space={2} align="center" className="text-sm">
                <div className={cn('flex items-center space-x-1', getTrendColor())}>
                  {getTrendIcon()}
                  <span className="font-medium">
                    {Math.abs(trend.value)}%
                  </span>
                </div>
                <Typography variant="small" color="muted">
                  {trend.label}
                  {trend.period && ` ${trend.period}`}
                </Typography>
              </Inline>
            )}

            {/* Progress Bar */}
            {progress && !loading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  {progress.label && (
                    <Typography variant="small" color="muted">
                      {progress.label}
                    </Typography>
                  )}
                  <Typography variant="small" color="muted" className="font-mono">
                    {progress.value}
                    {progress.max && `/${progress.max}`}
                  </Typography>
                </div>
                <Progress
                  value={(progress.value / (progress.max || 100)) * 100}
                  variant={progress.variant}
                  animated
                  className="h-2"
                />
              </div>
            )}
          </Stack>
        </CardContent>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    )
  }
)
MetricCard.displayName = 'MetricCard'

// Specialized metric card variants
export const RevenueCard = React.forwardRef<HTMLDivElement, Omit<MetricCardProps, 'icon' | 'iconColor'>>(
  (props, ref) => (
    <MetricCard
      ref={ref}
      icon={DollarSign}
      iconColor="bg-success/10 text-success group-hover:bg-success/20"
      {...props}
    />
  )
)
RevenueCard.displayName = 'RevenueCard'

export const PercentageCard = React.forwardRef<HTMLDivElement, Omit<MetricCardProps, 'icon' | 'iconColor'>>(
  (props, ref) => (
    <MetricCard
      ref={ref}
      icon={Percent}
      iconColor="bg-info/10 text-info group-hover:bg-info/20"
      {...props}
    />
  )
)
PercentageCard.displayName = 'PercentageCard'

export const CountCard = React.forwardRef<HTMLDivElement, Omit<MetricCardProps, 'icon' | 'iconColor'>>(
  (props, ref) => (
    <MetricCard
      ref={ref}
      icon={Hash}
      iconColor="bg-secondary/10 text-secondary group-hover:bg-secondary/20"
      {...props}
    />
  )
)
CountCard.displayName = 'CountCard'

export const TargetCard = React.forwardRef<HTMLDivElement, Omit<MetricCardProps, 'icon' | 'iconColor'>>(
  (props, ref) => (
    <MetricCard
      ref={ref}
      icon={Target}
      iconColor="bg-warning/10 text-warning group-hover:bg-warning/20"
      {...props}
    />
  )
)
TargetCard.displayName = 'TargetCard'

export const StatusCard = React.forwardRef<HTMLDivElement, Omit<MetricCardProps, 'icon' | 'iconColor'> & {
  status: 'success' | 'warning' | 'error' | 'pending'
}>(({ status, ...props }, ref) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'bg-success/10 text-success group-hover:bg-success/20',
      variant: 'success' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'bg-warning/10 text-warning group-hover:bg-warning/20',
      variant: 'warning' as const,
    },
    error: {
      icon: AlertTriangle,
      iconColor: 'bg-destructive/10 text-destructive group-hover:bg-destructive/20',
      variant: 'destructive' as const,
    },
    pending: {
      icon: Clock,
      iconColor: 'bg-muted/10 text-muted-foreground group-hover:bg-muted/20',
      variant: 'default' as const,
    },
  }

  const config = statusConfig[status]

  return (
    <MetricCard
      ref={ref}
      icon={config.icon}
      iconColor={config.iconColor}
      variant={config.variant}
      {...props}
    />
  )
})
StatusCard.displayName = 'StatusCard'

// Metric card grid container
export interface MetricCardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: number
  className?: string
}

export const MetricCardGrid = React.forwardRef<HTMLDivElement, MetricCardGridProps>(
  ({ children, columns = 4, gap = 6, className }, ref) => {
    const getGridClass = () => {
      const colsMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      }
      return colsMap[columns]
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getGridClass(),
          `gap-${gap}`,
          className
        )}
      >
        {children}
      </div>
    )
  }
)
MetricCardGrid.displayName = 'MetricCardGrid'

export { metricCardVariants }