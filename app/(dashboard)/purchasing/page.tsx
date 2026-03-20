import Link from 'next/link'
import { Plus, ShoppingCart, CheckCircle, Clock, AlertCircle, FileText, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatting'
import { getPurchaseOrders } from '@/lib/actions/purchasing'
import type { PurchaseOrder } from '@/types'

export const metadata = {
  title: 'Purchase Orders - OnPar',
}

const statusConfig: Record<string, { icon: LucideIcon; variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  draft: { icon: Clock, variant: "secondary", label: "Draft" },
  sent: { icon: ShoppingCart, variant: "default", label: "Sent" },
  partially_received: { icon: AlertCircle, variant: "outline", label: "Partial" },
  received: { icon: CheckCircle, variant: "outline", label: "Received" },
  cancelled: { icon: AlertCircle, variant: "destructive", label: "Cancelled" }
}

interface POWithDetails extends PurchaseOrder {
  suppliers: { name: string } | null
  users: { email: string } | null
}

export default async function PurchaseOrdersPage() {
  let purchaseOrders: POWithDetails[] = []
  try {
    const response = await getPurchaseOrders()
    purchaseOrders = response.success ? (response.data as POWithDetails[]) ?? [] : []
  } catch (error) {
    console.error('[PurchaseOrdersPage] Data fetch failed:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your supplier orders and track deliveries.
          </p>
        </div>
        <Link href="/purchasing/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>View all purchase orders across your suppliers.</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No purchase orders found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                You haven&apos;t created any purchase orders yet. Start by creating an order for your low-stock items.
              </p>
              <Link href="/purchasing/new" className="mt-4">
                <Button>Create Your First Order</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="font-medium pb-3 pl-2">Date</th>
                    <th className="font-medium pb-3">Supplier</th>
                    <th className="font-medium pb-3">Total</th>
                    <th className="font-medium pb-3">Status</th>
                    <th className="font-medium pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => {
                    const status = statusConfig[po.status]
                    const StatusIcon = status?.icon || Clock

                    return (
                      <tr key={po.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 pl-2 uppercase whitespace-nowrap">
                          {new Date(po.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium">
                          {po.suppliers?.name ?? 'Unknown Supplier'}
                        </td>
                        <td className="py-3 font-medium">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3">
                          <Badge variant={status?.variant ?? 'outline'} className="gap-1 px-2.5 py-0.5">
                            <StatusIcon className="h-3 w-3" />
                            {status?.label ?? po.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <Link href={`/purchasing/${po.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
