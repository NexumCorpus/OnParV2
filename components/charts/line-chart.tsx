'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { SizedContainer } from './sized-container'
import { ChartWrapper } from './chart-wrapper'

export interface LineChartDataPoint {
  label: string
  value: number
  benchmark?: number
}

interface LineChartProps {
  data: LineChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valueSuffix?: string
  valuePrefix?: string
  color?: string
  showBenchmark?: boolean
  benchmarkLabel?: string
  benchmarkValue?: number
}

export default function LineChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valueSuffix = '%',
  valuePrefix = '',
  color = '#6366f1',
  showBenchmark = false,
  benchmarkLabel = 'Industry avg',
  benchmarkValue,
}: LineChartProps) {
  const hasEnoughData = data.length >= 3
  const hasBenchmarkData = data.some((d) => d.benchmark !== undefined)

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} line chart`} role="img">
        {hasEnoughData ? (
          <SizedContainer height={height}>
            <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${valuePrefix}${v}${valueSuffix}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${valuePrefix}${Number(value ?? 0).toLocaleString()}${valueSuffix}`,
                  String(name ?? ''),
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={300}
                name="Your rate"
              />
              {(showBenchmark && hasBenchmarkData) && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  animationDuration={300}
                  name={benchmarkLabel}
                />
              )}
              {(showBenchmark && benchmarkValue !== undefined && !hasBenchmarkData) && (
                <ReferenceLine
                  y={benchmarkValue}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  label={{ value: benchmarkLabel, position: 'right', fontSize: 11 }}
                />
              )}
            </RechartsLineChart>
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
          <tr><th>Period</th><th>Value</th>{showBenchmark && <th>Benchmark</th>}</tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{valuePrefix}{d.value}{valueSuffix}</td>
              {showBenchmark && <td>{d.benchmark !== undefined ? `${valuePrefix}${d.benchmark}${valueSuffix}` : 'N/A'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
