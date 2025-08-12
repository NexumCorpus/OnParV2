'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Package,
  ChefHat,
  Users,
  BarChart3,
  FileText,
  Plus,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Star,
  Settings,
  CreditCard,
  Bell
} from 'lucide-react'

interface SearchCommandProps {
  inventoryItems?: any[]
  menuItems?: any[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ 
  inventoryItems = [], 
  menuItems = [], 
  isOpen, 
  onOpenChange 
}: SearchCommandProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!isOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, onOpenChange])

  const handleSelect = (callback: () => void) => {
    onOpenChange(false)
    callback()
  }

  const quickActions = [
    {
      label: 'Add Inventory Item',
      icon: Plus,
      action: () => router.push('/dashboard?tab=inventory&action=add'),
      keywords: 'add inventory item stock'
    },
    {
      label: 'Add Menu Item',
      icon: ChefHat,
      action: () => router.push('/dashboard?tab=menu&action=add'),
      keywords: 'add menu item dish recipe'
    },
    {
      label: 'Generate Report',
      icon: FileText,
      action: () => router.push('/dashboard?tab=reports'),
      keywords: 'report analytics export'
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      action: () => router.push('/dashboard?tab=analytics'),
      keywords: 'analytics charts insights'
    },
    {
      label: 'Check Notifications',
      icon: Bell,
      action: () => router.push('/dashboard?tab=notifications'),
      keywords: 'notifications alerts warnings'
    }
  ]

  const navigationItems = [
    {
      label: 'Dashboard Overview',
      icon: BarChart3,
      action: () => router.push('/dashboard'),
      keywords: 'dashboard home overview'
    },
    {
      label: 'Inventory Management',
      icon: Package,
      action: () => router.push('/dashboard?tab=inventory'),
      keywords: 'inventory stock items'
    },
    {
      label: 'Menu Performance',
      icon: ChefHat,
      action: () => router.push('/dashboard?tab=menu'),
      keywords: 'menu items dishes performance'
    },
    {
      label: 'Recipe Manager',
      icon: Star,
      action: () => router.push('/dashboard?tab=recipes'),
      keywords: 'recipes cooking instructions'
    },
    {
      label: 'Supplier Management',
      icon: Users,
      action: () => router.push('/dashboard?tab=suppliers'),
      keywords: 'suppliers vendors orders'
    },
    {
      label: 'Analytics Dashboard',
      icon: TrendingUp,
      action: () => router.push('/dashboard?tab=analytics'),
      keywords: 'analytics reports insights'
    },
    {
      label: 'Reports & Export',
      icon: FileText,
      action: () => router.push('/dashboard?tab=reports'),
      keywords: 'reports export data'
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => router.push('/profile'),
      keywords: 'settings profile preferences'
    },
    {
      label: 'Billing & Subscription',
      icon: CreditCard,
      action: () => router.push('/pricing'),
      keywords: 'billing subscription payment'
    }
  ]

  // Filter items based on search term
  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredNavigation = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => onOpenChange(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search everything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
        <CommandInput 
          placeholder="Search inventory, menu items, actions..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {filteredActions.length > 0 && (
            <CommandGroup heading="Quick Actions">
              {filteredActions.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleSelect(action.action)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {filteredInventory.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Inventory Items">
                {filteredInventory.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(() => 
                      router.push(`/dashboard?tab=inventory&item=${item.id}`)
                    )}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit}
                      </span>
                      {item.quantity <= item.reorder_point && (
                        <Badge variant="destructive" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {filteredMenu.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Menu Items">
                {filteredMenu.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(() => 
                      router.push(`/dashboard?tab=menu&item=${item.id}`)
                    )}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.sales_percentage.toFixed(1)}% sales
                      </span>
                      {item.waste_percentage > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          High Waste
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {filteredNavigation.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Navigation">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.label}
                      onSelect={() => handleSelect(item.action)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}