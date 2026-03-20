import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, type SerializedNotification } from '@/lib/services/notifications'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let serializedNotifications: SerializedNotification[] = []

  try {
    const notifications = await getNotifications(user.id)
    serializedNotifications = notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }))
  } catch {
    // Notifications are non-critical — render dashboard without them
  }

  return (
    <DashboardShell
      userEmail={user.email ?? ''}
      avatarUrl={user.user_metadata?.avatar_url as string | null ?? null}
      notifications={serializedNotifications}
    >
      {children}
    </DashboardShell>
  )
}
