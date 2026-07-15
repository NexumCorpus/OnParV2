import { TrendingDown, Zap, CreditCard } from 'lucide-react'

const STATS = [
  {
    icon: TrendingDown,
    label: 'Built to cut the 4–10% of purchases kitchens waste',
  },
  {
    icon: Zap,
    label: 'Set up in an afternoon — import your sheet, start counting',
  },
  {
    icon: CreditCard,
    label: '14-day free trial, no credit card',
  },
] as const

export function SocialProofBar() {
  return (
    <section
      className="border-y bg-muted/30 py-6"
      aria-label="Product highlights"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <stat.icon className="size-5 text-brand-600" aria-hidden="true" />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
