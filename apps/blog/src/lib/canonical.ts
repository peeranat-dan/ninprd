// Canonical link, og:url, twitter:url, and share links all come from here.
// They must match, because Facebook caches previews by URL.

// Fallback in case `site` is missing from astro.config.mjs.
export const PRODUCTION_SITE_URL = 'https://blog.ninprd.com/'

// Reads `site` from astro.config.mjs. In components, `Astro.site` is the same value.
export function siteUrl(): string {
  return import.meta.env.SITE ?? PRODUCTION_SITE_URL
}

// Adds a trailing slash to match the sitemap, except for files like /rss.xml.
export function canonicalUrl(
  pathname: string,
  base: string | URL = siteUrl(),
): URL {
  return new URL(withTrailingSlash(pathname), base)
}

function withTrailingSlash(pathname: string): string {
  if (pathname.endsWith('/')) return pathname

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  if (lastSegment.includes('.')) return pathname

  return `${pathname}/`
}
