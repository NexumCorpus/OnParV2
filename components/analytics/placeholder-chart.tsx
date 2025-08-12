'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface PlaceholderChartProps {
  title: string
  description: string
  height?: number
}

export function PlaceholderChart({ title, description, height = 200 }: PlaceholderChartProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20"
      style={{ height: `${height}px` }}
    >
      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
      <h4 className="font-semibold text-muted-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {description}
      </p>
      <p className="text-xs text-muted-foreground mt-2 opacity-75">
        Chart implementation coming soon
      </p>
    </div>
  )
}