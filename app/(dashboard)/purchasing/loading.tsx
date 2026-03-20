import { Skeleton } from '@/components/ui/skeleton'

export default function PurchasingLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Card */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Desktop table rows */}
        <div className="hidden md:block space-y-2">
          <Skeleton className="h-10 w-full" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    </div>
  )
}
