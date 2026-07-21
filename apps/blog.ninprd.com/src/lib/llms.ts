import { getCollection } from 'astro:content'

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
