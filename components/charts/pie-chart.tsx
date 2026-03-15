'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

export interface PieChartDataPoint {
  name: string
  value: number
}

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#06b6d4']

interface PieChartProps {
  data: PieChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valuePrefix?: string
}

export default function PieChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valuePrefix = '$',
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const hasData = data.length > 0

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} pie chart`} role="img">
        {hasData ? (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                animationDuration={300}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${valuePrefix}${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  name,
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data available to display.
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Category</th><th>Value</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>{valuePrefix}{d.value.toLocaleString()}</td>
              <td>{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
