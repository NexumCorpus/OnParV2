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
