/**
 * Chart Utilities for OnPar Analytics
 * Data processing and formatting utilities for charts
 */

import { ChartDataPoint, ChartSeries } from '@/components/ui/chart'

// Data transformation utilities
export const dataTransforms = {
  // Convert raw data to chart format
  toChartData: (data: any[], labelKey: string, valueKey: string): ChartDataPoint[] => {
    return data.map(item => ({
      label: item[labelKey]?.toString() || 'Unknown',
      value: Number(item[valueKey]) || 0,
      metadata: item,
    }))
  },

  // Group data by category
  groupByCategory: (data: any[], categoryKey: string, valueKey: string): ChartDataPoint[] => {
    const grouped = data.reduce((acc, item) => {
      const category = item[categoryKey] || 'Other'
      const value = Number(item[valueKey]) || 0
      
      if (acc[category]) {
        acc[category] += value
      } else {
        acc[category] = value
      }
      
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }))
  },

  // Calculate moving average
  movingAverage: (data: ChartDataPoint[], window: number): ChartDataPoint[] => {
    if (window <= 1) return data
    
    return data.map((point, index) => {
      const start = Math.max(0, index - Math.floor(window / 2))
      const end = Math.min(data.length, start + window)
      const slice = data.slice(start, end)
      const average = slice.reduce((sum, p) => sum + p.value, 0) / slice.length
      
      return {
        ...point,
        value: average,
      }
    })
  },

  // Calculate percentage change
  percentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  },

  // Normalize data to 0-100 scale
  normalize: (data: ChartDataPoint[]): ChartDataPoint[] => {
    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1

    return data.map(point => ({
      ...point,
      value: ((point.value - min) / range) * 100,
    }))
  },

  // Fill missing periods with zero values
  fillMissingPeriods: (
    data: ChartDataPoint[], 
    allPeriods: string[]
  ): ChartDataPoint[] => {
    const dataMap = new Map(data.map(d => [d.label, d]))
    
    return allPeriods.map(period => 
      dataMap.get(period) || { label: period, value: 0 }
    )
  },

  // Sort data by value or label
  sortData: (
    data: ChartDataPoint[], 
    by: 'value' | 'label' = 'value', 
    order: 'asc' | 'desc' = 'desc'
  ): ChartDataPoint[] => {
    return [...data].sort((a, b) => {
      const aVal = by === 'value' ? a.value : a.label
      const bVal = by === 'value' ? b.value : b.label
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  },
}

// Statistical calculations
export const statistics = {
  // Calculate mean
  mean: (values: number[]): number => {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  },

  // Calculate median
  median: (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  },

  // Calculate standard deviation
  standardDeviation: (values: number[]): number => {
    const mean = statistics.mean(values)
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = statistics.mean(squaredDiffs)
    return Math.sqrt(avgSquaredDiff)
  },

  // Calculate correlation between two datasets
  correlation: (x: number[], y: number[]): number => {
    if (x.length !== y.length) return 0
    
    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.reduce((sum, val) => sum + val * val, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  },

  // Calculate trend (linear regression slope)
  trend: (data: ChartDataPoint[]): { slope: number; direction: 'up' | 'down' | 'flat' } => {
    if (data.length < 2) return { slope: 0, direction: 'flat' }
    
    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, point) => sum + point.value, 0)
    const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    return {
      slope,
      direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'flat'
    }
  },

  // Calculate forecast using simple linear regression
  forecast: (data: ChartDataPoint[], periods: number): ChartDataPoint[] => {
    const trendData = statistics.trend(data)
    const lastValue = data[data.length - 1]?.value || 0
    const lastIndex = data.length - 1
    
    return Array.from({ length: periods }, (_, i) => ({
      label: `Forecast ${i + 1}`,
      value: Math.max(0, lastValue + trendData.slope * (i + 1)),
    }))
  },
}

// Color utilities for charts
export const chartColors = {
  // Get color palette for charts
  getPalette: (count: number, theme: 'light' | 'dark' = 'light'): string[] => {
    const lightColors = [
      'hsl(158 64% 52%)', // Primary
      'hsl(199 89% 48%)', // Secondary
      'hsl(142 76% 36%)', // Success
      'hsl(45 93% 47%)',  // Warning
      'hsl(0 84% 60%)',   // Destructive
      'hsl(217 91% 60%)', // Info
      'hsl(262 83% 58%)', // Purple
      'hsl(24 70% 56%)',  // Orange
    ]
    
    const darkColors = [
      'hsl(158 64% 57%)',
      'hsl(199 89% 53%)',
      'hsl(142 76% 41%)',
      'hsl(45 93% 52%)',
      'hsl(0 84% 65%)',
      'hsl(217 91% 65%)',
      'hsl(262 83% 63%)',
      'hsl(24 70% 61%)',
    ]
    
    const colors = theme === 'dark' ? darkColors : lightColors
    
    // Repeat colors if we need more than available
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  },

  // Get semantic colors
  getSemanticColor: (type: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary'): string => {
    const colorMap = {
      success: 'hsl(var(--success))',
      warning: 'hsl(var(--warning))',
      error: 'hsl(var(--destructive))',
      info: 'hsl(var(--info))',
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
    }
    
    return colorMap[type]
  },

  // Generate gradient colors
  generateGradient: (startColor: string, endColor: string, steps: number): string[] => {
    // This is a simplified version - in a real implementation, you'd use a color library
    return Array.from({ length: steps }, (_, i) => {
      const ratio = i / (steps - 1)
      return `color-mix(in srgb, ${startColor} ${(1 - ratio) * 100}%, ${endColor} ${ratio * 100}%)`
    })
  },
}

// Date utilities for time-series data
export const dateUtils = {
  // Format date for chart labels
  formatPeriod: (date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string => {
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short' })
      case 'yearly':
        return date.getFullYear().toString()
      default:
        return date.toLocaleDateString()
    }
  },

  // Generate date range
  generateDateRange: (
    start: Date, 
    end: Date, 
    period: 'daily' | 'weekly' | 'monthly'
  ): string[] => {
    const dates: string[] = []
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(dateUtils.formatPeriod(current, period))
      
      switch (period) {
        case 'daily':
          current.setDate(current.getDate() + 1)
          break
        case 'weekly':
          current.setDate(current.getDate() + 7)
          break
        case 'monthly':
          current.setMonth(current.getMonth() + 1)
          break
      }
    }
    
    return dates
  },

  // Get relative time periods
  getRelativePeriods: (count: number, period: 'daily' | 'weekly' | 'monthly'): string[] => {
    const now = new Date()
    const periods: string[] = []
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now)
      
      switch (period) {
        case 'daily':
          date.setDate(date.getDate() - i)
          break
        case 'weekly':
          date.setDate(date.getDate() - (i * 7))
          break
        case 'monthly':
          date.setMonth(date.getMonth() - i)
          break
      }
      
      periods.push(dateUtils.formatPeriod(date, period))
    }
    
    return periods
  },
}

// Export utilities
export const chartUtilities = {
  dataTransforms,
  statistics,
  chartColors,
  dateUtils,
}

export default chartUtilities