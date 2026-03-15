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
    'Reduce food waste by 10-20% and save $500+ monthly. Smart inventory tracking, AI insights, and waste analytics for restaurants.',
  openGraph: {
    title: 'OnPar - Smart Restaurant Inventory Management',
    description: 'Reduce food waste by 10-20% and save $500+ monthly.',
    url: 'https://onpar.app',
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
