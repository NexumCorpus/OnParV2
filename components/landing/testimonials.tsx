'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Testimonial {
  quote: string
  author: string
  role: string
  restaurant: string
  rating: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'OnPar helped us reduce waste by 18% in the first month. The AI insights are spot on and helped us identify patterns we never noticed.',
    author: 'Chef Marco',
    role: 'Head Chef',
    restaurant: 'Bella Italia',
    rating: 5,
  },
  {
    quote:
      'We saved over $600 monthly after switching to OnPar. The inventory tracking alone pays for itself, and the waste analytics are game-changing.',
    author: 'Sarah Chen',
    role: 'Owner',
    restaurant: 'The Golden Wok',
    rating: 5,
  },
  {
    quote:
      'Finally, an inventory system built for restaurants. The recipe cost analysis helped us reprice our menu and boost margins by 12%.',
    author: 'James Rodriguez',
    role: 'General Manager',
    restaurant: 'Coastal Kitchen',
    rating: 5,
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  function goToPrev() {
    setActiveIndex((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    )
  }

  function goToNext() {
    setActiveIndex((prev) =>
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
    )
  }

  const testimonial = TESTIMONIALS[activeIndex]

  return (
    <section className="py-20" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Loved by restaurant owners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about OnPar.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div
            className="rounded-xl border bg-card p-8 text-center shadow-sm"
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
          >
            {/* Stars */}
            <div
              className="flex items-center justify-center gap-1"
              aria-label={`${testimonial.rating} out of 5 stars`}
            >
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="size-5 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-6">
              <p className="text-lg leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </blockquote>

            {/* Author */}
            <div className="mt-6">
              <p className="font-semibold">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role}, {testimonial.restaurant}
              </p>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                aria-label="Previous testimonial"
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Testimonial ${i + 1}`}
                    className={`size-2.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      i === activeIndex
                        ? 'bg-brand-600'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    onClick={() => setActiveIndex(i)}
                  >
                    <span
                      className={`block size-2.5 rounded-full ${
                        i === activeIndex
                          ? 'bg-brand-600'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                aria-label="Next testimonial"
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
