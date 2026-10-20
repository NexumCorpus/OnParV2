import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// stripe.ts reads STRIPE_SECRET_KEY once at import time, so each test resets
// the module registry and imports the real Stripe service and action fresh.
const mockGetUser = vi.fn()
const mockWarn = vi.fn()
const mockError = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({})),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: { error: mockError, warn: mockWarn, info: vi.fn(), debug: vi.fn() },
}))

async function loadCheckout() {
  vi.resetModules()
  const settings = await import('@/lib/actions/settings')
  const messages = await import('@/lib/utils/error-messages')
  return { createCheckout: settings.createCheckout, getUserFriendlyError: messages.getUserFriendlyError }
}

describe('createCheckout without billing configured', () => {
  beforeEach(() => {
    vi.stubEnv('STRIPE_SECRET_KEY', '')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@example.com' } }, error: null })
    mockWarn.mockClear()
    mockError.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the billing code and the user sees "Billing is not configured"', async () => {
    const { createCheckout, getUserFriendlyError } = await loadCheckout()

    const result = await createCheckout('price_123')

    expect(result).toEqual({ error: 'billing_not_configured' })
    expect(getUserFriendlyError('error' in result ? result.error : undefined)).toBe('Billing is not configured')
  })

  it('logs the missing configuration as a warning, not an error', async () => {
    const { createCheckout } = await loadCheckout()

    await createCheckout('price_123')

    expect(mockWarn).toHaveBeenCalledTimes(1)
    expect(mockError).not.toHaveBeenCalled()
  })

  it('keeps the generic failure for other errors (for example no session)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { createCheckout } = await loadCheckout()

    const result = await createCheckout('price_123')

    expect(result).toEqual({ error: 'Failed to create checkout session' })
    expect(mockError).toHaveBeenCalledTimes(1)
  })
})
