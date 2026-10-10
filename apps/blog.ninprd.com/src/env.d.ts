// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /** Re-applies the theme. Call after writing `theme` to localStorage. */
  __applyTheme: () => void
  /** May be missing if blocked. Call as `window.posthog?.capture?.(...)`. */
  posthog?: {
    capture?: (event: string, properties?: Record<string, unknown>) => void
  }
}
