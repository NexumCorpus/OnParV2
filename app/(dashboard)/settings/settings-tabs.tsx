'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/settings/profile-form'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { BillingInfo } from '@/components/settings/billing-info'
import { AppearanceSettings } from '@/components/settings/appearance-settings'
import { DangerZone } from '@/components/settings/danger-zone'
import type { UserSettings } from '@/types'
import type { PlanKey } from '@/lib/config'

interface SettingsTabsProps {
  email: string
  restaurantName: string
  monthlyBudget: number | null
  avatarUrl: string | null
  settings: UserSettings
  plan: PlanKey
  subscriptionStatus: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  customerId: string | null
}

export function SettingsTabs({
  email,
  restaurantName,
  monthlyBudget,
  avatarUrl,
  settings,
  plan,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  customerId,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileForm
          email={email}
          restaurantName={restaurantName}
          monthlyBudget={monthlyBudget}
          avatarUrl={avatarUrl}
        />
        <DangerZone email={email} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings settings={settings} />
      </TabsContent>

      <TabsContent value="billing">
        <BillingInfo
          plan={plan}
          status={subscriptionStatus}
          currentPeriodEnd={currentPeriodEnd}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          customerId={customerId}
        />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  )
}
