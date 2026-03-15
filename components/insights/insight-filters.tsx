'use client'

import { Button } from '@/components/ui/button'
import type { AIInsight } from '@/types'

type StatusFilter = 'all' | AIInsight['status']

interface InsightFiltersProps {
  currentFilter: StatusFilter
  onFilterChange: (filter: StatusFilter) => void
}

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'dismissed', label: 'Dismissed' },
]

export function InsightFilters({ currentFilter, onFilterChange }: InsightFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
