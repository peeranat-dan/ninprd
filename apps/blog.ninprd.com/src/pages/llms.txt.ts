import type { APIRoute } from 'astro'
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  getPublishedPosts,
  postUrl,
  singleLine,
} from '../lib/llms'

function isoDate(date: string): string {
  return new Date(date).toISOString().slice(0, 10)
}

export const GET: APIRoute = async (context) => {
  const siteUrl = context.site ?? new URL('https://blog.ninprd.com')
  const posts = await getPublishedPosts()

  const postLines = posts.map(
    (post) =>
      `- [${singleLine(post.data.title)}](${postUrl(siteUrl, post.id)}): ${singleLine(post.data.excerpt)} (${isoDate(post.data.date)})`,
  )

  const content = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `Posts are written in Thai and English. Each post below links to its canonical URL and includes a short summary and its publication date. The full text of every post is available in [llms-full.txt](${new URL('/llms-full.txt', siteUrl).href}).`,
    '',
    '## Blog Posts',
    '',
    ...postLines,
    '',
    '## Optional',
    '',
    `- [RSS Feed](${new URL('/rss.xml', siteUrl).href}): Subscribe to the latest posts`,
    `- [Sitemap](${new URL('/sitemap-index.xml', siteUrl).href}): Full sitemap of the site`,
    '',
  ].join('\n')

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
