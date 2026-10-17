import { expect, test } from '@ninprd/e2e/fixtures'

test('home lists published posts', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/.+/)
  await expect(
    page.getByRole('heading', { level: 1, name: /Building blocks/ }),
  ).toBeVisible()
  await expect(page.getByText('Latest post')).toBeVisible()

  // The hero's post count matches the number of cards rendered.
  const postCount = Number(
    await page.locator('dt:has-text("Published posts") + dd').textContent(),
  )
  expect(postCount).toBeGreaterThan(0)
  await expect(page.locator('main a[href^="/blog/"]')).toHaveCount(postCount)
})

test('opens a post from the home page', async ({ page }) => {
  await page.goto('/')

  const featured = page.locator('main a[href^="/blog/"]').first()
  const title = (await featured.getByRole('heading').textContent())?.trim()
  await featured.click()

  await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    title ?? '',
  )
  await page.getByRole('link', { name: 'หน้าหลัก' }).click()
  await expect(page).toHaveURL(/\/$/)
})
