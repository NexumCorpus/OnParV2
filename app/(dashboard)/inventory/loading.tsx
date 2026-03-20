import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryLoading() {
  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="hidden md:flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Alerts */}
      <Skeleton className="h-12 w-full" />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block space-y-2">
        <Skeleton className="h-10 w-full" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    </div>
  )
}
