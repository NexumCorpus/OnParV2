import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export const metadata: Metadata = {
  title: 'Welcome - OnPar',
  description: 'Set up your restaurant and get started with OnPar.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile for pre-filling
  let restaurantName = ''
  let monthlyBudget: number | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('restaurant_name, monthly_budget')
      .eq('id', user.id)
      .single()

    if (profile) {
      restaurantName = profile.restaurant_name ?? ''
      monthlyBudget = profile.monthly_budget ?? null
    }
  }

  return (
    <OnboardingFlow
      initialRestaurantName={restaurantName}
      initialBudget={monthlyBudget}
    />
  )
}
