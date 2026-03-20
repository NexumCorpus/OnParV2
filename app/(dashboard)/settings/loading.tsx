import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Tabs bar */}
      <Skeleton className="h-10 w-full max-w-lg" />

      {/* Form fields */}
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
