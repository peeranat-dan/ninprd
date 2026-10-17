import { expect, test } from '@ninprd/e2e/fixtures'

test('unknown pages render the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Go back home' }).click()
  await expect(page).toHaveURL(/\/$/)
})

for (const path of [
  '/rss.xml',
  '/sitemap-index.xml',
  '/robots.txt',
  '/llms.txt',
  '/api/search.json',
]) {
  test(`serves ${path}`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.ok()).toBe(true)
    expect((await response.body()).length).toBeGreaterThan(0)
  })
}
