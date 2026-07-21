import type { APIRoute } from 'astro'
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  getPublishedPosts,
  postUrl,
  singleLine,
} from '../lib/llms'

export const GET: APIRoute = async (context) => {
  const siteUrl = context.site ?? new URL('https://blog.ninprd.com')
  const posts = await getPublishedPosts()

  const sections = posts.map((post) =>
    [
      `# ${singleLine(post.data.title)}`,
      '',
      `- URL: ${postUrl(siteUrl, post.id)}`,
      `- Published: ${new Date(post.data.date).toISOString().slice(0, 10)}`,
      `- Tags: ${post.data.tags.join(', ')}`,
      `- Summary: ${singleLine(post.data.excerpt)}`,
      '',
      (post.body ?? '').trim(),
    ].join('\n'),
  )

  const content = [
    `# ${SITE_TITLE} — Full Content`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'This file contains the full text of every published post on the blog, newest first. Relative links and image paths inside a post are relative to its canonical URL.',
    '',
    '---',
    '',
    sections.join('\n\n---\n\n'),
    '',
  ].join('\n')

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
