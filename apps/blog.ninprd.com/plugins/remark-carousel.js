import { visit } from 'unist-util-visit'

const OPEN_RE = /^:::carousel\s*$/
const CLOSE_RE = /^:::\s*$/

/**
 * Remark plugin. Turns a fenced block like:
 *
 *   :::carousel
 *   ![Alt one](a.webp)
 *   ![Alt two](b.webp)
 *   :::
 *
 * into <div class="carousel" role="region"> > div.carousel-track >
 * div.carousel-slide > img. The tree is restructured purely in mdast via
 * `data.hName` / `data.hProperties` (no hast, no raw HTML), so the images
 * stay plain `image` nodes and Astro's image optimization keeps working.
 *
 * Content must be images only (one per line, blank lines optional). Anything
 * else inside the fence throws a build error naming the offending file, so
 * mistakes fail loud instead of being silently dropped.
 *
 * Arrows, dots, and a click-to-open lightbox are injected by a client
 * script (src/scripts/carousel.ts), not emitted statically — without JS the
 * carousel degrades to a swipeable scroll-snap strip with no dead buttons.
 */
export default function remarkCarousel() {
  return (tree, file) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const first = node.children?.[0]
      if (first?.type !== 'text') return

      const firstLine = first.value.split('\n')[0]
      if (!OPEN_RE.test(firstLine)) return

      // Children of the opening paragraph with the marker line stripped.
      const afterOpen = [
        {
          ...first,
          value: first.value.slice(firstLine.length).replace(/^\n/, ''),
        },
        ...node.children.slice(1),
      ]

      // Case A: `:::carousel`, the images and `:::` all in one paragraph
      // (no blank lines). The closing marker is the last line of the last
      // text node.
      const lastIdx = afterOpen.length - 1
      const last = afterOpen[lastIdx]
      if (last?.type === 'text') {
        const lines = last.value.split('\n')
        if (CLOSE_RE.test(lines.at(-1).trim())) {
          afterOpen[lastIdx] = {
            ...last,
            value: lines.slice(0, -1).join('\n'),
          }
          const images = collectImages(afterOpen, file)
          // 0 images → leave the block untouched (no silent empty carousel).
          if (images.length === 0) return
          parent.children.splice(index, 1, buildCarousel(images))
          return
        }
      }

      // Case B: block form. The opener is its own paragraph; consume
      // following siblings until a closing `:::` paragraph.
      const images = collectImages(afterOpen, file)
      let closeIndex = -1
      for (let i = index + 1; i < parent.children.length; i++) {
        const sibling = parent.children[i]

        // Standalone `:::` paragraph.
        if (
          sibling.type === 'paragraph' &&
          sibling.children?.length === 1 &&
          sibling.children[0].type === 'text' &&
          CLOSE_RE.test(sibling.children[0].value.trim())
        ) {
          closeIndex = i
          break
        }

        // Closing marker as the last line of a paragraph (no blank line
        // before `:::`) — strip it and keep the images above it.
        const stripped = stripTrailingClose(sibling)
        if (stripped.found) {
          images.push(...collectImages(meaningfulChildren(stripped.node), file))
          closeIndex = i
          break
        }

        // Regular body paragraph: images (with whitespace between) only.
        if (sibling.type === 'paragraph') {
          images.push(...collectImages(sibling.children, file))
          continue
        }

        throw carouselError(
          file,
          sibling.position?.start?.line,
          `carousels may only contain images, found a ${sibling.type} block`,
        )
      }

      // Unterminated fence: leave everything untouched, like remark-callouts.
      if (closeIndex === -1) return
      if (images.length === 0) return
      parent.children.splice(
        index,
        closeIndex - index + 1,
        buildCarousel(images),
      )
    })
  }
}

/** Children with whitespace-only text nodes removed. */
function meaningfulChildren(node) {
  if (!node) return []
  return node.children.filter(
    (child) => child.type !== 'text' || child.value.trim() !== '',
  )
}

/** Line where a node's first non-whitespace content starts. */
function contentLine(child) {
  let line = child.position?.start?.line
  if (child.type === 'text' && line !== undefined) {
    // A text node between images starts right after the previous image,
    // on its line; skip the leading newlines to point at the real content.
    line += child.value.match(/^\n*/)[0].length
  }
  return line
}

/**
 * Extract image nodes from paragraph children. Whitespace between images is
 * fine; anything else (text, links, inline code, …) throws.
 */
function collectImages(children, file) {
  const images = []
  for (const child of children) {
    if (child.type === 'image') {
      images.push(child)
      continue
    }
    if (child.type === 'text' && child.value.trim() === '') continue

    const found =
      child.type === 'text'
        ? `text "${child.value.trim().slice(0, 40)}"`
        : `a ${child.type} node`
    throw carouselError(
      file,
      contentLine(child),
      `carousels may only contain images (one per line), found ${found}`,
    )
  }
  return images
}

/** Remove a trailing `:::` line from a paragraph's last text node. */
function stripTrailingClose(node) {
  if (node.type !== 'paragraph') return { found: false }
  const children = node.children || []
  const last = children.at(-1)
  if (last?.type !== 'text') return { found: false }

  const lines = last.value.split('\n')
  if (!CLOSE_RE.test(lines.at(-1).trim())) return { found: false }

  const value = lines.slice(0, -1).join('\n')
  const trimmedChildren = [
    ...children.slice(0, -1),
    ...(value.trim() !== '' ? [{ ...last, value }] : []),
  ]
  return {
    found: true,
    node: { ...node, children: trimmedChildren },
  }
}

/**
 * Build the carousel mdast.
 *
 * The wrappers use flow-content mdast types (`blockquote` mapped to `div`
 * via data.hName), mirroring remark-callouts: `blockquote` legally holds
 * block children, so mdast-to-hast output stays HTML-valid. Slides are
 * `paragraph` nodes mapped to `div` so each `img` renders normally and
 * keeps flowing through Astro's image pipeline.
 */
function buildCarousel(images) {
  const label =
    images.find((image) => image.alt?.trim())?.alt ?? 'Image carousel'

  return {
    type: 'blockquote',
    data: {
      hName: 'div',
      hProperties: {
        className: ['carousel'],
        role: 'region',
        ariaRoledescription: 'carousel',
        ariaLabel: label,
      },
    },
    children: [
      {
        type: 'blockquote',
        data: {
          hName: 'div',
          hProperties: { className: ['carousel-track'], tabIndex: 0 },
        },
        children: images.map((image) => ({
          type: 'paragraph',
          data: {
            hName: 'div',
            hProperties: { className: ['carousel-slide'] },
          },
          children: [image],
        })),
      },
    ],
  }
}

function carouselError(file, line, message) {
  const where = `${file.path ?? '<markdown>'}:${line ?? '?'}`
  return new Error(`[remark-carousel] ${where}: ${message}`)
}
