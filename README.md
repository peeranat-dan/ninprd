# ninprd

Monorepo for the sites under [ninprd.com](https://ninprd.com) - a personal landing page, a blog, and a learning site. Built with [Astro](https://astro.build), React, and Tailwind CSS, managed with pnpm workspaces and Turborepo.

## What's inside

### Apps

| App | Path | Site | Description |
| --- | --- | --- | --- |
| `landing` | [`apps/landing`](apps/landing) | [ninprd.com](https://ninprd.com) | Portfolio landing page with projects and facilitator experience |
| `blog` | [`apps/blog.ninprd.com`](apps/blog.ninprd.com) | [blog.ninprd.com](https://blog.ninprd.com) | Blog with MDX, KaTeX math, code highlighting, search, RSS, and sitemap |
| `learn` | [`apps/learn`](apps/learn) | [learn.ninprd.com](https://learn.ninprd.com) | Tutorial series built on [Starlight](https://starlight.astro.build) |

### Packages

| Package | Path | Description |
| --- | --- | --- |
| `@ninprd/ui` | [`packages/ui`](packages/ui) | Shared React components (shadcn/ui style, on Radix), hooks, utilities, and global styles |
| `@ninprd/typescript-config` | [`packages/typescript-config`](packages/typescript-config) | Shared `tsconfig` presets |

## Getting started

### Prerequisites

- Node.js 22
- pnpm 9 (`corepack enable` picks up the version pinned in `package.json`)

### Install

```sh
pnpm install
```

This also installs the [lefthook](https://lefthook.dev) pre-commit hook.

### Develop

Run every app at once:

```sh
pnpm dev
```

Or run a single app:

```sh
pnpm --filter landing dev
pnpm --filter blog dev
pnpm --filter learn dev   # http://localhost:3001
```

### Build

```sh
pnpm build                  # all apps
pnpm --filter blog build    # one app
```

Each app builds to its own `dist/` directory. Use `pnpm --filter <app> preview` to serve a build locally.

## Scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm format-and-lint` | Check formatting and lint rules with Biome |
| `pnpm format-and-lint:fix` | Same, and write fixes |

## Code quality

[Biome](https://biomejs.dev) handles formatting and linting for the whole repo (config in [`biome.json`](biome.json)). The pre-commit hook runs `biome check --write` on staged files and re-stages the fixes.

## Dependencies

Shared dependency versions live in the `catalog` section of [`pnpm-workspace.yaml`](pnpm-workspace.yaml). Apps and packages reference them with `catalog:`, so a version bump happens in one place.

## Environment variables

The blog loads its environment through [dotenvx](https://dotenvx.com). `apps/blog.ninprd.com/.env` is committed in encrypted form; the private key in `.env.keys` is gitignored and is needed to decrypt it.

## Project screenshots

The project cards on the landing page use screenshots captured by a Playwright script:

```sh
pnpm --filter landing exec playwright install chromium
pnpm --filter landing screenshot
```

The [`Screenshot projects`](.github/workflows/screenshot-projects.yml) workflow runs this on pushes to `main` that touch `apps/landing` and opens a pull request with the refreshed images.

## Writing content

- Blog posts: Markdown or MDX files in `apps/blog.ninprd.com/src/blog`
- Landing page projects: Markdown files in `apps/landing/src/projects`
- Learn pages: Markdown or MDX files in `apps/learn/src/content/docs`
