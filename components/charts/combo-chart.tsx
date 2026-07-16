'use client'

import {
  ComposedChart,
  Bar,
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

export interface ComboChartDataPoint {
  label: string
  barValue: number
  lineValue?: number
}

interface ComboChartProps {
  data: ComboChartDataPoint[]
  title: string
  description?: string
  isLoading?: boolean
  height?: number
  valuePrefix?: string
  barName?: string
  lineName?: string
  barColor?: string
  lineColor?: string
  budgetLine?: number
  budgetLabel?: string
}

export default function ComboChartComponent({
  data,
  title,
  description,
  isLoading = false,
  height = 300,
  valuePrefix = '$',
  barName = 'Spend',
  lineName = 'Budget',
  barColor = '#6366f1',
  lineColor = '#ef4444',
  budgetLine,
  budgetLabel = 'Budget',
}: ComboChartProps) {
  const hasEnoughData = data.length >= 3
  const hasLineData = data.some((d) => d.lineValue !== undefined)

  return (
    <ChartWrapper title={title} description={description} isLoading={isLoading} height={height}>
      <div aria-label={`${title} combo chart`} role="img">
        {hasEnoughData ? (
          <SizedContainer height={height}>
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) =>
                  `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  `${valuePrefix}${Number(value ?? 0).toLocaleString()}`,
                  String(name ?? ''),
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar
                dataKey="barValue"
                fill={barColor}
                radius={[4, 4, 0, 0]}
                animationDuration={300}
                name={barName}
              />
              {hasLineData && (
                <Line
                  type="monotone"
                  dataKey="lineValue"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                  name={lineName}
                />
              )}
              {budgetLine !== undefined && !hasLineData && (
                <ReferenceLine
                  y={budgetLine}
                  stroke={lineColor}
                  strokeDasharray="5 5"
                  label={{ value: budgetLabel, position: 'right', fontSize: 11 }}
                />
              )}
            </ComposedChart>
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
          <tr>
            <th>Period</th>
            <th>{barName}</th>
            {(hasLineData || budgetLine !== undefined) && <th>{lineName}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{valuePrefix}{d.barValue.toLocaleString()}</td>
              {(hasLineData || budgetLine !== undefined) && (
                <td>
                  {d.lineValue !== undefined
                    ? `${valuePrefix}${d.lineValue.toLocaleString()}`
                    : budgetLine !== undefined
                      ? `${valuePrefix}${budgetLine.toLocaleString()}`
                      : 'N/A'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ChartWrapper>
  )
}
