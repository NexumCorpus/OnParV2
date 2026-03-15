import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OnPar - Smart Restaurant Inventory Management',
  description: 'Reduce waste by 10-20% and save $500+ monthly with smart inventory tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  )
}
