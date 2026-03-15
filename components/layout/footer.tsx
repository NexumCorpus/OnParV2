import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Demo', href: '/signup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/contact' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/contact' },
      { label: 'Terms', href: '/contact' },
      { label: 'Cookies', href: '/contact' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" aria-label="Site footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <UtensilsCrossed className="size-5 text-brand-600" aria-hidden="true" />
              <span>OnPar</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Smart inventory management for restaurants. Reduce waste, save money, grow your business.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2" role="list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} OnPar. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
