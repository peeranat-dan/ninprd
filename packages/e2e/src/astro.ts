import { type Page, expect } from '@playwright/test'

/**
 * Waits until eager Astro islands (`client:load`, `client:idle`,
 * `client:only`) have hydrated. Astro drops the `ssr` attribute from
 * `<astro-island>` once hydrated; until then the server-rendered markup
 * is visible but ignores clicks and key presses.
 *
 * `client:visible` and `client:media` islands are skipped since they may
 * never hydrate on their own.
 */
export async function waitForHydration(page: Page) {
  await expect(
    page.locator(
      'astro-island[ssr]:is([client="load"], [client="idle"], [client="only"])',
    ),
  ).toHaveCount(0)
}
