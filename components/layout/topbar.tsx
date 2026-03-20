'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  Bell,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  Clock,
  TrendingDown,
  CreditCard,
  Lightbulb,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MobileNav } from './mobile-nav'
import type { SerializedNotification } from '@/lib/services/notifications'

interface TopbarProps {
  userEmail?: string
  avatarUrl?: string | null
  notifications?: SerializedNotification[]
}

const NOTIFICATION_ICONS: Record<SerializedNotification['type'], typeof AlertTriangle> = {
  low_stock: AlertTriangle,
  expiring_soon: Clock,
  waste_alert: TrendingDown,
  budget_warning: CreditCard,
  insight_available: Lightbulb,
}

const SEVERITY_COLORS: Record<SerializedNotification['severity'], string> = {
  critical: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export function Topbar({ userEmail, avatarUrl, notifications = [] }: TopbarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()

  // Load dismissed IDs from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('dismissed-notifications')
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        setDismissedIds(new Set(parsed))
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [])

  function dismissNotification(id: string) {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      try {
        sessionStorage.setItem('dismissed-notifications', JSON.stringify([...next]))
      } catch {
        // Ignore
      }
      return next
    })
  }

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id))
  const criticalCount = visibleNotifications.filter((n) => n.severity === 'critical').length
  const warningCount = visibleNotifications.filter((n) => n.severity === 'warning').length
  const badgeCount = criticalCount + warningCount
  const hasCritical = criticalCount > 0

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'U'

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 text-base h-10"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notification bell with popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative min-h-[44px] min-w-[44px]"
                aria-label={`Notifications${badgeCount > 0 ? ` (${badgeCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {badgeCount > 0 && (
                  <Badge
                    variant="destructive"
                    className={`absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] ${
                      hasCritical ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  >
                    {badgeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0" align="end">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {visibleNotifications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {visibleNotifications.length} notification{visibleNotifications.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {visibleNotifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {visibleNotifications.map((notification) => {
                      const Icon = NOTIFICATION_ICONS[notification.type]
                      return (
                        <div key={notification.id} className="flex items-start gap-3 p-3 hover:bg-muted/50">
                          <Icon
                            className={`h-4 w-4 mt-0.5 shrink-0 ${SEVERITY_COLORS[notification.severity]}`}
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="text-xs text-brand-600 hover:underline mt-1 inline-block"
                              >
                                View details
                              </Link>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => dismissNotification(notification.id)}
                            aria-label={`Dismiss ${notification.title}`}
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full min-h-[44px] min-w-[44px]"
                aria-label="User menu"
              >
                <Avatar>
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="User avatar" />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  {userEmail && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile navigation sheet */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  )
}
