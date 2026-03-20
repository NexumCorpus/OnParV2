import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionStatus } from '@/lib/services/stripe'
import { getTeamMembers } from '@/lib/actions/team'
import { SettingsTabs } from './settings-tabs'
import type { UserSettings } from '@/types'
import type { PlanKey } from '@/lib/config'

export const metadata = {
  title: 'Settings - OnPar',
}

const defaultSettings: UserSettings = {
  reorder_multiplier: 2.0,
  low_stock_threshold: 0.8,
  expiry_warning_days: 7,
  budget_warning_threshold: 90,
  email_notifications: true,
  onboarding_completed: false,
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile and subscription status in parallel
  let profile: Record<string, unknown> | null = null
  let subscriptionStatus: { isSubscribed?: boolean; plan: string | null; status: string | null; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean; customerId: string | null } = { plan: 'free', status: 'not_started', currentPeriodEnd: null, cancelAtPeriodEnd: false, customerId: null }
  let teamResponse: { success: boolean; data?: unknown } = { success: false }

  try {
    const [profileResult, subResult, teamResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
      getSubscriptionStatus(user.id),
      getTeamMembers(),
    ])
    profile = profileResult.data as Record<string, unknown> | null
    subscriptionStatus = subResult
    teamResponse = teamResult
  } catch (error) {
    console.error('[SettingsPage] Data fetch failed:', error)
  }

  const settings: UserSettings = {
    ...defaultSettings,
    ...((profile?.settings as Partial<UserSettings>) ?? {}),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, notifications, billing, and preferences.
        </p>
      </div>

      <SettingsTabs
        email={user.email ?? ''}
        restaurantName={(profile?.restaurant_name as string) ?? ''}
        monthlyBudget={profile?.monthly_budget as number | null}
        avatarUrl={(profile?.avatar_url as string) ?? null}
        settings={settings}
        plan={(subscriptionStatus.plan ?? 'free') as PlanKey}
        subscriptionStatus={subscriptionStatus.status}
        currentPeriodEnd={
          subscriptionStatus.currentPeriodEnd?.toISOString() ?? null
        }
        cancelAtPeriodEnd={subscriptionStatus.cancelAtPeriodEnd}
        customerId={subscriptionStatus.customerId}
        teamData={teamResponse.success ? (teamResponse.data as { orgName: string; currentUserRole: string; members: { userId: string, email: string, role: string, joinedAt: string }[] }) : null}
      />
    </div>
  )
}
