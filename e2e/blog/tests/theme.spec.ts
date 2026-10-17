import { waitForHydration } from '@ninprd/e2e/astro'
import { expect, test } from '@ninprd/e2e/fixtures'

test('switches theme and remembers it across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await waitForHydration(page)
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/\bdark\b/)

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.getByRole('menuitem', { name: 'Dark' }).click()
  await expect(html).toHaveClass(/\bdark\b/)

  await page.reload()
  await waitForHydration(page)
  await expect(html).toHaveClass(/\bdark\b/)

  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.getByRole('menuitem', { name: 'Light' }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
})
