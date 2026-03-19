'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MetricRow {
  metric: string
  current: string
  previous: string
  changeValue: number
  changeLabel: string
}

interface MetricsSummaryTableProps {
  metrics: MetricRow[]
}

export function MetricsSummaryTable({ metrics }: MetricsSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Prev Month</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell className="text-right">{row.current}</TableCell>
                <TableCell className="text-right">{row.previous}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      row.changeValue > 0
                        ? 'text-green-600'
                        : row.changeValue < 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }
                  >
                    {row.changeLabel}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
