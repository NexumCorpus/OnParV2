import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLowStockItems, getExpiringItems } from '@/lib/services/inventory'
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react'

export const revalidate = 60 // auto-refresh every 60 seconds

export default async function KitchenDisplayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [lowStockItems, expiringItems] = await Promise.all([
    getLowStockItems(user.id),
    getExpiringItems(user.id),
  ])

  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Critical items: expiring today or tomorrow
  const nowMs = now.getTime()
  const criticalExpiring = expiringItems.filter((item) => {
    if (!item.expiry_date) return false
    const daysLeft = Math.ceil(
      (new Date(item.expiry_date).getTime() - nowMs) / (1000 * 60 * 60 * 24)
    )
    return daysLeft <= 2
  })

  // Zero stock items
  const zeroStock = lowStockItems.filter((item) => item.quantity <= 0)

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors min-h-[48px] text-lg"
        >
          <ArrowLeft className="h-6 w-6" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 text-zinc-400">
          <Clock className="h-6 w-6" />
          <span className="text-xl font-mono">{timeString}</span>
        </div>
      </header>

      {/* Date */}
      <div className="text-center mb-10">
        <p className="text-zinc-500 text-xl">{dateString}</p>
        <h1 className="text-4xl sm:text-5xl font-bold mt-2">Kitchen Display</h1>
        <p className="text-zinc-500 mt-2 text-sm">Auto-refreshes every 60 seconds</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center">
          <p className="text-red-400 text-lg font-medium mb-2">Critical Expiring</p>
          <p className="text-6xl sm:text-7xl font-bold text-red-400">
            {criticalExpiring.length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/30 p-6 text-center">
          <p className="text-amber-400 text-lg font-medium mb-2">Expiring Soon</p>
          <p className="text-6xl sm:text-7xl font-bold text-amber-400">
            {expiringItems.length}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-900/50 bg-orange-950/30 p-6 text-center">
          <p className="text-orange-400 text-lg font-medium mb-2">Low Stock</p>
          <p className="text-6xl sm:text-7xl font-bold text-orange-400">
            {lowStockItems.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-zinc-400 text-lg font-medium mb-2">Out of Stock</p>
          <p className="text-6xl sm:text-7xl font-bold text-zinc-300">
            {zeroStock.length}
          </p>
        </div>
      </div>

      {/* Critical Items List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expiring */}
        {criticalExpiring.length > 0 && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
            <h2 className="flex items-center gap-2 text-red-400 text-xl font-semibold mb-4">
              <AlertCircle className="h-6 w-6" />
              Expiring Today / Tomorrow
            </h2>
            <ul className="space-y-3">
              {criticalExpiring.slice(0, 10).map((item) => {
                const daysLeft = item.expiry_date
                  ? Math.ceil(
                      (new Date(item.expiry_date).getTime() - nowMs) / (1000 * 60 * 60 * 24)
                    )
                  : 0
                return (
                  <li key={item.id} className="flex justify-between items-center text-lg">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-red-400 font-mono">
                      {item.quantity} {item.unit} — {daysLeft <= 0 ? 'TODAY' : `${daysLeft}d`}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Low Stock */}
        {lowStockItems.length > 0 && (
          <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
            <h2 className="flex items-center gap-2 text-amber-400 text-xl font-semibold mb-4">
              <AlertCircle className="h-6 w-6" />
              Low Stock Items
            </h2>
            <ul className="space-y-3">
              {lowStockItems.slice(0, 10).map((item) => (
                <li key={item.id} className="flex justify-between items-center text-lg">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-amber-400 font-mono">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All clear */}
        {criticalExpiring.length === 0 && lowStockItems.length === 0 && (
          <div className="col-span-full rounded-2xl border border-green-900/50 bg-green-950/20 p-12 text-center">
            <p className="text-green-400 text-3xl font-semibold">All Clear</p>
            <p className="text-zinc-500 mt-2 text-lg">No critical alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  )
}
