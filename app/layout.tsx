import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ErrorBoundary } from '@/components/providers/error-boundary'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'OnPar - Restaurant Inventory Management',
  description: 'Smart inventory management for small restaurants, cafes, and eateries. Reduce waste, save money, and optimize your operations.',
  keywords: ['restaurant', 'inventory', 'management', 'food waste', 'saas'],
  authors: [{ name: 'OnPar Inc.' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}