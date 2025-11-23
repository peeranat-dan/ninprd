import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const posts = await getCollection(
    'blog',
    ({ data }) => data.status === 'published',
  )

  const searchData = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    excerpt: post.data.excerpt,
    content: post.body,
    tags: post.data.tags,
    date: post.data.date,
  }))

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
