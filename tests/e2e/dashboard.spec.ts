import { test, expect } from '@playwright/test'
import { hasE2ECredentials, signIn, SKIP_REASON } from './auth-helper'

// Every spec here runs signed in. Without E2E_EMAIL / E2E_PASSWORD they are
// reported as skipped (see auth-helper.ts), not passed.
test.describe('Dashboard (signed in)', () => {
  test.skip(!hasE2ECredentials, SKIP_REASON)

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('shows the dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard', exact: true })).toBeVisible()
  })

  test('primary navigation lists the app sections and navigates', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The sidebar is desktop-only; the mobile menu has its own test')

    const nav = page.getByRole('navigation', { name: 'Primary navigation' })
    for (const label of ['Dashboard', 'Inventory', 'Purchasing', 'Recipes', 'Waste', 'Insights', 'Analytics', 'Suppliers']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible()
    }

    await nav.getByRole('link', { name: 'Inventory' }).click()
    await expect(page).toHaveURL(/\/inventory$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Inventory Management' })).toBeVisible()
  })

  test('sidebar marks the current route', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The sidebar is desktop-only')

    const nav = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Inventory' })).not.toHaveAttribute('aria-current', 'page')
  })

  test('mobile menu opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu button only exists below the desktop breakpoint')

    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(menu).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })
})
