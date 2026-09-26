// Facebook and X share links for a post. Pass a URL from `canonicalUrl`.
// No UTM params: they would break the canonical match, and PostHog already tracks the click.

const FACEBOOK_SHARER = 'https://www.facebook.com/sharer/sharer.php'
const X_TWEET_INTENT = 'https://x.com/intent/tweet'

export interface ShareTargets {
  facebook: string
  x: string
}

export function shareTargets(
  canonicalUrl: string | URL,
  title: string,
): ShareTargets {
  const url = canonicalUrl.toString()

  // Facebook reads the title and image from Open Graph tags, so it only needs the URL.
  const facebook = new URLSearchParams({ u: url })

  // No hashtags: the tag slugs look like noise after a Thai title.
  const x = new URLSearchParams({ text: title, url })

  return {
    facebook: `${FACEBOOK_SHARER}?${facebook}`,
    x: `${X_TWEET_INTENT}?${x}`,
  }
}
