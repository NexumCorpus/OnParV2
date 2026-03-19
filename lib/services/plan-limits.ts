import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS, type PlanKey } from '@/lib/config'

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const supabase = createAdminClient()

  // 1. Look up stripe_customers for this user_id
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!customer) {
    return 'free'
  }

  // 2. Look up stripe_subscriptions by customer_id
  const { data: subscription } = await supabase
    .from('stripe_subscriptions')
    .select('stripe_price_id, status')
    .eq('stripe_customer_id', customer.stripe_customer_id as string)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return 'free'
  }

  // 3. Map the subscription's price_id to plan name
  const priceId = subscription.stripe_price_id as string
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

export async function canAddInventoryItem(userId: string): Promise<{
  allowed: boolean
  currentCount: number
  limit: number
  plan: string
}> {
  const supabase = createAdminClient()
  const plan = await getUserPlan(userId)
  const limit = PLANS[plan].limits.items

  const { count } = await supabase
    .from('inventory_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)

  const currentCount = count ?? 0

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
    plan: PLANS[plan].name,
  }
}

export async function canAddUser(userId: string): Promise<{
  allowed: boolean
  currentCount: number
  limit: number
}> {
  const plan = await getUserPlan(userId)
  const limit = PLANS[plan].limits.users

  // Future: count team members from a team_members table
  // For now, current count is always 1 (the owner)
  const currentCount = 1

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
  }
}
