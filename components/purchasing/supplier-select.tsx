'use client'

import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface SupplierSelectProps {
  suppliers: { id: string; name: string }[]
  defaultValue: string
}

export function SupplierSelect({ suppliers, defaultValue }: SupplierSelectProps) {
  const router = useRouter()

  const handleChange = (val: string) => {
    router.push(`/purchasing/new?supplier=${val}`)
  }

  return (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor="supplier-select">Select Supplier</Label>
      <Select value={defaultValue} onValueChange={handleChange}>
        <SelectTrigger id="supplier-select">
          <SelectValue placeholder="Choose a supplier..." />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map(s => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
