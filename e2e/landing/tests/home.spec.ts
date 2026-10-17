import { expect, test } from '@ninprd/e2e/fixtures'

test('home shows hero, experience and projects', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Peeranat Danaidusadeekul' }),
  ).toBeVisible()

  const projects = page.locator('section#projects')
  await expect(
    projects.getByRole('heading', { name: 'Projects' }),
  ).toBeVisible()
  await expect(projects.getByRole('listitem').first()).toBeVisible()
})

test('facilitator page renders', async ({ page }) => {
  await page.goto('/faci')

  await expect(page).toHaveTitle(/Facilitator/)
  await expect(
    page.getByRole('heading', { name: 'Need a facilitator?' }),
  ).toBeVisible()
})

test('unknown pages render the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: 'This page took a wrong turn' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'View projects' }).click()
  await expect(page).toHaveURL(/\/#projects$/)
})
