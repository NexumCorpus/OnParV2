'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlaceholderChart } from './placeholder-chart'
import { Database } from '@/lib/supabase'
import { useMemo } from 'react'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface WasteReductionChartProps {
  menuItems: MenuItem[]
}

export function WasteReductionChart({ menuItems }: WasteReductionChartProps) {
  const chartData = useMemo(() => {
    const currentWaste = menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
      : 8

    // Generate 6 months of mock waste reduction data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const data = months.map((month, index) => {
      // Simulate waste reduction over time (starting higher, trending down)
      const baseWaste = currentWaste + (5 - index) // Start 5% higher, reduce over time
      const variation = (Math.random() - 0.5) * 1 // ±0.5% variation
      const waste = Math.max(1, baseWaste + variation) // Minimum 1% waste
      
      return {
        month,
        waste: Math.round(waste * 10) / 10, // Round to 1 decimal
        target: Math.max(2, 8 - index), // Target waste reduction
      }
    })
    
    return data
  }, [menuItems])

  const currentWaste = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + item.waste_percentage, 0) / menuItems.length
    : 0
  
  const previousWaste = chartData[chartData.length - 2]?.waste || currentWaste
  const improvement = previousWaste - currentWaste
  const improvementPercentage = previousWaste > 0 ? (improvement / previousWaste) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste Reduction Progress</CardTitle>
        <CardDescription>
          Average waste percentage across all menu items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold">{currentWaste.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground">
            {improvement > 0 ? '↓' : '↑'} {Math.abs(improvementPercentage).toFixed(1)}% from last month
          </p>
        </div>
        
        <PlaceholderChart 
          title="Waste Reduction Progress"
          description="Chart showing waste reduction trends will be available after deployment"
          height={300}
        />
      </CardContent>
    </Card>
  )
}