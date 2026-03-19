import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-brand-600 px-8 py-16 text-center text-white shadow-lg dark:bg-brand-700">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Ready to reduce waste and save money?
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Join 200+ restaurants already saving with OnPar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-700 hover:bg-brand-50 min-h-[48px] px-8 text-base font-semibold"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-brand-200">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  )
}
