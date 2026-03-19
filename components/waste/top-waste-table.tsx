'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { WastePattern } from '@/lib/engines/waste-analysis'

interface TopWasteTableProps {
  patterns: WastePattern[]
}

const riskBadgeVariant: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline',
}

const riskLabel: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function TrendIcon({ trend }: { trend: 'increasing' | 'stable' | 'decreasing' }) {
  switch (trend) {
    case 'increasing':
      return (
        <span className="flex items-center gap-1 text-red-600">
          <TrendingUp className="h-3 w-3" /> increasing
        </span>
      )
    case 'decreasing':
      return (
        <span className="flex items-center gap-1 text-green-600">
          <TrendingDown className="h-3 w-3" /> decreasing
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-3 w-3" /> stable
        </span>
      )
  }
}

export function TopWasteTable({ patterns }: TopWasteTableProps) {
  const topPatterns = patterns.slice(0, 10)

  if (topPatterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Waste Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No waste patterns to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Waste Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Waste Rate</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPatterns.map((pattern) => (
              <TableRow key={pattern.itemId}>
                <TableCell className="font-medium">{pattern.itemName}</TableCell>
                <TableCell>{pattern.wasteRate.toFixed(1)}%</TableCell>
                <TableCell>${pattern.totalWasteValue.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={riskBadgeVariant[pattern.riskLevel]}>
                    {riskLabel[pattern.riskLevel]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TrendIcon trend={pattern.trend} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
