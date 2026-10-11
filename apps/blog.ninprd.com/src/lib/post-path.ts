export const POST_BASE_PATH = '/post'

export function postPath(postId: string, section?: string): string {
  const path = `${POST_BASE_PATH}/${postId}/`
  return section ? `${path}#${section}` : path
}
