'use client'

import { useCallback } from 'react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

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

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold" aria-hidden="true">
              O
            </span>
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <nav className="px-2 py-4" aria-label="Mobile navigation">
            <ul className="space-y-1" role="list">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <Separator className="my-4" />

            <ul className="space-y-1" role="list">
              <li>
                <Link
                  href="/settings"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive('/settings')
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  aria-current={isActive('/settings') ? 'page' : undefined}
                >
                  <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground min-h-[44px]"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Sign Out</span>
                </Button>
              </li>
            </ul>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
