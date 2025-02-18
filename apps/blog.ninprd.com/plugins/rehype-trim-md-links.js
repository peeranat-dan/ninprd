import { visit } from 'unist-util-visit'

export default function rehypeTrimMdLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Check if node is an anchor tag
      if (node.tagName === 'a' && node?.properties?.href) {
        const href = node.properties.href

        // Check if the URL ends with .md
        if (typeof href === 'string' && href.endsWith('.md')) {
          // Remove the .md extension
          node.properties.href = href.slice(0, -3)
        }
      }
    })
  }
}
