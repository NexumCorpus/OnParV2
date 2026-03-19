import { Star, TrendingUp, Users } from 'lucide-react'

const STATS = [
  {
    icon: Users,
    label: 'Trusted by 200+ restaurants',
  },
  {
    icon: Star,
    label: '4.9 average rating',
  },
  {
    icon: TrendingUp,
    label: '$2M+ saved by our customers',
  },
] as const

export function SocialProofBar() {
  return (
    <section
      className="border-y bg-muted/30 py-6"
      aria-label="Social proof statistics"
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
