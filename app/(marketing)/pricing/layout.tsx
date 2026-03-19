import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - OnPar',
  description:
    'Simple, transparent pricing for restaurant inventory management. Free tier available. All paid plans include a 14-day free trial.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
