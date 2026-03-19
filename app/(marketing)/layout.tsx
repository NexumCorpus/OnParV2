import { MarketingNavbar } from '@/components/layout/marketing-navbar'
import { Footer } from '@/components/layout/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
