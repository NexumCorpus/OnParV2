'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ChefHat,
  TrendingDown,
  Lightbulb,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Purchasing', href: '/purchasing', icon: ShoppingCart },
  { label: 'Recipes', href: '/recipes', icon: ChefHat },
  { label: 'Waste', href: '/waste', icon: TrendingDown },
  { label: 'Insights', href: '/insights', icon: Lightbulb },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Suppliers', href: '/suppliers', icon: Truck },
]

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center px-2')}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold" aria-hidden="true">
              O
            </span>
            {!collapsed && <span>{APP_NAME}</span>}
          </Link>
        </div>

        {/* Nav items */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav aria-label="Primary navigation">
            <ul className="space-y-1" role="list">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }

                return <li key={item.href}>{linkContent}</li>
              })}
            </ul>
          </nav>
        </ScrollArea>

        {/* Bottom items */}
        <div className="mt-auto border-t px-2 py-4">
          <nav aria-label="Secondary navigation">
            <ul className="space-y-1" role="list">
              {bottomItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }

                return <li key={item.href}>{linkContent}</li>
              })}

              <li>
                <Separator className="my-2" />
              </li>

              <li>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-center px-2 text-sidebar-muted-foreground hover:text-sidebar-foreground min-h-[44px]"
                      >
                        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="sr-only">Sign out</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Sign Out
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-3 px-3 text-sidebar-muted-foreground hover:text-sidebar-foreground min-h-[44px]"
                  >
                    <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Sign Out</span>
                  </Button>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  )
}
