'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DateRangeOption = '7d' | '30d' | '90d' | '6m' | '12m'

interface DateRangeSelectorProps {
  value: DateRangeOption
  onChange: (value: DateRangeOption) => void
}

const DATE_RANGE_LABELS: Record<DateRangeOption, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '6m': 'Last 6 months',
  '12m': 'Last 12 months',
}

export function getDateRangeStart(option: DateRangeOption): Date {
  const now = new Date()
  switch (option) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '6m':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case '12m':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  }
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Date Range:</span>
      <Select value={value} onValueChange={(v) => onChange(v as DateRangeOption)}>
        <SelectTrigger className="w-[160px]" aria-label="Select date range">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(DATE_RANGE_LABELS) as Array<[DateRangeOption, string]>).map(
            ([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
