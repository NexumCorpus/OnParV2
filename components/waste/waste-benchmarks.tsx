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
import type { BenchmarkComparison } from '@/lib/engines/waste-benchmarks'

interface WasteBenchmarksProps {
  benchmarks: BenchmarkComparison[]
}

const ratingConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  excellent: { label: 'Excellent', variant: 'default' },
  good: { label: 'Good', variant: 'default' },
  average: { label: 'Average', variant: 'secondary' },
  below_average: { label: 'Below Avg', variant: 'outline' },
  poor: { label: 'Poor', variant: 'destructive' },
}

export function WasteBenchmarksTable({ benchmarks }: WasteBenchmarksProps) {
  if (benchmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Waste Rates vs Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log waste events to see how you compare to industry benchmarks.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Waste Rates vs Industry</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Your Rate</TableHead>
              <TableHead>Industry Avg</TableHead>
              <TableHead>Best in Class</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benchmarks.map((benchmark) => {
              const config = ratingConfig[benchmark.rating] ?? ratingConfig.average
              return (
                <TableRow key={benchmark.category}>
                  <TableCell className="font-medium">{benchmark.category}</TableCell>
                  <TableCell>{benchmark.userRate.toFixed(1)}%</TableCell>
                  <TableCell>{benchmark.industryAverage.toFixed(1)}%</TableCell>
                  <TableCell>{benchmark.bestInClass.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
