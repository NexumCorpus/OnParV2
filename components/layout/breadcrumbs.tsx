'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  add: 'Add Item',
  purchasing: 'Purchasing',
  new: 'New Order',
  recipes: 'Recipes',
  suppliers: 'Suppliers',
  analytics: 'Analytics',
  insights: 'Insights',
  waste: 'Waste',
  settings: 'Settings',
  onboarding: 'Onboarding',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Only show breadcrumbs for deep routes (2+ segments)
  if (segments.length < 2) return null

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    // Use UUID-like segments as "Details"
    const isId = segment.length > 8 && /^[a-f0-9-]+$/.test(segment)
    const label = isId ? 'Details' : (ROUTE_LABELS[segment] ?? segment)
    const isLast = index === segments.length - 1

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {!crumb.isLast ? (
              <>
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
