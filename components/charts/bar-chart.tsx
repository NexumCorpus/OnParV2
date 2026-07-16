'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { SizedContainer } from './sized-container'
import { ChartWrapper } from './chart-wrapper'

export interface BarChartDataPoint {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valuePrefix?: string
  color?: string
  layout?: 'horizontal' | 'vertical'
}

export default function BarChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valuePrefix = '$',
  color = '#6366f1',
  layout = 'horizontal',
}: BarChartProps) {
  const hasEnoughData = data.length >= 3

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} bar chart`} role="img">
        {hasEnoughData ? (
          <SizedContainer height={height}>
            {layout === 'vertical' ? (
              <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={55} />
                <Tooltip
                  formatter={(value) => [`${valuePrefix}${Number(value ?? 0).toLocaleString()}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} animationDuration={300} name="Value" />
              </RechartsBarChart>
            ) : (
              <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  formatter={(value) => [`${valuePrefix}${Number(value ?? 0).toLocaleString()}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} animationDuration={300} name="Value" />
              </RechartsBarChart>
            )}
          </SizedContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Not enough data for this time range. Try selecting a longer period or check back after a few more days of usage.
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Category</th><th>Value</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{valuePrefix}{d.value.toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
