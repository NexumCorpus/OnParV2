import Link from 'next/link'
import { Clock, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatting'

interface PurchaseOrderCardProps {
  id: string
  createdAt: string
  supplierName: string
  totalAmount: number
  status: string
  statusConfig: Record<string, { icon: LucideIcon; variant: "default" | "secondary" | "destructive" | "outline"; label: string }>
}

export function PurchaseOrderCard({
  id,
  createdAt,
  supplierName,
  totalAmount,
  status,
  statusConfig,
}: PurchaseOrderCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config?.icon ?? Clock

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{supplierName}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={config?.variant ?? 'outline'} className="gap-1 px-2.5 py-0.5 shrink-0 ml-2">
            <StatusIcon className="h-3 w-3" />
            {config?.label ?? status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
          <Link href={`/purchasing/${id}`}>
            <Button variant="outline" size="sm" className="min-h-[44px]">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
