'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, Pencil, Star } from 'lucide-react'
import type { Supplier } from '@/types'

interface SupplierListProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null
  const stars = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${stars} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < stars
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function SupplierList({ suppliers, onEdit }: SupplierListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No suppliers found. Add your first supplier to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {suppliers.map((supplier) => (
        <Card key={supplier.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{supplier.name}</h3>
                  <StarRating rating={supplier.rating} />
                  <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {supplier.contact_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {supplier.contact_email}
                    </span>
                  )}
                  {supplier.contact_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {supplier.contact_phone}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                className="min-h-[44px]"
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
