import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/services/notifications'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const notifications = await getNotifications(user.id)

  // Serialize Date objects for client component
  const serializedNotifications = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt,
  }))

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
