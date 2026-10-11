/// <reference types="astro/client" />

// Globals set by inline scripts in ThemeProvider.astro and Posthog.astro.

interface Window {
  /** Re-applies the theme. Call after writing `theme` to localStorage. */
  __applyTheme: () => void
  /** May be missing if blocked. Call as `window.posthog?.capture?.(...)`. */
  posthog?: {
    capture?: (event: string, properties?: Record<string, unknown>) => void
  }
}
