'use client'

import * as React from 'react'
import { ChartContainer, SimpleBarChart, SimplePieChart, ChartActions } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Stack, Inline } from '@/components/ui/spacing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react'

interface InventoryItem {
  name: string
  category: string
  currentStock: number
  reorderPoint: number
  maxStock: number
  value: number
  status: 'good' | 'low' | 'critical' | 'overstock'
  daysUntilExpiry?: number
}

interface InventoryChartProps {
  data: InventoryItem[]
  title?: string
  loading?: boolean
  className?: string
}

export function InventoryChart({ 
  data, 
  title = 'Inventory Overview',
  loading = false,
  className 
}: InventoryChartProps) {
  // Calculate inventory metrics
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  const totalItems = data.length
  
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryData = data.reduce((acc, item) => {
    const existing = acc.find(cat => cat.name === item.category)
    if (existing) {
      existing.value += item.value
      existing.count += 1
    } else {
      acc.push({
        name: item.category,
        value: item.value,
        count: 1
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number; count: number }>)

  const stockLevelData = data.map(item => ({
    label: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
    value: (item.currentStock / item.maxStock) * 100,
    color: item.status === 'critical' ? 'hsl(var(--destructive))' :
           item.status === 'low' ? 'hsl(var(--warning))' :
           item.status === 'overstock' ? 'hsl(var(--info))' :
           'hsl(var(--success))'
  }))

  const categoryChartData = categoryData.map((cat, index) => ({
    label: cat.name,
    value: cat.value,
    color: [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--destructive))',
      'hsl(var(--info))',
    ][index % 6]
  }))

  const criticalItems = data.filter(item => item.status === 'critical').length
  const lowStockItems = data.filter(item => item.status === 'low').length
  const expiringItems = data.filter(item => 
    item.daysUntilExpiry !== undefined && item.daysUntilExpiry <= 7
  ).length

  return (
    <ChartContainer
      title={title}
      description={`Overview of ${totalItems} inventory items worth $${totalValue.toLocaleString()}`}
      loading={loading}
      className={className}
      actions={
        <ChartActions 
          onDownload={() => console.log('Download inventory chart')}
          onExpand={() => console.log('Expand inventory chart')}
        />
      }
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <Typography variant="h4" weight="bold" color="success">
              {statusCounts.good || 0}
            </Typography>
            <Typography variant="small" color="muted">
              Good Stock
            </Typography>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-2" />
            <Typography variant="h4" weight="bold" color="warning">
              {statusCounts.low || 0}
            </Typography>
            <Typography variant="small" color="muted">
              Low Stock
            </Typography>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <Typography variant="h4" weight="bold" color="destructive">
              {statusCounts.critical || 0}
            </Typography>
            <Typography variant="small" color="muted">
              Critical
            </Typography>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-info/10 border border-info/20">
            <Package className="w-6 h-6 text-info mx-auto mb-2" />
            <Typography variant="h4" weight="bold" color="info">
              {statusCounts.overstock || 0}
            </Typography>
            <Typography variant="small" color="muted">
              Overstock
            </Typography>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="levels" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stock Levels
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Categories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="levels" className="space-y-4">
            <div className="h-64">
              <SimpleBarChart
                data={stockLevelData.slice(0, 10)} // Show top 10 items
                height={256}
                animated
              />
            </div>
            <Typography variant="small" color="muted" className="text-center">
              Stock levels as percentage of maximum capacity (showing top 10 items)
            </Typography>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-center">
              <SimplePieChart
                data={categoryChartData}
                size={200}
                showLabels
              />
            </div>
            <Typography variant="small" color="muted" className="text-center">
              Inventory value distribution by category
            </Typography>
          </TabsContent>
        </Tabs>

        {/* Alerts */}
        {(criticalItems > 0 || lowStockItems > 0 || expiringItems > 0) && (
          <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
            <Typography variant="label" weight="semibold" className="mb-3 block">
              Attention Required
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {criticalItems > 0 && (
                <div className="flex items-center space-x-2 p-2 rounded bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <Typography variant="small">
                    {criticalItems} critical stock items
                  </Typography>
                </div>
              )}
              
              {lowStockItems > 0 && (
                <div className="flex items-center space-x-2 p-2 rounded bg-warning/10">
                  <Package className="w-4 h-4 text-warning" />
                  <Typography variant="small">
                    {lowStockItems} low stock items
                  </Typography>
                </div>
              )}
              
              {expiringItems > 0 && (
                <div className="flex items-center space-x-2 p-2 rounded bg-info/10">
                  <Clock className="w-4 h-4 text-info" />
                  <Typography variant="small">
                    {expiringItems} expiring soon
                  </Typography>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  )
}