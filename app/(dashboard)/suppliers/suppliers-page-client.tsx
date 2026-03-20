'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SupplierList } from '@/components/suppliers/supplier-list'
import { AddSupplierDialog } from '@/components/suppliers/add-supplier-dialog'
import type { Supplier } from '@/types'

interface SuppliersPageClientProps {
  initialSuppliers: Supplier[]
}

export function SuppliersPageClient({ initialSuppliers }: SuppliersPageClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [suppliers] = useState(initialSuppliers)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your ingredient suppliers
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="hidden md:flex">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 min-h-[44px] text-base"
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Supplier list */}
      <SupplierList
        suppliers={filteredSuppliers}
        onEdit={(supplier) => setEditSupplier(supplier)}
      />

      {/* FAB for mobile */}
      <button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors md:hidden"
        onClick={() => setAddDialogOpen(true)}
        aria-label="Add supplier"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add dialog */}
      <AddSupplierDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refreshData}
      />

      {/* Edit dialog */}
      {editSupplier && (
        <AddSupplierDialog
          open={!!editSupplier}
          onOpenChange={(open) => {
            if (!open) setEditSupplier(null)
          }}
          supplier={editSupplier}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}
