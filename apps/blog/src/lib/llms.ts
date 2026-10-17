import { getCollection } from 'astro:content'

export const SITE_TITLE = 'blog.ninprd'
export const SITE_DESCRIPTION =
  'Read about experience sharing and technology on blog.ninprd, a dynamic blog by Peeranat Danaidusadeekul, a full-time Software Engineer and part-time blogger.'

export async function getPublishedPosts() {
  const posts = await getCollection(
    'blog',
    ({ data }) => data.status === 'published',
  )
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  )
}

export function postUrl(siteUrl: URL, postId: string): string {
  return new URL(`/blog/${postId}/`, siteUrl).href
}

export function singleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
