import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/config'
import type { PlanKey } from '@/lib/config'

const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey) : null

/** Create a Stripe Checkout session for a subscription */
export async function createCheckoutSession(params: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string }> {
  if (!stripe) throw new Error('Billing is not configured')

  const supabase = createAdminClient()
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', params.userId)
    .single()

  const email = userData?.email ?? undefined
  const customerId = await getOrCreateStripeCustomer(params.userId, email ?? '')

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: params.userId },
    },
    metadata: { userId: params.userId },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  return { url: session.url }
}

/** Create a Stripe Customer Portal session for managing an existing subscription */
export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<{ url: string }> {
  if (!stripe) throw new Error('Billing is not configured')

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })

  return { url: session.url }
}

/** Get a user's current subscription status */
export async function getSubscriptionStatus(userId: string): Promise<{
  isSubscribed: boolean
  plan: PlanKey | null
  status: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  customerId: string | null
}> {
  if (!stripe) {
    return {
      isSubscribed: false,
      plan: 'free',
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
    }
  }

  const supabase = createAdminClient()

  // Look up stripe customer
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!customer) {
    return {
      isSubscribed: false,
      plan: 'free',
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
    }
  }

  // Look up active subscription
  const { data: subscription } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('stripe_customer_id', customer.stripe_customer_id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return {
      isSubscribed: false,
      plan: 'free',
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: customer.stripe_customer_id,
    }
  }

  // Map price_id to plan
  const plan = mapPriceIdToPlan(subscription.stripe_price_id as string)

  return {
    isSubscribed: true,
    plan,
    status: subscription.status as string,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end as string)
      : null,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    customerId: customer.stripe_customer_id,
  }
}

/** Link a Supabase user to a Stripe customer, creating the customer if needed */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  if (!stripe) throw new Error('Billing is not configured')

  const supabase = createAdminClient()

  // Check for existing record
  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return existing.stripe_customer_id as string
  }

  // Create Stripe customer
  const customer = await stripe!.customers.create({
    email,
    metadata: { userId },
  })

  // Store mapping
  await supabase.from('stripe_customers').insert({
    user_id: userId,
    stripe_customer_id: customer.id,
  })

  return customer.id
}

/** Map a Stripe price ID to a plan key */
function mapPriceIdToPlan(priceId: string): PlanKey {
  for (const [key, plan] of Object.entries(PLANS)) {
    if ('stripePriceId' in plan) {
      const pricePlan = plan as typeof PLANS.starter | typeof PLANS.professional
      if (
        pricePlan.stripePriceId.monthly === priceId ||
        pricePlan.stripePriceId.annual === priceId
      ) {
        return key as PlanKey
      }
    }
  }
  return 'free'
}

/** Expose the stripe instance for the webhook handler */
export { stripe }
