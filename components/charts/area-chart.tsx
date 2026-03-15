'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

export interface AreaChartDataPoint {
  label: string
  value: number
}

interface AreaChartProps {
  data: AreaChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valuePrefix?: string
  color?: string
}

export default function AreaChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valuePrefix = '$',
  color = '#6366f1',
}: AreaChartProps) {
  const hasEnoughData = data.length >= 3

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} area chart`} role="img">
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                formatter={(value: number) => [`${valuePrefix}${value.toLocaleString()}`, 'Value']}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill="url(#areaFill)"
                strokeWidth={2}
                animationDuration={300}
                name="Value"
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Not enough data for this time range. Try selecting a longer period or check back after a few more days of usage.
          </div>
        )}
      </div>
      {/* Accessible tabular fallback */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Period</th><th>Value</th></tr>
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
