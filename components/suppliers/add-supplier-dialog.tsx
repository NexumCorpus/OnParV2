'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Star } from 'lucide-react'
import { supplierSchema, type SupplierFormValues } from '@/lib/utils/validation'
import {
  createSupplier,
  updateSupplier,
} from '@/lib/actions/suppliers'
import { toast } from 'sonner'
import type { Supplier } from '@/types'

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSuccess: () => void
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: AddSupplierDialogProps) {
  const isEditing = !!supplier
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(supplier?.rating ?? 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      contact_email: supplier?.contact_email ?? '',
      contact_phone: supplier?.contact_phone ?? '',
      address: supplier?.address ?? '',
      notes: supplier?.notes ?? '',
      rating: supplier?.rating ?? null,
      is_active: supplier?.is_active ?? true,
    },
  })

  const isActive = watch('is_active')

  const onSubmit = async (data: SupplierFormValues) => {
    setLoading(true)
    const formData = new FormData()
    formData.set('name', data.name)
    if (data.contact_email) formData.set('contact_email', data.contact_email)
    if (data.contact_phone) formData.set('contact_phone', data.contact_phone)
    if (data.address) formData.set('address', data.address)
    if (data.notes) formData.set('notes', data.notes)
    if (rating > 0) formData.set('rating', String(rating))
    formData.set('is_active', String(data.is_active ?? true))

    const result = isEditing
      ? await updateSupplier(supplier.id, formData)
      : await createSupplier(formData)

    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? 'Supplier updated' : 'Supplier added')
    reset()
    setRating(0)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="supplier-name">Supplier Name *</Label>
            <Input
              id="supplier-name"
              placeholder="e.g., Fresh Valley Farms"
              {...register('name')}
              className="min-h-[44px] text-base"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                placeholder="orders@example.com"
                {...register('contact_email')}
                className="min-h-[44px] text-base"
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive">{errors.contact_email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                placeholder="555-0123"
                {...register('contact_phone')}
                className="min-h-[44px] text-base"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="supplier-address">Address</Label>
            <Input
              id="supplier-address"
              placeholder="123 Main St, City, State"
              {...register('address')}
              className="min-h-[44px] text-base"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="supplier-notes">Notes</Label>
            <textarea
              id="supplier-notes"
              placeholder="Additional notes..."
              {...register('notes')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground"
              rows={3}
            />
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const newRating = i + 1
                    setRating(newRating)
                    setValue('rating', newRating)
                  }}
                  className="p-0.5"
                  aria-label={`Rate ${i + 1} star`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="supplier-active"
              checked={isActive ?? true}
              onCheckedChange={(checked) => {
                setValue('is_active', checked === true)
              }}
            />
            <Label htmlFor="supplier-active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Supplier' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
