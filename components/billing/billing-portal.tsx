'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface BillingPortalProps {
  customerId?: string
  isPremium: boolean
  subscriptionStatus?: string
}

export function BillingPortal({ customerId, isPremium, subscriptionStatus }: BillingPortalProps) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    if (!customerId) {
      toast.error('No billing information found')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing & Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Plan:</span>
          <Badge variant={isPremium ? 'default' : 'secondary'}>
            {isPremium ? 'Premium' : 'Basic'}
          </Badge>
        </div>
        
        {subscriptionStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={subscriptionStatus === 'active' ? 'default' : 'destructive'}>
              {subscriptionStatus}
            </Badge>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            onClick={handleManageBilling}
            disabled={loading || !customerId}
            className="w-full"
            variant="outline"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
          
          {!customerId && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Subscribe to a plan to access billing management
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}