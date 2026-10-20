import { describe, it, expect } from 'vitest'
import { BILLING_NOT_CONFIGURED, getUserFriendlyError } from '@/lib/utils/error-messages'

describe('getUserFriendlyError', () => {
  it('maps the billing code to the documented message', () => {
    expect(getUserFriendlyError(BILLING_NOT_CONFIGURED)).toBe('Billing is not configured')
  })

  it('keeps existing mappings', () => {
    expect(getUserFriendlyError('unauthorized')).toBe('Your session has expired. Please sign in again.')
  })

  it('falls back to the generic message for unknown errors', () => {
    expect(getUserFriendlyError('Failed to create checkout session')).toBe(
      'Something went wrong. Please try again.'
    )
  })

  it('handles a missing error', () => {
    expect(getUserFriendlyError(undefined)).toBe('An unexpected error occurred. Please try again.')
  })
})
