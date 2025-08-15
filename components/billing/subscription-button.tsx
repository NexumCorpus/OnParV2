'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { getStripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Zap, Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SubscriptionButtonProps {
  priceId: string
  planName: string
  price: number
  description: string
  features: readonly string[]
  popular?: boolean
  currentPlan?: boolean
}

export function SubscriptionButton({ 
  priceId, 
  planName, 
  price, 
  description,
  features, 
  popular = false,
  currentPlan = false 
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const { user } = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to subscribe')
        return
      }

      // Get the user's JWT token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to continue')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
          mode: 'subscription',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`relative ${popular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          {planName === 'OnPar AI Premium' && <Crown className="h-5 w-5 text-orange-500" />}
          {planName}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-600 rounded-full flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          variant={popular ? 'default' : 'outline'}
          onClick={handleSubscribe}
          disabled={loading || currentPlan}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {planName === 'OnPar AI Premium' && !loading && <Zap className="h-4 w-4 mr-2" />}
          {currentPlan ? 'Current Plan' : `Subscribe to ${planName}`}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. No long-term contracts.
        </p>
      </CardContent>
    </Card>
  )
}