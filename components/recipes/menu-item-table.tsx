'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatting'
import { MoreVertical, Pencil, Trash2, AlertTriangle, AlertCircle, Link } from 'lucide-react'
import type { MenuItem, Recipe } from '@/types'

interface MenuItemTableProps {
  items: MenuItem[]
  recipes: Recipe[]
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggleActive: (item: MenuItem) => void
  onLinkRecipe: (item: MenuItem) => void
}

function getWasteColor(waste: number): string {
  if (waste < 3) return 'text-green-600 dark:text-green-400'
  if (waste <= 5) return ''
  if (waste <= 8) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getWasteIcon(waste: number) {
  if (waste > 8) return <AlertCircle className="inline h-3.5 w-3.5 ml-1" />
  if (waste > 5) return <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />
  return null
}

function getCogsBadgeVariant(cogsPercent: number): 'default' | 'secondary' | 'destructive' {
  if (cogsPercent < 30) return 'default'
  if (cogsPercent <= 35) return 'secondary'
  return 'destructive'
}

function getCogsBadgeLabel(cogsPercent: number): string {
  if (cogsPercent < 30) return 'Healthy'
  if (cogsPercent <= 35) return 'Watch'
  return 'Review'
}

export function MenuItemTable({
  items,
  recipes,
  onEdit,
  onDelete,
  onToggleActive,
  onLinkRecipe,
}: MenuItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No menu items found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add menu items to track sales and waste percentages.
        </p>
      </div>
    )
  }

  const recipeMap = new Map(recipes.map((r) => [r.id, r]))

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Sales %</TableHead>
            <TableHead className="text-right">Waste %</TableHead>
            <TableHead>COGS</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const linkedRecipe = item.recipe_id ? recipeMap.get(item.recipe_id) : null
            const cogsPercent = linkedRecipe && item.selling_price > 0
              ? (linkedRecipe.cost_per_serving / item.selling_price) * 100
              : null

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.selling_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage(item.sales_percentage)}
                </TableCell>
                <TableCell className={cn('text-right', getWasteColor(item.waste_percentage))}>
                  {formatPercentage(item.waste_percentage)}
                  {getWasteIcon(item.waste_percentage)}
                </TableCell>
                <TableCell>
                  {cogsPercent !== null ? (
                    <Badge variant={getCogsBadgeVariant(cogsPercent)}>
                      {formatPercentage(cogsPercent)} - {getCogsBadgeLabel(cogsPercent)}
                    </Badge>
                  ) : (
                    <button
                      onClick={() => onLinkRecipe(item)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Link className="h-3 w-3" />
                      Link recipe
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={() => onToggleActive(item)}
                    aria-label={`Toggle ${item.name} active`}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
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
          })}
        </TableBody>
      </Table>
    </div>
  )
}
