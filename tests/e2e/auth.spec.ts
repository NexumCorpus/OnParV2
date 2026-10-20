import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login|\/auth/)
  })

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('shows signup form with restaurant name field', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel(/restaurant/i)).toBeVisible()
  })

  test('displays validation errors for invalid input', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in|log in/i }).click()
    await expect(page.getByText(/required|invalid|enter/i).first()).toBeVisible()
  })
})

// Signed-out access control: every app route must send a visitor without a
// session to the login page. These specs need no Supabase account.
const PROTECTED_ROUTES = [
  '/dashboard',
  '/inventory',
  '/purchasing',
  '/recipes',
  '/suppliers',
  '/waste',
  '/analytics',
  '/insights',
  '/settings',
]

test.describe('Signed-out access', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    })
  }

  test('forgot-password page is reachable without a session', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page).toHaveURL(/\/forgot-password$/)
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('login page links to forgot-password', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(/\/forgot-password$/)
  })
})
