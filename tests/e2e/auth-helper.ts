import { expect, type Page } from '@playwright/test'

/**
 * Signed-in specs need a real Supabase account that has finished onboarding.
 * Provide it with E2E_EMAIL and E2E_PASSWORD (and real NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). Without them those specs are reported as
 * skipped, never as passed.
 */
const email = process.env.E2E_EMAIL ?? ''
const password = process.env.E2E_PASSWORD ?? ''

export const hasE2ECredentials = email !== '' && password !== ''

export const SKIP_REASON = 'Set E2E_EMAIL and E2E_PASSWORD (a Supabase user that has finished onboarding) to run signed-in specs'

export async function signIn(page: Page) {
  await page.goto('/login')
  // The form is a client component; wait for hydration so the click does not
  // trigger a native form post.
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  // The first request to /dashboard compiles it on a cold dev server, which can take several seconds.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
}
