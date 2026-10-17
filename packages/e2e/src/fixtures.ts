import { test as base } from '@playwright/test'

export interface FixtureOptions {
  /** localStorage entries set before any page script runs. */
  initialLocalStorage: Record<string, string>
}

interface Fixtures {
  /** Blocks analytics so tests never send events or wait on them. */
  blockAnalytics: undefined
}

const ANALYTICS_PATTERNS = [
  /posthog\.com/,
  /\/_vercel\/(insights|speed-insights)\//,
  /vitals\.vercel-insights\.com/,
]

export const test = base.extend<Fixtures & FixtureOptions>({
  initialLocalStorage: [{}, { option: true }],

  blockAnalytics: [
    async ({ context }, use) => {
      await context.route(
        (url) => ANALYTICS_PATTERNS.some((p) => p.test(url.href)),
        (route) => route.abort(),
      )
      await use(undefined)
    },
    { auto: true },
  ],

  page: async ({ page, initialLocalStorage }, use) => {
    if (Object.keys(initialLocalStorage).length > 0) {
      await page.addInitScript((entries) => {
        for (const [key, value] of Object.entries(entries)) {
          localStorage.setItem(key, value)
        }
      }, initialLocalStorage)
    }
    await use(page)
  },
})

export { expect } from '@playwright/test'
