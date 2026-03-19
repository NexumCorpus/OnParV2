import { Upload, BarChart3, PiggyBank } from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: Upload,
    title: 'Add your inventory',
    description:
      'Import items via CSV or add them manually. Set up your categories, units, and reorder points in minutes.',
  },
  {
    number: 2,
    icon: BarChart3,
    title: 'Track & analyze',
    description:
      'Monitor waste, costs, and get AI-powered tips. See real-time dashboards showing your restaurant\'s performance.',
  },
  {
    number: 3,
    icon: PiggyBank,
    title: 'Save money',
    description:
      'Follow AI recommendations to cut waste by 10-20%. Most restaurants save $500+ monthly within the first quarter.',
  },
] as const

export function HowItWorks() {
  return (
    <section
      className="bg-muted/30 py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes and see results within your first month.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line (between steps on desktop) */}
              {index < STEPS.length - 1 && (
                <div
                  className="absolute top-10 left-[60%] hidden h-0.5 w-[80%] bg-border md:block"
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                <step.icon
                  className="size-8 text-brand-600"
                  aria-hidden="true"
                />
              </div>

              {/* Step number badge */}
              <div className="mx-auto -mt-3 flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
