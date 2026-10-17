import { waitForHydration } from '@ninprd/e2e/astro'
import { expect, test } from '@ninprd/e2e/fixtures'

// Start with no stored choice so the banner shows.
test.use({ initialLocalStorage: {} })

test('remembers the cookie choice', async ({ page }) => {
  await page.goto('/')
  const banner = page.getByRole('dialog', { name: 'Cookie consent' })
  await expect(banner).toBeVisible()

  await banner.getByRole('button', { name: 'Reject' }).click()
  await expect(banner).toBeHidden()

  await page.reload()
  await waitForHydration(page)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(banner).toBeHidden()
})
