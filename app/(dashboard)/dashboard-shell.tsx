'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OfflineBanner } from '@/components/layout/offline-banner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import type { SerializedNotification } from '@/lib/services/notifications'

interface DashboardShellProps {
  children: React.ReactNode
  userEmail: string
  avatarUrl: string | null
  notifications?: SerializedNotification[]
}

export function DashboardShell({ children, userEmail, avatarUrl, notifications = [] }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar-collapsed')
      if (stored === 'true') setSidebarCollapsed(true)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sidebar-collapsed', String(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>
      {/* Tablet sidebar - always collapsed */}
      <div className="hidden md:block lg:hidden">
        <Sidebar collapsed onToggle={toggleSidebar} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <OfflineBanner />
        <Topbar userEmail={userEmail} avatarUrl={avatarUrl} notifications={notifications} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}
