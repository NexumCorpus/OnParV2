'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createPortal } from '@/lib/actions/settings'
import { PLANS, type PlanKey } from '@/lib/config'

interface BillingInfoProps {
  plan: PlanKey | null
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  customerId: string | null
}

export function BillingInfo({
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  customerId,
}: BillingInfoProps) {
  const [isPending, startTransition] = useTransition()
  const [, setPortalUrl] = useState<string | null>(null)

  const currentPlan = plan ?? 'free'
  const planConfig = PLANS[currentPlan]
  const isFreePlan = currentPlan === 'free'

  function handleManageSubscription() {
    startTransition(async () => {
      const result = await createPortal()
      if ('url' in result) {
        setPortalUrl(result.url)
        window.open(result.url, '_blank')
      } else {
        toast.error(result.error)
      }
    })
  }

  function getStatusBadge() {
    if (!status) return null
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
    }
    return (
      <Badge variant={variants[status] ?? 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>
          Manage your subscription and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current plan info */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold">
                {planConfig.name}
                {!isFreePlan && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    (${planConfig.price.monthly}/month)
                  </span>
                )}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {!isFreePlan && status && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
                </span>
                <span>{formatDate(currentPeriodEnd)}</span>
              </div>

              {cancelAtPeriodEnd && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Your subscription will not renew after the current period.
                </p>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {customerId && !isFreePlan && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Manage Subscription
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href="/pricing">
              <ExternalLink className="size-4" />
              {isFreePlan ? 'Upgrade Plan' : 'Change Plan'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
