'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { WasteEvent, InventoryItem } from '@/types'

interface WasteEventsListProps {
  wasteEvents: WasteEvent[]
  inventoryItems: InventoryItem[]
}

const reasonLabels: Record<string, string> = {
  expired: 'Expired',
  spoiled: 'Spoiled',
  overproduction: 'Overproduced',
  prep_waste: 'Prep Waste',
  damaged: 'Damaged',
  customer_return: 'Customer Return',
  quality_issue: 'Quality Issue',
  other: 'Other',
}

export function WasteEventsList({ wasteEvents, inventoryItems }: WasteEventsListProps) {
  const itemMap = new Map(inventoryItems.map((i) => [i.id, i]))
  const recentEvents = wasteEvents.slice(0, 20)

  if (recentEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Waste Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No waste events recorded yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Waste Events</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event) => {
                const item = event.inventory_item_id
                  ? itemMap.get(event.inventory_item_id)
                  : undefined
                const date = new Date(event.recorded_at)
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item?.name ?? 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {event.quantity} {event.unit}
                    </TableCell>
                    <TableCell>${event.estimated_value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reasonLabels[event.reason] ?? event.reason}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile list */}
        <div className="space-y-2 md:hidden">
          {recentEvents.map((event) => {
            const item = event.inventory_item_id
              ? itemMap.get(event.inventory_item_id)
              : undefined
            return (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item?.name ?? 'Unknown'}</p>
                  <p className="text-muted-foreground">
                    {event.quantity} {event.unit} &middot;{' '}
                    {reasonLabels[event.reason] ?? event.reason}
                  </p>
                </div>
                <span className="font-medium">${event.estimated_value.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
