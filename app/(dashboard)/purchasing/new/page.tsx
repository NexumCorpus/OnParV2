import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSuppliersForDropdown, getLowStockItemsForSupplier } from '@/lib/actions/purchasing'
import { SupplierSelect } from '@/components/purchasing/supplier-select'
import { CreatePOForm } from '@/components/purchasing/create-po-form'

export const metadata = {
  title: 'New Purchase Order - OnPar',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

interface SupplierItem {
  id: string
  name: string
}

interface LowStockItem {
  id: string
  name: string
  unit: string
  quantity: number
  reorder_point: number
  unit_price: number
}

export default async function NewPurchaseOrderPage(props: PageProps) {
  const searchParams = await props.searchParams
  const supplierId = searchParams.supplier

  const suppliersResponse = await getSuppliersForDropdown()
  const suppliers: SupplierItem[] = suppliersResponse.success ? (suppliersResponse.data as SupplierItem[]) : []

  let lowStockItems: LowStockItem[] = []
  if (supplierId) {
    const itemsResponse = await getLowStockItemsForSupplier(supplierId)
    if (itemsResponse.success) {
      lowStockItems = itemsResponse.data as LowStockItem[]
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/purchasing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-muted-foreground">
            Generate a new purchase order based on low stock alerts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Supplier</CardTitle>
              <CardDescription>Choose who to order from</CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierSelect suppliers={suppliers} defaultValue={supplierId ?? ''} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>2. Order Items</CardTitle>
              <CardDescription>
                {supplierId 
                  ? 'Review and adjust low stock items for this supplier'
                  : 'Select a supplier first to see their low stock items'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supplierId ? (
                <CreatePOForm supplierId={supplierId} items={lowStockItems} />
              ) : (
                <div className="flex h-[200px] items-center justify-center border border-dashed rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Select a supplier from the sidebar to continue.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
