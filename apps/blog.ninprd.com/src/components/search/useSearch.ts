import Fuse, { type IFuseOptions } from 'fuse.js'
import { useEffect, useState } from 'react'
import type { SearchResult, SearchablePost } from './types'

const FUSE_OPTIONS: IFuseOptions<SearchablePost> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'excerpt', weight: 0.3 },
    { name: 'content', weight: 0.15 },
    { name: 'tags', weight: 0.05 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
}

export function useSearch() {
  const [posts, setPosts] = useState<SearchablePost[]>([])
  const [fuse, setFuse] = useState<Fuse<SearchablePost> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/search.json')
        console.log('Fetch response:', response)
        if (!response.ok) {
          throw new Error('Failed to fetch search data')
        }
        const data = await response.json()
        setPosts(data)
        setFuse(new Fuse(data, FUSE_OPTIONS))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const search = (query: string): SearchResult[] => {
    console.log('Search query:', query)
    if (!fuse || !query.trim()) {
      return []
    }
    return fuse.search(query) as SearchResult[]
  }

  return { search, isLoading, error, posts }
}
