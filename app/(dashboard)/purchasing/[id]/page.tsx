import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatting'
import { getPurchaseOrderDetails } from '@/lib/actions/purchasing'
import { PoActionButtons } from '@/components/purchasing/po-action-buttons'
import type { PurchaseOrder, PurchaseOrderLineItem } from '@/types'

interface POWithSupplier extends PurchaseOrder {
  suppliers: { name: string, contact_email: string | null } | null
}

interface POLineItemWithItem extends PurchaseOrderLineItem {
  inventory_items: { name: string, unit: string } | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return {
    title: `PO ${resolvedParams.id.split('-')[0]} - OnPar`,
  }
}

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const response = await getPurchaseOrderDetails(id)
  if (!response.success || !response.data) {
    notFound()
  }

  const responseData = response.data as { po: unknown, items: unknown }
  const po = responseData.po as POWithSupplier
  const items = responseData.items as POLineItemWithItem[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/purchasing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{po.id.split('-')[0].toUpperCase()}
              </h1>
              <Badge variant={
                po.status === 'received' ? 'outline' : 
                po.status === 'sent' ? 'default' : 
                'secondary'
              }>
                {po.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(po.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <PoActionButtons poId={po.id} status={po.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Supplier Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 text-muted-foreground">
              <span>Name:</span>
              <span className="col-span-2 font-medium text-foreground">{po.suppliers?.name ?? 'Unknown'}</span>
            </div>
            <div className="grid grid-cols-3 text-muted-foreground">
              <span>Email:</span>
              <span className="col-span-2 font-medium text-foreground">{po.suppliers?.contact_email ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              Order Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 text-muted-foreground">
              <span>Expected:</span>
              <span className="col-span-2 font-medium text-foreground">
                {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'Unspecified'}
              </span>
            </div>
            {po.received_at && (
              <div className="grid grid-cols-3 text-muted-foreground">
                <span>Received:</span>
                <span className="col-span-2 font-medium text-foreground">
                  {new Date(po.received_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Items included in this purchase order.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="font-medium pb-3 pl-2">Item</th>
                  <th className="font-medium pb-3 text-right">Qty Ordered</th>
                  <th className="font-medium pb-3 text-right">Qty Received</th>
                  <th className="font-medium pb-3 text-right">Unit Price</th>
                  <th className="font-medium pb-3 text-right pr-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 pl-2 font-medium">
                      {item.inventory_items?.name ?? 'Unknown'} 
                      <span className="text-muted-foreground font-normal ml-1">({item.inventory_items?.unit ?? ''})</span>
                    </td>
                    <td className="py-3 text-right">{item.quantity_ordered}</td>
                    <td className="py-3 text-right">
                      {item.quantity_received > 0 ? (
                        <span className="text-green-600 font-medium">{item.quantity_received}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 pr-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/20 p-6">
          <div className="flex items-center gap-4 text-lg">
            <span className="text-muted-foreground font-medium">Total Amount:</span>
            <span className="font-bold">{formatCurrency(po.total_amount)}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
