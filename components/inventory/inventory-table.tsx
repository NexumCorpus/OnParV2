'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, MoreVertical, Pencil, Trash2, SlidersHorizontal } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatting'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

type SortField = 'name' | 'quantity' | 'expiry_date' | 'price_per_unit' | 'updated_at'

interface InventoryTableProps {
  items: InventoryItem[]
  selectedIds: Set<string>
  onSelectToggle: (id: string) => void
  onSelectAll: () => void
  onSort: (field: SortField) => void
  sortBy: SortField
  sortOrder: 'asc' | 'desc'
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onAdjustQuantity: (item: InventoryItem) => void
}

function isExpiringSoon(expiryDate: string | null, days: number = 7): boolean {
  if (!expiryDate) return false
  const expiry = parseISO(expiryDate)
  const now = new Date()
  const diff = differenceInDays(expiry, now)
  return diff >= 0 && diff <= days
}

function isLowStock(item: InventoryItem): boolean {
  return item.quantity < item.reorder_point
}

export function InventoryTable({
  items,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onAdjustQuantity,
}: InventoryTableProps) {
  const allSelected = items.length > 0 && selectedIds.size === items.length

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown
        className={cn(
          'h-3 w-3',
          sortBy === field ? 'text-foreground' : 'text-muted-foreground/50'
        )}
      />
    </button>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>
              <SortHeader field="name">Name</SortHeader>
            </TableHead>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[100px]">
              <SortHeader field="quantity">Qty</SortHeader>
            </TableHead>
            <TableHead className="w-[80px]">Unit</TableHead>
            <TableHead className="w-[100px]">
              <SortHeader field="expiry_date">Expiry</SortHeader>
            </TableHead>
            <TableHead className="w-[80px]">
              <SortHeader field="price_per_unit">Price</SortHeader>
            </TableHead>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No inventory items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const expiring = isExpiringSoon(item.expiry_date)
              const expiringCritical = isExpiringSoon(item.expiry_date, 3)
              const lowStock = isLowStock(item)

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => onSelectToggle(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expiringCritical && (
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-label="Expiring soon" />
                      )}
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.quantity}
                      {lowStock && (
                        <span className="text-yellow-600 dark:text-yellow-400" title="Low stock">
                          &#9888;
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        expiring && 'text-red-600 dark:text-red-400 font-medium'
                      )}
                    >
                      {formatDate(item.expiry_date)}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(item.price_per_unit)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdjustQuantity(item)}>
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Adjust Qty
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
