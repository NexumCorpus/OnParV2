import { test, expect } from '@playwright/test'
import { hasE2ECredentials, signIn, SKIP_REASON } from './auth-helper'

// The inventory route is /inventory (the (dashboard) route group adds no URL
// segment). These specs run signed in; without E2E_EMAIL / E2E_PASSWORD they
// are reported as skipped.
test.describe('Inventory Management (signed in)', () => {
  test.skip(!hasE2ECredentials, SKIP_REASON)

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/inventory')
  })

  test('shows the inventory page', async ({ page }) => {
    await expect(page).toHaveURL(/\/inventory$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Inventory Management' })).toBeVisible()
  })

  test('add item dialog opens and closes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The header "Add Item" button is desktop-only')

    await page.getByRole('button', { name: 'Add Item' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Add Item' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  // The tests below need seeded inventory data and a stable fixture account, so
  // they are marked fixme and show up as skipped instead of passing without
  // asserting anything.
  test.fixme('displays inventory table', async () => {
    // Needs at least one inventory item for the signed-in organization.
  })

  test.fixme('search filters items by name', async () => {
    // Needs a known item (for example "Tomato") and an assertion on the rows shown.
  })

  test.fixme('mobile stepper adjusts quantity and shows server-confirmed value', async () => {
    // Needs a known item and an assertion on the quantity after the server responds.
  })

  test.fixme('waste event atomically decrements inventory quantity', async () => {
    // Needs a known item; assert the quantity before and after recording waste.
  })

  test.fixme('soft-deleted items do not appear in inventory list', async () => {
    // Needs a soft-deleted fixture item; assert it is absent from the list.
  })
})
