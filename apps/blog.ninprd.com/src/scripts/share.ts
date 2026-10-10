// Copy link, native share, share as image, and share tracking. Reads data-share-* attributes
// from ShareSection.astro, so rename them in both files together.

const CONFIRMATION_MS = 2000

type ShareNetwork = 'facebook' | 'x' | 'copy' | 'native' | 'image'

// Matches the data-share-state values in ShareSection.astro.
type CopyState = 'idle' | 'copied' | 'failed'

// PostHog may be blocked, so every call is optional. Consent is handled in Posthog.astro.
function captureShare(network: ShareNetwork, postId: string) {
  window.posthog?.capture?.('post_shared', { network, post_id: postId })
}

function initShareSection(section: HTMLElement) {
  const postId = section.dataset.shareSection ?? ''
  const url = section.dataset.shareUrl ?? ''
  const title = section.dataset.shareTitle ?? ''

  const status = section.querySelector<HTMLElement>('[data-share-status]')

  for (const link of section.querySelectorAll<HTMLAnchorElement>(
    'a[data-share-network]',
  )) {
    link.addEventListener('click', () => {
      captureShare(link.dataset.shareNetwork as ShareNetwork, postId)
    })
  }

  initCopy(section, { postId, url, status })
  initNative(section, { postId, url, title })
  initImage(section, {
    postId,
    url,
    title,
    background: section.dataset.shareImageBackground ?? '',
    status,
  })
}

function initCopy(
  section: HTMLElement,
  context: { postId: string; url: string; status: HTMLElement | null },
) {
  const button = section.querySelector<HTMLButtonElement>('[data-share-copy]')
  if (!button) return

  const parts = [
    ...button.querySelectorAll<HTMLElement | SVGElement>('[data-share-state]'),
  ]
  let restoreTimer: number | undefined

  const show = (state: CopyState) => {
    for (const part of parts) {
      part.toggleAttribute('data-active', part.dataset.shareState === state)
    }
  }

  const announce = (state: Exclude<CopyState, 'idle'>) => {
    show(state)
    const message = button.querySelector(
      `[data-share-label][data-share-state="${state}"]`,
    )?.textContent
    if (context.status) context.status.textContent = message?.trim() ?? ''

    window.clearTimeout(restoreTimer)
    restoreTimer = window.setTimeout(() => {
      show('idle')
      if (context.status) context.status.textContent = ''
    }, CONFIRMATION_MS)
  }

  button.addEventListener('click', async () => {
    try {
      // navigator.clipboard is undefined over plain HTTP; the catch shows "Copy failed".
      await navigator.clipboard.writeText(context.url)
      announce('copied')
    } catch {
      announce('failed')
      return
    }

    captureShare('copy', context.postId)
  })
}

function initImage(
  section: HTMLElement,
  context: {
    postId: string
    url: string
    title: string
    background: string
    status: HTMLElement | null
  },
) {
  const button = section.querySelector<HTMLButtonElement>('[data-share-image]')
  if (!button || !context.background) return

  const label = button.querySelector<HTMLElement>('[data-share-image-label]')
  const idleLabel = label?.textContent ?? ''
  const announce = (message: string) => {
    if (context.status) context.status.textContent = message
  }

  const download = (blob: Blob) => {
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `${context.postId}.png`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
  }

  button.addEventListener('click', async () => {
    if (button.disabled) return
    button.disabled = true
    if (label) label.textContent = 'Generating...'
    announce('Generating image')

    try {
      // Loaded on click so the canvas code stays out of the initial page load.
      const { ShareImageGenerator } = await import('../lib/shareImageGenerator')
      const generator = new ShareImageGenerator()
      let blob: Blob
      try {
        blob = await generator.generate({
          title: context.title,
          backgroundImageUrl: context.background,
        })
      } finally {
        generator.dispose()
      }

      const file = new File([blob], `${context.postId}.png`, {
        type: 'image/png',
      })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: context.title,
            url: context.url,
          })
        } catch (error) {
          // Closing the share sheet rejects with AbortError. Not an error.
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }
          throw error
        }
      } else {
        download(blob)
      }
      captureShare('image', context.postId)
    } catch (error) {
      console.error('Share as image failed:', error)
      announce('Could not create image')
    } finally {
      button.disabled = false
      if (label) label.textContent = idleLabel
    }
  })
}

function initNative(
  section: HTMLElement,
  context: { postId: string; url: string; title: string },
) {
  const button = section.querySelector<HTMLButtonElement>('[data-share-native]')
  if (!button) return

  // Check support, not screen size: desktop Safari and Edge can share too.
  if (typeof navigator.share !== 'function') return

  button.hidden = false
  // ShareSection.astro hides Facebook and X on small screens when this is set.
  section.dataset.nativeShare = ''

  button.addEventListener('click', async () => {
    try {
      await navigator.share({ title: context.title, url: context.url })
    } catch {
      // Closing the share sheet also rejects. Not an error, and nothing to track.
      return
    }

    captureShare('native', context.postId)
  })
}

for (const section of document.querySelectorAll<HTMLElement>(
  '[data-share-section]',
)) {
  initShareSection(section)
}
