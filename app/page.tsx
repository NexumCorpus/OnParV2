import type { Metadata } from 'next'
import { MarketingNavbar } from '@/components/layout/marketing-navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { SocialProofBar } from '@/components/landing/social-proof-bar'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Testimonials } from '@/components/landing/testimonials'
import { CTASection } from '@/components/landing/cta-section'

export const metadata: Metadata = {
  title: 'OnPar - Smart Restaurant Inventory Management',
  description:
    'Smart inventory, waste tracking, and plate costing for independent restaurants. See your food waste in dollars — and stop it.',
  openGraph: {
    title: 'OnPar - Smart Restaurant Inventory Management',
    description:
      'Smart inventory, waste tracking, and plate costing for independent restaurants.',
    url: 'https://on-par-v2-mauve.vercel.app',
    siteName: 'OnPar',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNavbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <SocialProofBar />
        <FeaturesGrid />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
