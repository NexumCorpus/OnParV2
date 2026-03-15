import {
  Package,
  TrendingDown,
  Brain,
  ChefHat,
  BarChart3,
  Smartphone,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Package,
    title: 'Smart Inventory Tracking',
    description:
      'Track every item with real-time alerts for low stock and expiry. Never run out of key ingredients again.',
  },
  {
    icon: TrendingDown,
    title: 'Waste Reduction Analytics',
    description:
      'Identify waste patterns and reduce costs with data-driven insights. See exactly where food is being wasted.',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description:
      'Get actionable recommendations powered by your restaurant\'s data. Our AI analyzes patterns you might miss.',
  },
  {
    icon: ChefHat,
    title: 'Recipe Cost Analysis',
    description:
      'Calculate profit margins and track ingredient costs automatically. Know your true cost per dish.',
  },
  {
    icon: BarChart3,
    title: 'Performance Dashboards',
    description:
      'Beautiful charts showing your restaurant\'s performance. Track KPIs, trends, and savings at a glance.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description:
      'Manage your inventory from any device, anywhere. Built responsive from the ground up for on-the-go access.',
  },
] as const

export function FeaturesGrid() {
  return (
    <section className="py-20" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Everything you need to manage inventory
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed specifically for restaurant operations.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <feature.icon
                  className="size-6 text-brand-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
