import { MessageSquare, Hammer, Unlock } from 'lucide-react'

const PERKS = [
  {
    icon: MessageSquare,
    title: 'A direct line to the builders',
    body: 'Questions and bug reports go straight to the people who build OnPar — not a ticket queue.',
  },
  {
    icon: Hammer,
    title: 'Shape the product',
    body: 'Early restaurants steer the roadmap. Tell us what your kitchen actually needs and watch it ship.',
  },
  {
    icon: Unlock,
    title: 'No lock-in',
    body: 'Free up to 50 items. No contracts, no setup fees, cancel anytime.',
  },
] as const

export function Testimonials() {
  return (
    <section className="py-20" aria-labelledby="founding-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="founding-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Be one of our founding restaurants
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            OnPar is new, and we&apos;d rather earn your trust than fake it.
            Here&apos;s what the first kitchens get.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="rounded-xl border bg-card p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/10">
                <perk.icon className="size-6 text-brand-600" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold">{perk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {perk.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
