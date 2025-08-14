import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '../components/providers/theme-provider'
import { ErrorBoundary } from '../components/providers/error-boundary'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'OnPar - Restaurant Inventory Management',
  description: 'Smart inventory management for small restaurants, cafes, and eateries. Reduce waste, save money, and optimize your operations.',
  keywords: ['restaurant', 'inventory', 'management', 'food waste', 'saas'],
  authors: [{ name: 'OnPar Inc.' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="hsl(0 0% 100%)" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            {children}
            <Toaster 
              richColors 
              position="top-right" 
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}