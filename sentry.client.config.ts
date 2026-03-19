import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,             // 10% of transactions in production
  replaysSessionSampleRate: 0,        // No session replays
  replaysOnErrorSampleRate: 1.0,      // Capture replay on every error
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,  // Disabled if no DSN
})
