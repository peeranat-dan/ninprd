import {
  type PlaywrightTestConfig,
  defineConfig,
  devices,
} from '@playwright/test'

import type { FixtureOptions } from './fixtures'

interface CreateConfigOptions {
  /** Workspace package name of the app under test, e.g. `blog`. */
  app: string
  /** Local port for `astro preview`. Must be unique per app. */
  port: number
  /** Extra `use` options merged over the shared defaults. */
  use?: PlaywrightTestConfig<FixtureOptions>['use']
}

const isCI = !!process.env.CI

/**
 * Shared Playwright config for every app under `e2e/`.
 *
 * Runs against the app's production build via `astro preview`. Set
 * `BASE_URL` to test a deployed site instead (e.g. a Vercel preview);
 * no local server is started in that case. Run it via
 * `pnpm test:e2e:remote`, which skips the app build and turbo cache.
 */
export function createConfig({ app, port, use }: CreateConfigOptions) {
  const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`

  return defineConfig<FixtureOptions>({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      ...use,
    },
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],
    webServer: process.env.BASE_URL
      ? undefined
      : {
          command: `pnpm --filter ${app} preview --port ${port}`,
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 60_000,
        },
  })
}
