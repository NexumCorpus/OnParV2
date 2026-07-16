'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { SizedContainer } from './sized-container'
import { ChartWrapper } from './chart-wrapper'

export interface StackedBarDataPoint {
  label: string
  inStock: number
  belowReorder: number
}

interface StackedBarChartProps {
  data: StackedBarDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
}

export default function StackedBarChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
}: StackedBarChartProps) {
  const hasEnoughData = data.length >= 1

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} stacked bar chart`} role="img">
        {hasEnoughData ? (
          <SizedContainer height={height}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar
                dataKey="inStock"
                stackId="a"
                fill="#6366f1"
                radius={[0, 0, 0, 0]}
                animationDuration={300}
                name="In Stock"
              />
              <Bar
                dataKey="belowReorder"
                stackId="a"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                animationDuration={300}
                name="Below Reorder"
              />
            </BarChart>
          </SizedContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data available to display.
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Category</th><th>In Stock</th><th>Below Reorder</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.inStock}</td>
              <td>{d.belowReorder}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
