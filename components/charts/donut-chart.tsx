'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

export interface DonutChartDataPoint {
  name: string
  value: number
}

const COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#06b6d4']

interface DonutChartProps {
  data: DonutChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valuePrefix?: string
  valueSuffix?: string
}

export default function DonutChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valuePrefix = '',
  valueSuffix = '%',
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const hasData = data.length > 0

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} donut chart`} role="img">
        {hasData ? (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                animationDuration={300}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const numVal = Number(value ?? 0)
                  return [
                    `${valuePrefix}${numVal.toLocaleString()}${valueSuffix} (${total > 0 ? ((numVal / total) * 100).toFixed(1) : 0}%)`,
                    String(name ?? ''),
                  ]
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
            </PieChart>
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
          <tr><th>Reason</th><th>Value</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>{valuePrefix}{d.value.toLocaleString()}{valueSuffix}</td>
              <td>{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
