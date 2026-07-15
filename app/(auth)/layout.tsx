import { APP_NAME } from '@/lib/config'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Feature highlights (hidden on mobile) */}
      <aside className="hidden lg:flex flex-col justify-center gap-8 bg-muted p-12" aria-hidden="true">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{APP_NAME}</h2>
          <p className="text-lg text-muted-foreground">
            Smart Restaurant Inventory Management
          </p>
        </div>
        <ul className="space-y-4 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">1</span>
            <span>Track inventory in real-time with smart alerts</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">2</span>
            <span>See food waste in dollars, by ingredient and reason</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">3</span>
            <span>Know your plate costs and margins from live prices</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">4</span>
            <span>Manage recipes, suppliers, and analytics in one place</span>
          </li>
        </ul>
      </aside>

      {/* Right side - Auth form */}
      <main className="flex items-center justify-center p-6 lg:p-12 bg-brand-50 dark:bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
