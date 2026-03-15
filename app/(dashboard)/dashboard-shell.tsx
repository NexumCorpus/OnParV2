'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OfflineBanner } from '@/components/layout/offline-banner'

interface DashboardShellProps {
  children: React.ReactNode
  userEmail: string
  avatarUrl: string | null
}

export function DashboardShell({ children, userEmail, avatarUrl }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar - full width */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      {/* Tablet sidebar - collapsed */}
      <div className="hidden md:block lg:hidden">
        <Sidebar collapsed />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <OfflineBanner />
        <Topbar userEmail={userEmail} avatarUrl={avatarUrl} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
