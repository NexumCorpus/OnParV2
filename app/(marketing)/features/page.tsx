import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Package,
  TrendingDown,
  Brain,
  ChefHat,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Features - OnPar',
  description:
    'Explore OnPar features: real-time inventory tracking, waste analytics, AI insights, recipe cost analysis, and performance dashboards for restaurants.',
}

interface FeatureSection {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  bullets: string[]
}

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    icon: Package,
    title: 'Inventory Tracking',
    description:
      'Keep a real-time pulse on every ingredient in your kitchen. Know exactly what you have, what you need, and when items are expiring.',
    bullets: [
      'Real-time stock levels',
      'Automatic expiry alerts',
      'Low stock notifications',
      'CSV import/export',
      'Barcode scanner support',
      'Supplier management',
    ],
  },
  {
    icon: TrendingDown,
    title: 'Waste Analysis',
    description:
      'Understand where food waste occurs and take actionable steps to reduce it. Track waste events, identify patterns, and benchmark against industry standards.',
    bullets: [
      'Pattern detection',
      'Risk level assessment',
      'Seasonal trend analysis',
      'Savings calculations',
      'Industry benchmarking',
      'Predictive alerts',
    ],
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description:
      'Leverage AI to uncover hidden opportunities for savings. Get recommendations tailored to your restaurant\'s specific data and patterns.',
    bullets: [
      'Personalized recommendations',
      'Cost optimization suggestions',
      'Demand forecasting',
      'Menu optimization tips',
      'Impact scoring',
      'Implementation tracking',
    ],
  },
  {
    icon: ChefHat,
    title: 'Recipe & Menu Management',
    description:
      'Know your true cost per dish and optimize menu pricing. Link recipes to inventory for automatic cost tracking and margin analysis.',
    bullets: [
      'Automatic cost calculation',
      'Profit margin tracking',
      'Ingredient-level costing',
      'Menu item performance',
      'Serving size management',
      'Recipe scaling',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Dashboards',
    description:
      'Beautiful, actionable dashboards that give you a complete picture of your restaurant\'s inventory health and financial performance.',
    bullets: [
      'Real-time KPI dashboard',
      'Trend analysis charts',
      'Budget tracking',
      'Category breakdowns',
      'Supplier comparisons',
      'Exportable reports',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Features
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to manage your restaurant inventory efficiently
            and reduce waste.
          </p>
        </div>

        {/* Feature sections — alternating layout */}
        <div className="mx-auto mt-20 max-w-5xl space-y-24">
          {FEATURE_SECTIONS.map((feature, index) => {
            const isReversed = index % 2 === 1
            return (
              <section
                key={feature.title}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  isReversed ? 'lg:direction-rtl' : ''
                }`}
                aria-labelledby={`feature-${index}`}
              >
                {/* Illustration placeholder */}
                <div
                  className={`${isReversed ? 'lg:order-2' : 'lg:order-1'}`}
                  aria-hidden="true"
                >
                  <div className="aspect-[4/3] rounded-xl border bg-gradient-to-br from-brand-50 to-brand-100 shadow-lg dark:from-brand-950/40 dark:to-brand-900/20 flex items-center justify-center">
                    <feature.icon className="size-20 text-brand-300 dark:text-brand-700" />
                  </div>
                </div>

                {/* Content */}
                <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                      <feature.icon
                        className="size-5 text-brand-600"
                        aria-hidden="true"
                      />
                    </div>
                    <h2
                      id={`feature-${index}`}
                      className="text-2xl font-bold"
                    >
                      {feature.title}
                    </h2>
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-2" role="list">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="flex size-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30"
                          aria-hidden="true"
                        >
                          &#10003;
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-20 max-w-xl text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] px-8 text-base"
          >
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </div>
  )
}
