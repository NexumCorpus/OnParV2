'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlaceholderChart } from './placeholder-chart'
import { Database } from '@/lib/supabase'
import { useMemo } from 'react'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuPerformanceChartProps {
  menuItems: MenuItem[]
}

export function MenuPerformanceChart({ menuItems }: MenuPerformanceChartProps) {
  const chartData = useMemo(() => {
    return menuItems
      .sort((a, b) => b.sales_percentage - a.sales_percentage)
      .slice(0, 8) // Top 8 items
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        sales: item.sales_percentage,
        waste: item.waste_percentage,
        efficiency: Math.max(0, item.sales_percentage - item.waste_percentage),
      }))
  }, [menuItems])

  if (menuItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu Performance</CardTitle>
          <CardDescription>Sales vs waste percentage by menu item</CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceholderChart 
            title="No Menu Items"
            description="Add menu items to see performance data"
            height={300}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Performance</CardTitle>
        <CardDescription>
          Sales vs waste percentage for top performing items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlaceholderChart 
          title="Menu Performance Analysis"
          description="Interactive chart showing sales vs waste percentage will be available after deployment"
          height={300}
        />
        
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Sales %</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Waste %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}