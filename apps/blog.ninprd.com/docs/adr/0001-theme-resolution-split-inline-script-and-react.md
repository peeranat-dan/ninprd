# 1. Theme resolution split between inline script and React

Date: 2026-06-14

## Status

Accepted

## Context

The blog supports three theme choices: `light`, `dark`, `system`. System mode must
live-follow the device OS appearance (update without reload when the OS toggles).

Two constraints pull in opposite directions:

- **No flash of wrong theme (FOUC).** The resolved appearance must be applied to `<html>`
  before first paint. Only a synchronous inline script in `<head>` runs that early;
  React hydrates after paint.
- **Persisting the choice, not the resolved class.** System mode is only possible if
  `localStorage` stores the literal choice (`light`/`dark`/`system`). The previous
  implementation stored the *resolved* class and used a `MutationObserver` to write it
  back, which made `system` impossible to represent and silently overwrote it.

## Decision

- The inline `ThemeProvider` script is the single owner of **resolved appearance**:
  it sets the initial `dark` class before paint, and attaches the `matchMedia` change
  listener that re-resolves on OS change (only while the stored choice is `system`).
- It exposes `window.__applyTheme()` (reads stored choice → resolves → sets class), so
  there is one resolution code path.
- React `ThemeToggle` owns only the **theme choice**: it writes the choice to
  `localStorage` and calls `window.__applyTheme()`. It initializes its state from the
  stored choice. It does not apply the class itself.
- The `MutationObserver` that wrote the resolved class back to `localStorage` is removed.

## Consequences

- The OS-change listener works on every page, independent of whether the toggle has
  hydrated.
- Resolution logic lives in exactly one place; no risk of React/Astro drift.
- React and the inline script are coupled through the `window.__applyTheme` global
  contract; renaming or removing it breaks the toggle. This coupling is intentional and
  documented here.
- Rejected: "React owns everything via useEffect" (flash before hydration, listener dead
  on non-hydrated pages). Rejected: storing the resolved class (cannot represent system).
