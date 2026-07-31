import { visit } from 'unist-util-visit'

/** Canonical callout types and their default titles. */
const TYPES = {
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  warning: 'Warning',
  caution: 'Caution',
  danger: 'Danger',
  disclaimer: 'Disclaimer',
}

/** Aliases that map to a canonical type. */
const ALIASES = {
  important: 'info',
  success: 'tip',
  error: 'danger',
}

// Opening marker, e.g. `:::warning` or `:::note title="Heads up"`.
const OPEN_RE = /^:::([a-z]+)(?:\s+title="([^"]*)")?\s*$/
// Prefix for a Markdown title, e.g. `:::note[Heads **up**]`.
const TITLED_OPEN_RE = /^:::([a-z]+)\[/
// Closing marker `:::`.
const CLOSE_RE = /^:::\s*$/

/**
 * Remark plugin. Turns a fenced block like:
 *
 *   :::warning
 *   Body with **bold** and `inline code`.
 *   :::
 *
 * into <aside class="callout callout-warning">. The body stays as mdast
 * children, so all markdown inside it (inline code, bold, links, lists,
 * code fences) is parsed normally.
 */
export default function remarkCallouts() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const first = node.children?.[0]
      if (first?.type !== 'text') return

      // The opening marker is the first line of the first text node. A
      // bracketed title can span several phrasing nodes because Remark has
      // already parsed its Markdown (strong, emphasis, inlineCode, etc.).
      const firstLine = first.value.split('\n')[0]
      const titledOpen = extractTitledOpening(node.children)
      const openMatch = titledOpen ? null : firstLine.match(OPEN_RE)
      if (!titledOpen && !openMatch) return

      const requestedType = titledOpen?.type ?? openMatch[1]
      const type = ALIASES[requestedType] || requestedType
      if (!TYPES[type]) return
      const titleChildren = titledOpen?.titleChildren ?? [
        { type: 'text', value: openMatch[2] ?? TYPES[type] },
      ]

      // Strip the marker line off the first text node; keep any body that
      // trails it on later lines of the same node.
      const openBodyChildren = titledOpen
        ? titledOpen.bodyChildren
        : [
            {
              ...first,
              value: first.value.slice(firstLine.length).replace(/^\n/, ''),
            },
            ...node.children.slice(1),
          ]

      // Case A: the closing `:::` lives in the LAST text node of this same
      // paragraph (single-paragraph callout, possibly with inline formatting).
      // We strip it from openBodyChildren, which already had the marker
      // removed above (so single-node callouts are handled correctly too).
      const lastIdx = openBodyChildren.length - 1
      const lastBody = openBodyChildren[lastIdx]
      if (lastBody?.type === 'text') {
        const lastLines = lastBody.value.split('\n')
        const closeLine = lastLines.length - 1
        if (CLOSE_RE.test(lastLines[closeLine].trim())) {
          openBodyChildren[lastIdx] = {
            ...lastBody,
            value: lastLines.slice(0, closeLine).join('\n'),
          }
          const openingParagraph = buildParagraph(openBodyChildren)
          const bodyNodes = openingParagraph ? [openingParagraph] : []
          parent.children.splice(
            index,
            1,
            buildCallout(type, titleChildren, bodyNodes),
          )
          return
        }
      }

      // Case B: block callout spanning sibling nodes. The closing `:::` may be
      // a standalone paragraph, or the last line of a body paragraph.
      const openingParagraph = buildParagraph(openBodyChildren)
      const bodyNodes = openingParagraph ? [openingParagraph] : []
      let closeIndex = -1
      for (let i = index + 1; i < parent.children.length; i++) {
        const sibling = parent.children[i]
        const closing = stripTrailingCloseMarker(sibling)
        if (closing.found) {
          if (closing.node) bodyNodes.push(closing.node)
          closeIndex = i
          break
        }

        bodyNodes.push(sibling)
      }

      if (closeIndex === -1) return

      parent.children.splice(
        index,
        closeIndex - index + 1,
        buildCallout(type, titleChildren, bodyNodes),
      )
    })
  }
}

/**
 * Extract `:::type[Markdown title]` from the start of a paragraph.
 *
 * The title is deliberately kept as mdast phrasing nodes. This lets the
 * normal Markdown-to-HTML pipeline render formatting safely instead of
 * reparsing or injecting user-controlled HTML.
 */
