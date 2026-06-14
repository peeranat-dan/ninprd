// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /** Resolves the stored theme choice and applies the `dark` class. Defined in ThemeProvider.astro. */
  __applyTheme: () => void
}
