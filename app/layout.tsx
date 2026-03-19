import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'OnPar - Smart Restaurant Inventory Management',
  description: 'Reduce waste by 10-20% and save $500+ monthly with smart inventory tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:underline"
        >
          Skip to content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
