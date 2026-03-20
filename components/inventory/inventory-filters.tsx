'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { INVENTORY_CATEGORIES, SEARCH_DEBOUNCE_MS } from '@/lib/config'

type StatusFilter = 'all' | 'low_stock' | 'expiring'

interface InventoryFiltersProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string | undefined) => void
  onStatusChange: (status: StatusFilter) => void
  selectedCategory?: string
  selectedStatus: StatusFilter
  lowStockCount: number
  expiringCount: number
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'expiring', label: 'Expiring' },
]

export function InventoryFilters({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  selectedCategory,
  selectedStatus,
  lowStockCount,
  expiringCount,
}: InventoryFiltersProps) {
  const [searchValue, setSearchValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, SEARCH_DEBOUNCE_MS)
    },
    [onSearchChange]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchValue}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="pl-9 pr-9 min-h-[44px] text-base"
        />
        {searchValue.length > 0 && (
          <button
            type="button"
            onClick={() => handleSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_OPTIONS.map((opt) => {
          const count =
            opt.value === 'low_stock'
              ? lowStockCount
              : opt.value === 'expiring'
                ? expiringCount
                : undefined
          return (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
                selectedStatus === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              {opt.label}
              {count !== undefined && count > 0 && (
                <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onCategoryChange(undefined)}
          className={cn(
            'inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
            !selectedCategory
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-foreground hover:bg-accent'
          )}
        >
          All Categories
        </button>
        {INVENTORY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-accent'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
