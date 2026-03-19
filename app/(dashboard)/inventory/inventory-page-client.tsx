'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { InventoryAlerts } from '@/components/inventory/inventory-alerts'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryCard } from '@/components/inventory/inventory-card'
import { AddItemDialog } from '@/components/inventory/add-item-dialog'
import { EditItemDialog } from '@/components/inventory/edit-item-dialog'
import { DeleteConfirmDialog } from '@/components/inventory/delete-confirm-dialog'
import { QuantityAdjustDialog } from '@/components/inventory/quantity-adjust-dialog'
import { CSVImportDialog } from '@/components/inventory/csv-import-dialog'
import { deleteItem, bulkDeleteItems } from '@/lib/actions/inventory'
import { exportInventoryToCSV, downloadCSV } from '@/lib/utils/csv'
import { toast } from 'sonner'
import type { InventoryItem, Supplier } from '@/types'

type StatusFilter = 'all' | 'low_stock' | 'expiring'
type SortField = 'name' | 'quantity' | 'expiry_date' | 'price_per_unit' | 'updated_at'

interface InventoryPageClientProps {
  initialItems: InventoryItem[]
  lowStockCount: number
  expiringCount: number
  suppliers: Supplier[]
}

export function InventoryPageClient({
  initialItems,
  lowStockCount,
  expiringCount,
  suppliers,
}: InventoryPageClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // State
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filter and sort items client-side
  const filteredItems = items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedCategory && item.category !== selectedCategory) return false
    if (selectedStatus === 'low_stock' && item.quantity >= item.reorder_point) return false
    if (selectedStatus === 'expiring') {
      if (!item.expiry_date) return false
      const now = new Date()
      const expiry = new Date(item.expiry_date)
      const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      if (diff < 0 || diff > 7) return false
    }
    return true
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * order
      case 'quantity':
        return (a.quantity - b.quantity) * order
      case 'expiry_date': {
        const aDate = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
        const bDate = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
        return (aDate - bDate) * order
      }
      case 'price_per_unit':
        return (a.price_per_unit - b.price_per_unit) * order
      case 'updated_at':
        return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * order
      default:
        return 0
    }
  })

  const handleSort = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortOrder('asc')
      return field
    })
  }, [])

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === sortedItems.length) {
        return new Set()
      }
      return new Set(sortedItems.map((i) => i.id))
    })
  }, [sortedItems])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteItem(deleteTarget.id)
    setDeleteLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success('Item deleted')
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const result = await bulkDeleteItems(ids)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)))
    setSelectedIds(new Set())
    toast.success(`Deleted ${ids.length} items`)
  }

  const handleQuantityUpdated = useCallback((updatedItem: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
  }, [])

  const handleItemDeleted = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }, [])

  const handleExport = () => {
    const csv = exportInventoryToCSV(filteredItems)
    downloadCSV(csv, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('CSV exported')
  }

  const refreshData = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage your restaurant&apos;s inventory
          </p>
        </div>
        {/* Desktop add button */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <InventoryAlerts lowStockCount={lowStockCount} expiringCount={expiringCount} />

      {/* Filters */}
      <InventoryFilters
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        lowStockCount={lowStockCount}
        expiringCount={expiringCount}
      />

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <InventoryTable
          items={sortedItems}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onSelectAll={handleSelectAll}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onEdit={(item) => setEditItem(item)}
          onDelete={(item) => setDeleteTarget(item)}
          onAdjustQuantity={(item) => setAdjustTarget(item)}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sortedItems.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No inventory items found.
          </div>
        ) : (
          sortedItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onQuantityUpdated={handleQuantityUpdated}
              onItemDeleted={handleItemDeleted}
              onLogWaste={() => {
                // Waste logging is built in Tier 5
                toast.info('Waste logging coming soon')
              }}
              onTap={(item) => setEditItem(item)}
            />
          ))
        )}
      </div>

      {/* Mobile CSV actions */}
      <div className="md:hidden flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCsvImportOpen(true)}
          className="flex-1 min-h-[44px]"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex-1 min-h-[44px]"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* FAB for mobile */}
      <Link href="/inventory/add" className="md:hidden">
        <button
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Add inventory item"
        >
          <Plus className="h-6 w-6" />
        </button>
      </Link>

      {/* Dialogs (desktop only for add/edit, mobile uses full pages) */}
      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        suppliers={suppliers}
        onSuccess={refreshData}
      />

      {editItem && (
        <EditItemDialog
          open={!!editItem}
          onOpenChange={(open) => {
            if (!open) setEditItem(null)
          }}
          item={editItem}
          suppliers={suppliers}
          onSuccess={refreshData}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          itemName={deleteTarget.name}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {adjustTarget && (
        <QuantityAdjustDialog
          open={!!adjustTarget}
          onOpenChange={(open) => {
            if (!open) setAdjustTarget(null)
          }}
          item={adjustTarget}
          onUpdated={(updatedItem) => {
            handleQuantityUpdated(updatedItem)
            setAdjustTarget(null)
          }}
        />
      )}

      <CSVImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onSuccess={refreshData}
      />
    </div>
  )
}
