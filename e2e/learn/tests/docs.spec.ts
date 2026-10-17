import { expect, test } from '@ninprd/e2e/fixtures'

test('splash page links into the directory', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/learn\.ninprd\.com/)
  await page.getByRole('link', { name: 'เข้าสู่เนื้อหาหลัก' }).click()
  await expect(page).toHaveURL(/\/directory\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('navigates the WordPress series', async ({ page }) => {
  await page.goto('/wordpress-series/wordpress-basic/wordpress-basic-1/')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Starlight's prev/next pagination links lessons together.
  await page.getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/wordpress-basic-2\/$/)
})

test('unknown pages render the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
})
