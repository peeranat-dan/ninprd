# 2. Markdown carousel as a remark plugin

Date: 2026-08-11

## Status

Accepted

## Context

Authors write posts as plain `.md` in Obsidian (see the content collection in
`src/blog/`). Posts sometimes want an image carousel — multiple photos sharing
one viewport with arrows/dots instead of a long stack of full-width images.

Constraints:

- **Obsidian authoring workflow must keep working.** Raw `.md` with frontmatter;
  MDX is not an option (Obsidian doesn't render MDX components, and migrating
  every post breaks the editing flow).
- **Astro image optimization must keep working.** Relative image paths in
  markdown are resolved, converted to webp, hashed into `/_astro/`. A React
  island can't receive mdast `image` nodes through props, so MDX/React would
  lose optimization or require manual image handling.
- **Hand-rolled HTML divs are the status quo** (`<div class="flex gap-2">` in
  `alone-in-taipei-2024.md`) — implicit, unstyled-by-the-article, and
  uncontrolled content.

## Decision

- Carousels are authored with a fenced block, the same pattern as
  `remark-callouts`:

  ```md
  :::carousel
  ![Alt one](a.webp)
  ![Alt two](b.webp)
  :::
  ```

- `plugins/remark-carousel.js` restructures the tree **purely in mdast**
  (`data.hName` / `data.hProperties`, no hast, no raw HTML injection) into
  `div.carousel[role=region] > div.carousel-track[tabindex=0] >
  div.carousel-slide > img`. Images remain `image` nodes, so Astro's image
  pipeline is untouched.
- It is registered **before** `remarkCallouts` so the block is consumed first
  (callouts would ignore the unknown `carousel` type, but the block would then
  render as literal text).
- Content is **images only** (one per line). Non-image content throws a build
  error naming the file and line — fail loud, not silent drop.
- **Progressive enhancement split:** the static output is a zero-JS
  scroll-snap strip. Arrows + dots are injected by the small vanilla
  `src/scripts/carousel.ts` entry referenced by `[slug].astro` (no React, no
  hydration — consistent with ADR 0001's "plain script when React isn't
  needed"). Without JS there are no dead buttons. `prefers-reduced-motion`
  swaps smooth scrolling for `auto`.
- **Slides per viewport:** one on mobile, three from `sm` (640px) up. The
  count lives only in CSS (`flex-basis` + `gap`); the client script derives
  pages from the rendered layout (`perPage = round(track / slide width)`),
  so breakpoints are never duplicated in JS. One dot / arrow step = one page.

## Consequences

- Authoring stays in plain Markdown; Obsidian shows the block as text (same
  tradeoff callouts already make).
- A custom `:::carousel` syntax exists and must be documented (this ADR +
  the plugin docblock).
- Non-image content (captions, text) is rejected at build time; captions from
  alt text are future work if wanted.
- The client script is coupled to the emitted class names
  (`.carousel`, `.carousel-track`, `.carousel-slide`); renaming them breaks
  controls. This coupling is intentional and documented here.
- Rejected: MDX migration (breaks Obsidian workflow), React island (can't
  hydrate from `.md`, images can't flow through props), auto-wrapping
  consecutive images (implicit magic, fights existing hand-rolled divs).
