import { createConfig } from '@ninprd/e2e/config'

export default createConfig({
  app: 'blog',
  port: 4501,
  // Dismiss the cookie banner so it never covers what a test clicks.
  use: { initialLocalStorage: { 'cookie-consent': 'rejected' } },
})
