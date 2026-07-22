'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  SkipForward,
  BarChart3,
  TrendingDown,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { saveOnboardingStep1, completeOnboarding } from '@/lib/actions/onboarding'

const RESTAURANT_TYPES = [
  'Casual Dining',
  'Fine Dining',
  'Fast Food',
  'Cafe',
  'Bakery',
  'Bar & Grill',
  'Other',
] as const

const TOUR_ITEMS = [
  {
    icon: BarChart3,
    title: 'Your Dashboard',
    description:
      'See real-time KPIs including inventory value, waste rate, and budget usage at a glance.',
  },
  {
    icon: TrendingDown,
    title: 'Waste Tracking',
    description:
      'Log waste events, track patterns, and get AI-powered recommendations to reduce waste.',
  },
  {
    icon: Lightbulb,
    title: 'AI Insights',
    description:
      'Receive actionable insights tailored to your restaurant\'s data to help you save money.',
  },
] as const

interface OnboardingFlowProps {
  initialRestaurantName: string
  initialBudget: number | null
}

export function OnboardingFlow({
  initialRestaurantName,
  initialBudget,
}: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')

  const progressValue = (step / 3) * 100

  async function handleStep1Submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('restaurant_type', selectedType || 'Other')

    const result = await saveOnboardingStep1(formData)

    if (result.success) {
      setStep(2)
    } else {
      toast.error(result.error || 'Failed to save. Please try again.')
    }

    setIsLoading(false)
  }

  async function handleComplete() {
    setIsLoading(true)
    // completeOnboarding redirects to /dashboard server-side on success; the code
    // below runs only if it returned instead (an error saving).
    const result = await completeOnboarding()
    if (result && !result.success) {
      toast.error(result.error || 'Failed to complete onboarding. Please try again.')
      setIsLoading(false)
    } else {
      // Success without the server redirect firing — navigate as a fallback.
      router.push('/dashboard')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to OnPar!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let&apos;s set up your restaurant in just a few steps.
        </p>
      </div>

      {/* Progress */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step} of 3</span>
          <span>{Math.round(progressValue)}% complete</span>
        </div>
        <Progress value={progressValue} className="mt-2" aria-label={`Step ${step} of 3`} />
      </div>

      {/* Step content */}
      <div className="mt-8">
        {step === 1 && (
          <section aria-labelledby="step1-heading">
            <h2 id="step1-heading" className="text-xl font-semibold">
              Restaurant Info
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about your restaurant so we can customize your experience.
            </p>

            <form onSubmit={handleStep1Submit} className="mt-6 space-y-6">
              <div>
                <Label htmlFor="restaurant_name">
                  Restaurant Name <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="restaurant_name"
                  name="restaurant_name"
                  type="text"
                  required
                  aria-required="true"
                  defaultValue={initialRestaurantName}
                  placeholder="Your restaurant name"
                  className="mt-1.5 text-base"
                />
              </div>

              <div>
                <Label htmlFor="monthly_budget">
                  Monthly Food Budget ($)
                </Label>
                <Input
                  id="monthly_budget"
                  name="monthly_budget"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={initialBudget ?? ''}
                  placeholder="e.g. 5000"
                  className="mt-1.5 text-base"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium">
                  What type of restaurant?
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {RESTAURANT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selectedType === type
                          ? 'border-brand-600 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                          : 'border-border hover:border-brand-300 hover:bg-muted'
                      }`}
                      aria-pressed={selectedType === type}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step2-heading">
            <h2 id="step2-heading" className="text-xl font-semibold">
              Add Your First Items
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You can add inventory items manually, import from CSV, or skip
              this step for now.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                  <Plus className="size-6 text-brand-600" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium">I&apos;ll add items manually</span>
                <span className="text-xs text-muted-foreground">after setup</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                  <Upload
                    className="size-6 text-brand-600"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-medium">I&apos;ll import a CSV</span>
                <span className="text-xs text-muted-foreground">after setup</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <SkipForward
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-medium">Skip for now</span>
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="min-h-[44px]"
              >
                <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white min-h-[44px]"
              >
                Next
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step3-heading">
            <h2 id="step3-heading" className="text-xl font-semibold">
              Explore Your Dashboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s a quick look at the key features available to you.
            </p>

            <div className="mt-8 space-y-4">
              {TOUR_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <item.icon
                      className="size-5 text-brand-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="min-h-[44px]"
              >
                <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
