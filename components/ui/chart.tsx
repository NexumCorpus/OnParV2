'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  MoreHorizontal, 
  Download, 
  Maximize2, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react'

// Chart data types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  trend?: number
  metadata?: Record<string, any>
}

export interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  color?: string
  type?: 'line' | 'bar' | 'area'
}

export interface ChartConfig {
  title?: string
  description?: string
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'
  data: ChartSeries[]
  options?: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    showLegend?: boolean
    showGrid?: boolean
    showTooltips?: boolean
    animation?: boolean
    height?: number
    colors?: string[]
  }
}

// Base Chart Container Component
export interface ChartContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  loading?: boolean
  error?: string
  actions?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ 
    children, 
    title, 
    description, 
    className, 
    loading = false, 
    error, 
    actions,
    trend,
    ...props 
  }, ref) => {
    return (
      <Card ref={ref} className={cn('chart-container', className)} {...props}>
        {(title || description || actions || trend) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              {title && (
                <CardTitle className="flex items-center gap-2">
                  {title}
                  {trend && (
                    <Badge 
                      variant={trend.isPositive ? 'success' : 'destructive'}
                      size="sm"
                      className="ml-2"
                    >
                      {trend.isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(trend.value)}%
                    </Badge>
                  )}
                </CardTitle>
              )}
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
              {trend && (
                <Typography variant="small" color="muted">
                  {trend.label}
                </Typography>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </CardHeader>
        )}
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading variant="spinner" size="lg" text="Loading chart data..." />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-center">
              <div className="space-y-2">
                <Typography variant="body" color="muted">
                  Failed to load chart data
                </Typography>
                <Typography variant="small" color="muted">
                  {error}
                </Typography>
              </div>
            </div>
          ) : (
            <div className="chart-wrapper">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
ChartContainer.displayName = 'ChartContainer'

// Simple Chart Components (using CSS and SVG for now, can be replaced with Chart.js later)
export interface SimpleLineChartProps {
  data: ChartDataPoint[]
  height?: number
  color?: string
  showDots?: boolean
  animated?: boolean
  className?: string
}

export const SimpleLineChart = React.forwardRef<HTMLDivElement, SimpleLineChartProps>(
  ({ 
    data, 
    height = 200, 
    color = 'hsl(var(--primary))', 
    showDots = true, 
    animated = true,
    className 
  }, ref) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue || 1

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.value - minValue) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div ref={ref} className={cn('relative', className)} style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className={animated ? 'animate-in slide-in-from-left duration-1000' : ''}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Dots */}
          {showDots && data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((point.value - minValue) / range) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className={cn(
                  'transition-all duration-200 hover:r-3',
                  animated && 'animate-in zoom-in-50 duration-500',
                )}
                style={{
                  animationDelay: animated ? `${index * 100}ms` : '0ms'
                }}
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            )
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2">
          {data.map((point, index) => (
            <span key={index} className="text-center">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    )
  }
)
SimpleLineChart.displayName = 'SimpleLineChart'

// Simple Bar Chart
export interface SimpleBarChartProps {
  data: ChartDataPoint[]
  height?: number
  color?: string
  animated?: boolean
  className?: string
}

export const SimpleBarChart = React.forwardRef<HTMLDivElement, SimpleBarChartProps>(
  ({ 
    data, 
    height = 200, 
    color = 'hsl(var(--primary))', 
    animated = true,
    className 
  }, ref) => {
    const maxValue = Math.max(...data.map(d => d.value))

    return (
      <div ref={ref} className={cn('relative', className)} style={{ height }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((point, index) => {
            const barHeight = (point.value / maxValue) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={cn(
                    'w-full rounded-t-sm transition-all duration-500 hover:opacity-80',
                    animated && 'animate-in slide-in-from-bottom duration-700'
                  )}
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: point.color || color,
                    animationDelay: animated ? `${index * 100}ms` : '0ms'
                  }}
                  title={`${point.label}: ${point.value}`}
                />
                <span className="text-xs text-muted-foreground mt-2 text-center">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
SimpleBarChart.displayName = 'SimpleBarChart'

// Simple Pie Chart (using CSS conic-gradient)
export interface SimplePieChartProps {
  data: ChartDataPoint[]
  size?: number
  showLabels?: boolean
  className?: string
}

export const SimplePieChart = React.forwardRef<HTMLDivElement, SimplePieChartProps>(
  ({ data, size = 200, showLabels = true, className }, ref) => {
    const total = data.reduce((sum, point) => sum + point.value, 0)
    let currentAngle = 0

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--destructive))',
      'hsl(var(--info))',
    ]

    return (
      <div ref={ref} className={cn('flex items-center space-x-6', className)}>
        <div
          className="relative rounded-full"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((point, index) => {
              const percentage = (point.value / total) * 100
              const angle = (point.value / total) * 360
              const radius = size / 2 - 10
              const centerX = size / 2
              const centerY = size / 2
              
              const startAngle = (currentAngle * Math.PI) / 180
              const endAngle = ((currentAngle + angle) * Math.PI) / 180
              
              const x1 = centerX + radius * Math.cos(startAngle)
              const y1 = centerY + radius * Math.sin(startAngle)
              const x2 = centerX + radius * Math.cos(endAngle)
              const y2 = centerY + radius * Math.sin(endAngle)
              
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              currentAngle += angle
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={point.color || colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                >
                  <title>{`${point.label}: ${point.value} (${percentage.toFixed(1)}%)`}</title>
                </path>
              )
            })}
          </svg>
        </div>
        
        {showLabels && (
          <div className="space-y-2">
            {data.map((point, index) => {
              const percentage = ((point.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: point.color || colors[index % colors.length] }}
                  />
                  <Typography variant="small">
                    {point.label}: {percentage}%
                  </Typography>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
SimplePieChart.displayName = 'SimplePieChart'

// Chart Actions
export const ChartActions = ({ onDownload, onExpand }: {
  onDownload?: () => void
  onExpand?: () => void
}) => (
  <div className="flex items-center space-x-1">
    {onDownload && (
      <Button variant="ghost" size="icon-sm" onClick={onDownload}>
        <Download className="h-4 w-4" />
      </Button>
    )}
    {onExpand && (
      <Button variant="ghost" size="icon-sm" onClick={onExpand}>
        <Maximize2 className="h-4 w-4" />
      </Button>
    )}
    <Button variant="ghost" size="icon-sm">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </div>
)

// Chart Type Icons
export const ChartTypeIcon = ({ type, className }: { 
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  className?: string 
}) => {
  const icons = {
    line: LineChart,
    bar: BarChart3,
    pie: PieChart,
    area: Activity,
    scatter: Activity,
  }
  
  const Icon = icons[type]
  return <Icon className={className} />
}

// Export chart utilities
export const chartUtils = {
  // Generate sample data
  generateSampleData: (count: number, min = 0, max = 100): ChartDataPoint[] => {
    return Array.from({ length: count }, (_, i) => ({
      label: `Point ${i + 1}`,
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    }))
  },
  
  // Format chart data for different chart types
  formatForLineChart: (data: any[]): ChartDataPoint[] => {
    return data.map(item => ({
      label: item.label || item.name || 'Unknown',
      value: Number(item.value) || 0,
    }))
  },
  
  // Calculate trend from data points
  calculateTrend: (data: ChartDataPoint[]): { value: number; isPositive: boolean } => {
    if (data.length < 2) return { value: 0, isPositive: true }
    
    const first = data[0].value
    const last = data[data.length - 1].value
    const change = ((last - first) / first) * 100
    
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    }
  },
  
  // Get chart colors based on theme
  getThemeColors: (isDark: boolean) => ({
    primary: isDark ? 'hsl(158 64% 57%)' : 'hsl(158 64% 52%)',
    secondary: isDark ? 'hsl(199 89% 53%)' : 'hsl(199 89% 48%)',
    success: isDark ? 'hsl(142 76% 41%)' : 'hsl(142 76% 36%)',
    warning: isDark ? 'hsl(45 93% 52%)' : 'hsl(45 93% 47%)',
    destructive: isDark ? 'hsl(0 84% 65%)' : 'hsl(0 84% 60%)',
    info: isDark ? 'hsl(217 91% 65%)' : 'hsl(217 91% 60%)',
  }),
}