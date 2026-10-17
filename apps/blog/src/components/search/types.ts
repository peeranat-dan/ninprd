export interface SearchablePost {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  date: string
}

export interface SearchResult {
  item: SearchablePost
  score?: number
  matches?: ReadonlyArray<{
    indices: ReadonlyArray<readonly [number, number]>
    value?: string
    key?: string
  }>
}
