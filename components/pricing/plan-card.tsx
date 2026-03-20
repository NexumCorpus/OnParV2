'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/error-messages'
import { Check, X, Loader2, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createCheckout } from '@/lib/actions/settings'

interface PlanCardProps {
  name: string
  price: { monthly: number; annual: number }
  features: readonly string[]
  excludedFeatures?: string[]
  isAnnual: boolean
  isPopular?: boolean
  priceId?: { monthly: string; annual: string }
  isCurrentPlan?: boolean
}

export function PlanCard({
  name,
  price,
  features,
  excludedFeatures = [],
  isAnnual,
  isPopular = false,
  priceId,
  isCurrentPlan = false,
}: PlanCardProps) {
  const [isPending, startTransition] = useTransition()

  const displayPrice = isAnnual ? price.annual : price.monthly
  const isFree = price.monthly === 0

  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  function handleSubscribe() {
    if (!priceId) return
    if (!stripeConfigured) {
      toast.info('Billing is coming soon!')
      return
    }

    const selectedPriceId = isAnnual ? priceId.annual : priceId.monthly

    startTransition(async () => {
      const result = await createCheckout(selectedPriceId)
      if ('url' in result) {
        window.location.href = result.url
      } else {
        toast.error(getUserFriendlyError(result.error))
      }
    })
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isPopular && 'border-primary shadow-lg ring-1 ring-primary'
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Star className="mr-1 size-3" />
          Popular
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            ${displayPrice}
          </span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        {!isFree && isAnnual && (
          <p className="text-sm text-muted-foreground">
            Billed annually (${price.annual * 12}/year)
          </p>
        )}
        {!isFree && !isAnnual && (
          <p className="text-sm text-muted-foreground">
            ${price.annual}/mo if billed annually
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
              <span>{feature}</span>
            </li>
          ))}
          {excludedFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <X className="mt-0.5 size-4 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            Current Plan
          </Button>
        ) : isFree ? (
          <Button className="w-full" variant="outline" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={isPopular ? 'default' : 'outline'}
            onClick={handleSubscribe}
            disabled={isPending || !stripeConfigured}
          >
            {!stripeConfigured ? (
              'Coming Soon'
            ) : isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Trial'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
