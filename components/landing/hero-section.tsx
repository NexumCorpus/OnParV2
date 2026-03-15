import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/20"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Stop Wasting Food.{' '}
              <span className="text-brand-600">Start Saving Money.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Smart inventory management for restaurants. Reduce waste by 10-20% and save $500+ monthly with real-time tracking, AI insights, and waste analytics.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] px-8 text-base"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-[48px] px-8 text-base"
              >
                <Link href="/features">
                  See Demo
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
                14-day free trial
              </span>
            </div>
          </div>

          {/* Dashboard preview placeholder */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="aspect-[4/3] rounded-xl border bg-gradient-to-br from-brand-50 to-brand-100 shadow-2xl dark:from-brand-950/40 dark:to-brand-900/20">
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="h-6 w-48 rounded bg-brand-200/50 dark:bg-brand-800/30" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                  <div className="h-20 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                  <div className="h-20 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                </div>
                <div className="h-32 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                  <div className="h-24 rounded-lg bg-white/60 dark:bg-white/5 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
