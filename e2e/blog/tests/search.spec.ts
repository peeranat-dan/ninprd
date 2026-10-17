import { waitForHydration } from '@ninprd/e2e/astro'
import { expect, test } from '@ninprd/e2e/fixtures'

test('finds a post by its title', async ({ page }) => {
  await page.goto('/')
  const title = (
    await page.locator('main a[href^="/blog/"] h2').first().textContent()
  )?.trim()
  expect(title).toBeTruthy()
  await waitForHydration(page)

  await page.getByRole('button', { name: 'Search' }).click()
  const dialog = page.getByRole('dialog', { name: 'Search Blog Posts' })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('combobox').fill(title ?? '')
  const result = dialog.getByRole('option').first()
  await expect(result).toContainText(title ?? '')

  await result.click()
  await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/)
})

test('opens with the keyboard shortcut and shows empty state', async ({
  page,
}) => {
  await page.goto('/')
  await waitForHydration(page)

  await page.keyboard.press('ControlOrMeta+k')
  const dialog = page.getByRole('dialog', { name: 'Search Blog Posts' })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('combobox').fill('zzzz-no-such-post-zzzz')
  await expect(dialog.getByText(/No results found/)).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
