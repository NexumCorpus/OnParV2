'use client'

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

export interface ScatterChartDataPoint {
  name: string
  x: number
  y: number
  z?: number
}

interface ScatterChartProps {
  data: ScatterChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  xLabel?: string
  yLabel?: string
  xPrefix?: string
  ySuffix?: string
  color?: string
}

export default function ScatterChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  xLabel = 'Cost',
  yLabel = 'Margin %',
  xPrefix = '$',
  ySuffix = '%',
  color = '#6366f1',
}: ScatterChartProps) {
  const hasEnoughData = data.length >= 3

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} scatter plot`} role="img">
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="x"
                name={xLabel}
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) =>
                  `${xPrefix}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                }
                label={{ value: xLabel, position: 'insideBottom', offset: -5, fontSize: 12 }}
              />
              <YAxis
                dataKey="y"
                name={yLabel}
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${v}${ySuffix}`}
                label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <ZAxis dataKey="z" range={[50, 200]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const point = payload[0]?.payload as ScatterChartDataPoint
                  return (
                    <div className="rounded-lg border bg-background p-2 text-sm shadow-md">
                      <p className="font-medium">{point.name}</p>
                      <p>{xLabel}: {xPrefix}{point.x.toLocaleString()}</p>
                      <p>{yLabel}: {point.y.toFixed(1)}{ySuffix}</p>
                    </div>
                  )
                }}
              />
              <Scatter
                data={data}
                fill={color}
                animationDuration={300}
              />
            </RechartsScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Not enough data for this time range. Try selecting a longer period or check back after a few more days of usage.
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Name</th><th>{xLabel}</th><th>{yLabel}</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>{xPrefix}{d.x.toLocaleString()}</td>
              <td>{d.y.toFixed(1)}{ySuffix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
