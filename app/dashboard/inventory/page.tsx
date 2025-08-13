'use client'

import { DashboardLayout } from '@/components/layout/main-layout'
import { BetaInventoryManager } from '@/components/inventory/beta-inventory-manager'

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Smart inventory tracking with AI-powered insights
            </p>
          </div>
        </div>
        <BetaInventoryManager />
      </div>
    </DashboardLayout>
  )
}