function extractTitledOpening(children) {
  const first = children[0]
  if (first?.type !== 'text') return null

  const match = first.value.match(TITLED_OPEN_RE)
  if (!match) return null

  const titleChildren = []
  const initialTitle = first.value.slice(match[0].length)
  let bodyChildren = null

  for (let i = 0; i < children.length; i++) {
    const child = i === 0 ? { ...first, value: initialTitle } : children[i]

    if (child.type !== 'text') {
      titleChildren.push(child)
      continue
    }

    // The closing bracket must finish the opener's line. Anything after its
    // newline is the start of the callout body in the same paragraph.
    const close = child.value.match(/\](?=[ \t]*(?:\n|$))/)
    if (!close) {
      if (child.value) titleChildren.push(child)
      continue
    }

    const before = child.value.slice(0, close.index)
    if (before) titleChildren.push({ ...child, value: before })

    const after = child.value
      .slice(close.index + 1)
      .replace(/^[ \t]*(?:\n|$)/, '')
    bodyChildren = [
      ...(after ? [{ ...child, value: after }] : []),
      ...children.slice(i + 1),
    ]
    break
  }

  if (!bodyChildren) return null
  return {
    type: match[1],
    titleChildren:
      titleChildren.length > 0
        ? titleChildren
        : [{ type: 'text', value: TYPES[match[1]] ?? match[1] }],
    bodyChildren,
  }
}

/** Build a paragraph without preserving marker-only empty text nodes. */
function buildParagraph(children) {
  const nonEmptyChildren = children.filter(
    (child) => child.type !== 'text' || child.value.length > 0,
  )
  return nonEmptyChildren.length
    ? { type: 'paragraph', children: nonEmptyChildren }
    : null
}

/**
 * Remove a closing marker from the end of a block.
 *
 * CommonMark parses an unindented `:::` directly after a list as a lazy
 * continuation of the final list item. Consequently, the marker can be
 * nested under list > listItem > paragraph instead of being a root sibling.
 * Follow the final-child path so that construct closes the callout without
 * requiring authors to insert a blank line before `:::`.
 */
function stripTrailingCloseMarker(node) {
  if (node.type === 'paragraph') {
    const children = node.children || []
    const last = children.at(-1)
    if (last?.type !== 'text') return { found: false, node }

    const lines = last.value.split('\n')
    if (!CLOSE_RE.test(lines.at(-1).trim())) return { found: false, node }

    const value = lines.slice(0, -1).join('\n')
    const trimmedChildren = [
      ...children.slice(0, -1),
      ...(value ? [{ ...last, value }] : []),
    ]
    return {
      found: true,
      node: trimmedChildren.length
        ? { ...node, children: trimmedChildren }
        : null,
    }
  }

  const children = node.children
  if (!children?.length) return { found: false, node }

  const closing = stripTrailingCloseMarker(children.at(-1))
  if (!closing.found) return { found: false, node }

  const trimmedChildren = [
    ...children.slice(0, -1),
    ...(closing.node ? [closing.node] : []),
  ]
  return {
    found: true,
    node: trimmedChildren.length
      ? { ...node, children: trimmedChildren }
      : null,
  }
}

/**
 * Build the <aside> callout node.
 *
 * We use flow-content mdast types (`blockquote`) for the wrappers, not
 * `paragraph`. A `paragraph` is phrasing content, so mdast-to-hast would
 * place its block-level `<div>`/`<p>` children in a `<p>` context; the
 * browser then reparents them, which breaks Astro hydration. `blockquote`
 * is flow content and legally holds block children.
 *
 * The header uses a flow-content wrapper with a span-mapped paragraph for
 * its title. That keeps the HTML valid while preserving the title's parsed
 * Markdown children.
 */
function buildCallout(type, titleChildren, bodyNodes) {
  return {
    type: 'blockquote',
    data: {
      hName: 'aside',
      hProperties: { className: ['callout', `callout-${type}`] },
    },
    children: [
      {
        type: 'blockquote',
        data: {
          hName: 'div',
          hProperties: { className: ['callout-header'] },
        },
        children: [
          {
            type: 'html',
            value: `<span class="callout-icon" aria-hidden="true">${ICONS[type]}</span>`,
          },
          {
            type: 'paragraph',
            data: {
              hName: 'span',
              hProperties: { className: ['callout-title'] },
            },
            children: titleChildren,
          },
        ],
      },
      {
        type: 'blockquote',
        data: {
          hName: 'div',
          hProperties: { className: ['callout-body'] },
        },
        children: bodyNodes,
      },
    ],
  }
}

/** Inline SVG icons per type (Lucide). */
const ICONS = {
  note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8h.01"/><path d="M11 12h1v4h1"/><circle cx="12" cy="12" r="10"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  tip: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  warning:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  caution:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>',
  danger:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  disclaimer:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
}
