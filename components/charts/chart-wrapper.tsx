'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  isLoading?: boolean
  height?: number
}

export function ChartWrapper({
  title,
  description,
  children,
  isLoading = false,
  height = 300,
}: ChartWrapperProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full" style={{ height }} />
        ) : (
          <div style={{ width: '100%', height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
