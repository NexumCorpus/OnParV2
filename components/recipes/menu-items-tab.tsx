'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MenuItemTable } from './menu-item-table'
import { AddMenuItemDialog } from './add-menu-item-dialog'
import { MenuPerformanceSummary } from './menu-performance-summary'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteMenuItem, toggleMenuItemActive } from '@/lib/actions/menu'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { SEARCH_DEBOUNCE_MS } from '@/lib/config'
import type { MenuItem, Recipe } from '@/types'

interface MenuItemsTabProps {
  initialItems: MenuItem[]
  initialRecipes: Recipe[]
  initialStats: {
    totalItems: number
    activeItems: number
    avgWastePercentage: number
    topPerformers: MenuItem[]
    worstPerformers: MenuItem[]
  }
}

export function MenuItemsTab({
  initialItems,
  initialRecipes,
  initialStats,
}: MenuItemsTabProps) {
  const [items, setItems] = useState(initialItems)
  const [recipes] = useState(initialRecipes)
  const [stats, setStats] = useState(initialStats)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const filteredItems = debouncedSearch
    ? items.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : items

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/menu')
      if (res.ok) {
        const data = (await res.json()) as { items: MenuItem[]; stats: typeof initialStats }
        setItems(data.items)
        setStats(data.stats)
      }
    } catch {
      // data stays stale
    }
  }, [])

  const handleToggleActive = async (item: MenuItem) => {
    const result = await toggleMenuItemActive(item.id)
    if (result.success) {
      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      )
      toast.success(`${item.name} ${item.is_active ? 'deactivated' : 'activated'}`)
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteMenuItem(deleteTarget.id)
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      toast.success('Menu item deleted')
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const handleLinkRecipe = (item: MenuItem) => {
    setEditItem(item)
  }

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="min-h-[44px]">
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Table */}
      <MenuItemTable
        items={filteredItems}
        recipes={recipes}
        onEdit={(item) => setEditItem(item)}
        onDelete={(item) => setDeleteTarget(item)}
        onToggleActive={handleToggleActive}
        onLinkRecipe={handleLinkRecipe}
      />

      {/* Performance Summary */}
      <MenuPerformanceSummary
        totalItems={stats.totalItems}
        activeItems={stats.activeItems}
        avgWastePercentage={stats.avgWastePercentage}
        topPerformers={stats.topPerformers}
        worstPerformers={stats.worstPerformers}
      />

      {/* Add / Edit Dialog */}
      <AddMenuItemDialog
        open={addDialogOpen || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setAddDialogOpen(false)
            setEditItem(null)
          }
        }}
        recipes={recipes}
        editItem={editItem}
        onSuccess={() => {
          refreshData()
          setEditItem(null)
          setAddDialogOpen(false)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
