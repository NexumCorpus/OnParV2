'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
  description?: string
  className?: string
  isGood?: boolean
  loading?: boolean
  prefix?: string
  suffix?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend,
  icon: Icon,
  description,
  className,
  isGood,
  loading = false,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'default'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp
    if (trend === 'down') return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (trend === 'neutral') return 'text-muted-foreground'
    
    if (isGood !== undefined) {
      if (trend === 'up' && isGood) return 'text-green-600'
      if (trend === 'up' && !isGood) return 'text-red-600'
      if (trend === 'down' && isGood) return 'text-red-600'
      if (trend === 'down' && !isGood) return 'text-green-600'
    }
    
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'destructive':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      default:
        return ''
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          title: 'text-xs',
          value: 'text-lg',
          icon: 'h-3 w-3',
          change: 'text-xs'
        }
      case 'lg':
        return {
          card: 'p-8',
          title: 'text-base',
          value: 'text-4xl',
          icon: 'h-6 w-6',
          change: 'text-base'
        }
      default:
        return {
          card: 'p-6',
          title: 'text-sm',
          value: 'text-2xl',
          icon: 'h-4 w-4',
          change: 'text-sm'
        }
    }
  }

  const sizeStyles = getSizeStyles()
  const TrendIcon = getTrendIcon()

  if (loading) {
    return (
      <Card className={cn(getVariantStyles(), className)}>
        <CardContent className={sizeStyles.card}>
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              {Icon && <div className="h-4 w-4 bg-muted rounded"></div>}
            </div>
            <div className="h-8 bg-muted rounded w-24 mb-2"></div>
            {change !== undefined && (
              <div className="h-3 bg-muted rounded w-16"></div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(getVariantStyles(), className)}>
      <CardContent className={sizeStyles.card}>
        <div className="flex items-center justify-between mb-2">
          <p className={cn('font-medium text-muted-foreground', sizeStyles.title)}>
            {title}
          </p>
          {Icon && <Icon className={cn('text-muted-foreground', sizeStyles.icon)} />}
        </div>
        
        <div className="space-y-1">
          <p className={cn('font-bold tracking-tight', sizeStyles.value)}>
            {prefix}{formatValue(value)}{suffix}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={cn('h-3 w-3', getTrendColor())} />
              <span className={cn('font-medium', sizeStyles.change, getTrendColor())}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className={cn('text-muted-foreground', sizeStyles.change)}>
                  {changeLabel}
                </span>
              )}
            </div>
          )}
          
          {description && (
            <p className={cn('text-muted-foreground', sizeStyles.change)}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized metric cards
export function CurrencyMetricCard(props: Omit<MetricCardProps, 'prefix'>) {
  return <MetricCard {...props} prefix="$" />
}

export function PercentageMetricCard(props: Omit<MetricCardProps, 'suffix'>) {
  return <MetricCard {...props} suffix="%" />
}

export function CountMetricCard(props: MetricCardProps) {
  return <MetricCard {...props} />
}

// Metric cards grid container
export function MetricCardsGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {children}
    </div>
  )
}

// Comparison metric card
export function ComparisonMetricCard({
  title,
  currentValue,
  previousValue,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  icon,
  className,
  prefix = '',
  suffix = ''
}: {
  title: string
  currentValue: number
  previousValue: number
  currentLabel?: string
  previousLabel?: string
  icon?: LucideIcon
  className?: string
  prefix?: string
  suffix?: string
}) {
  const change = previousValue !== 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0
  
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{currentLabel}</span>
            <span className="text-2xl font-bold">
              {prefix}{currentValue.toLocaleString()}{suffix}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{previousLabel}</span>
            <span className="text-lg font-medium text-muted-foreground">
              {prefix}{previousValue.toLocaleString()}{suffix}
            </span>
          </div>
          
          {change !== 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Change</span>
              <div className="flex items-center space-x-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                <span className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}