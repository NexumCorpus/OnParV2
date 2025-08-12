'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlaceholderChart } from './placeholder-chart'
import { Database } from '@/lib/supabase'
import { useMemo } from 'react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryValueChartProps {
  items: InventoryItem[]
}

export function InventoryValueChart({ items }: InventoryValueChartProps) {
  const chartData = useMemo(() => {
    // Generate mock historical data based on current inventory
    const currentValue = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    
    // Create 6 months of mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const data = months.map((month, index) => {
      // Simulate some variation in inventory value
      const variation = (Math.random() - 0.5) * 0.3 // ±15% variation
      const baseValue = currentValue * (0.7 + (index * 0.05)) // Gradual increase over time
      const value = Math.max(0, baseValue * (1 + variation))
      
      return {
        month,
        value: Math.round(value),
        items: Math.round(items.length * (0.8 + (index * 0.04))), // Gradual increase in items
      }
    })
    
    return data
  }, [items])

  const currentValue = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
  const previousValue = chartData[chartData.length - 2]?.value || currentValue
  const trend = currentValue > previousValue ? 'up' : 'down'
  const trendPercentage = previousValue > 0 ? Math.abs(((currentValue - previousValue) / previousValue) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value Trend</CardTitle>
        <CardDescription>
          Total inventory value over the past 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold">${currentValue.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">
            {trend === 'up' ? '↗' : '↘'} {trendPercentage.toFixed(1)}% from last month
          </p>
        </div>
        
        <PlaceholderChart 
          title="Inventory Value Trend"
          description="Chart showing inventory value over time will be available after deployment"
          height={300}
        />
      </CardContent>
    </Card>
  )
}