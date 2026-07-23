'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/components/pricing/plan-card'
import { PricingToggle } from '@/components/pricing/pricing-toggle'
import { FAQSection } from '@/components/pricing/faq-section'
import { PLANS, FOUNDING_RATES } from '@/lib/config'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            OnPar
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Back link */}
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your restaurant. All paid plans include a
            14-day free trial.
          </p>
        </div>

        {/* Founding-restaurant offer */}
        {FOUNDING_RATES.enabled && (
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-brand-600 bg-brand-50 px-5 py-4 text-center dark:bg-brand-950/30">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
              Founding restaurants: ${FOUNDING_RATES.starter}/mo Starter or $
              {FOUNDING_RATES.professional}/mo Professional &mdash; locked in for
              as long as you stay.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              For our first {FOUNDING_RATES.seats} restaurants. Start a free
              trial and mention it, or email us to claim your rate.
            </p>
          </div>
        )}

        {/* Toggle */}
        <div className="mt-10">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>

        {/* Plan cards */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {/* Free */}
          <div className="order-2 md:order-1">
            <PlanCard
              name={PLANS.free.name}
              price={PLANS.free.price}
              features={PLANS.free.features}
              excludedFeatures={[
                'Waste analysis',
                'AI insights',
                'CSV import',
              ]}
              isAnnual={isAnnual}
            />
          </div>

          {/* Starter (Popular) */}
          <div className="order-1 md:order-2">
            <PlanCard
              name={PLANS.starter.name}
              price={PLANS.starter.price}
              features={PLANS.starter.features}
              isAnnual={isAnnual}
              isPopular
              priceId={PLANS.starter.stripePriceId}
            />
          </div>

          {/* Professional */}
          <div className="order-3">
            <PlanCard
              name={PLANS.professional.name}
              price={PLANS.professional.price}
              features={PLANS.professional.features}
              isAnnual={isAnnual}
              priceId={PLANS.professional.stripePriceId}
            />
          </div>
        </div>

        {/* Trial note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All paid plans include a 14-day free trial. No credit card required to
          start.
        </p>

        {/* FAQ */}
        <div className="mt-20">
          <FAQSection />
        </div>
      </main>
    </div>
  )
}
