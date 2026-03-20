import { Skeleton } from '@/components/ui/skeleton'

export default function SuppliersLoading() {
  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="hidden md:block h-10 w-32" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full" />

      {/* Supplier cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  )
}
