/**
 * Progressive enhancement for `:::carousel` blocks: the markup alone is a
 * swipeable scroll-snap strip; this adds arrows, dots, keyboard navigation,
 * and a lightbox — clicking a slide opens that image full-screen.
 * Slides per page remain a CSS concern; all page positions come from layout.
 */
function initCarousel(carousel: Element) {
  const track = carousel.querySelector('.carousel-track')
  if (!(track instanceof HTMLElement)) return

  const slides = Array.from(
    track.querySelectorAll<HTMLElement>('.carousel-slide'),
  )
  if (slides.length === 0) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const perPage = () =>
    Math.max(1, Math.round(track.clientWidth / slides[0].offsetWidth))
  const slideOffset = (index: number) =>
    slides[index].offsetLeft - track.offsetLeft
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth)

  // These are the positions the browser can actually reach. In particular,
  // a partially filled final page is clamped to maxScroll rather than aligned
  // with its nominal first slide.
  const pageOffsets = () => {
    const slidesPerPage = perPage()
    const pages = Math.ceil(slides.length / slidesPerPage)
    const scrollLimit = maxScroll()

    return Array.from({ length: pages }, (_, page) => {
      const firstSlide = Math.min(page * slidesPerPage, slides.length - 1)
      return Math.min(slideOffset(firstSlide), scrollLimit)
    })
  }

  let activePage = 0

  const goToPage = (page: number) => {
    const offsets = pageOffsets()
    const clampedPage = Math.max(0, Math.min(page, offsets.length - 1))

    track.scrollTo({
      left: offsets[clampedPage],
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    })
  }

  const prev = document.createElement('button')
  prev.type = 'button'
  prev.className = 'carousel-arrow carousel-arrow--prev'
  prev.setAttribute('aria-label', 'Previous page')
  prev.innerHTML = chevron('left')
  prev.addEventListener('click', () => goToPage(activePage - 1))

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'carousel-arrow carousel-arrow--next'
  next.setAttribute('aria-label', 'Next page')
  next.innerHTML = chevron('right')
  next.addEventListener('click', () => goToPage(activePage + 1))

  const dotsRow = document.createElement('div')
  dotsRow.className = 'carousel-dots'
  carousel.append(prev, next, dotsRow)

  let dots: HTMLButtonElement[] = []
  let builtPages = 0
  const buildDots = (pages: number) => {
    dotsRow.replaceChildren()
    dots = Array.from({ length: pages }, (_, index) => {
      const dot = document.createElement('button')
      dot.type = 'button'
      dot.className = 'carousel-dot'
      dot.setAttribute('aria-label', `Go to page ${index + 1}`)
      dot.addEventListener('click', () => goToPage(index))
      dotsRow.appendChild(dot)
      return dot
    })
    builtPages = pages
  }

  const sync = () => {
    const offsets = pageOffsets()
    if (offsets.length !== builtPages) buildDots(offsets.length)

    let nearestDistance = Number.POSITIVE_INFINITY
    offsets.forEach((offset, page) => {
      const distance = Math.abs(offset - track.scrollLeft)
      if (distance < nearestDistance) {
        nearestDistance = distance
        activePage = page
      }
    })

    dots.forEach((dot, index) => {
      if (index === activePage) dot.setAttribute('aria-current', 'true')
      else dot.removeAttribute('aria-current')
    })

    carousel.classList.toggle('carousel--js', offsets.length > 1)
    prev.disabled = activePage === 0
    next.disabled = activePage >= offsets.length - 1
  }

  if ('onscrollend' in document.documentElement) {
    track.addEventListener('scrollend', sync)
  } else {
    let animationFrame: number | null = null
    track.addEventListener('scroll', () => {
      if (animationFrame !== null) return
      animationFrame = requestAnimationFrame(() => {
        animationFrame = null
        sync()
      })
    })
  }
  window.addEventListener('resize', sync)

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToPage(activePage - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToPage(activePage + 1)
    }
  })

  sync()

  // --- Lightbox ---------------------------------------------------------
  // Mark the carousel so CSS can afford the click (cursor + press feedback).
  // Note `carousel--js` is page-count dependent; this class is not, so even a
  // single-page carousel gets a working lightbox.
  carousel.classList.add('carousel--lightbox')

  // Remember where a press started so swipes on the scrollable track can be
  // told apart from deliberate clicks when the `click` fires after them.
  let pointerDownAt: { x: number; y: number } | null = null
  track.addEventListener('pointerdown', (event) => {
    pointerDownAt = { x: event.clientX, y: event.clientY }
  })

  track.addEventListener('click', (event) => {
    const target = event.target
    const slide =
      target instanceof Element
        ? target.closest<HTMLElement>('.carousel-slide')
        : null
    if (!slide) return
    if (
      pointerDownAt &&
      Math.hypot(
        event.clientX - pointerDownAt.x,
        event.clientY - pointerDownAt.y,
      ) > 8
    )
      return

    const images: LightboxImage[] = []
    let index = 0
    for (let i = 0; i < slides.length; i++) {
      const img = slides[i].querySelector<HTMLImageElement>('img')
      if (!img) continue
      if (slides[i] === slide) index = images.length
      images.push({ src: largestSrc(img), alt: img.getAttribute('alt') ?? '' })
    }

    getLightbox().open(images, index, track)
  })
}

/* ---------------------------------------------------------------------- */
/* Lightbox. One overlay is built lazily on first open and shared by every */
/* carousel on the page. Enter/exit transitions live in globals.css; the   */
/* script only toggles classes and waits for them to settle.               */
/* ---------------------------------------------------------------------- */

interface LightboxImage {
  src: string
  alt: string
}

interface LightboxController {
  open: (
    images: LightboxImage[],
    index: number,
    returnFocus: HTMLElement,
  ) => void
}

let lightboxController: LightboxController | null = null

function getLightbox(): LightboxController {
  if (lightboxController) return lightboxController

  const overlay = document.createElement('div')
  overlay.className = 'carousel-lightbox'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.hidden = true

  const figure = document.createElement('figure')
  figure.className = 'carousel-lightbox-figure'

  const image = document.createElement('img')
  image.className = 'carousel-lightbox-image'
  image.alt = ''
  image.decoding = 'async'

  const caption = document.createElement('figcaption')
  caption.className = 'carousel-lightbox-caption'

  const counter = document.createElement('div')
  counter.className = 'carousel-lightbox-counter'

  const close = lightboxButton('Close', 'close')
  close.classList.add('carousel-lightbox-button--close')
  const prev = lightboxButton('Previous image', 'left')
  prev.classList.add('carousel-lightbox-button--prev')
  const next = lightboxButton('Next image', 'right')
  next.classList.add('carousel-lightbox-button--next')

  figure.append(image, caption)
  overlay.append(counter, close, prev, next, figure)
  document.body.append(overlay)

  let images: LightboxImage[] = []
  let current = 0
  let isOpen = false
  let returnFocus: HTMLElement | null = null
  let previousOverflow = ''
  let swapToken = 0

  const show = (index: number) => {
    current = Math.max(0, Math.min(index, images.length - 1))
    const item = images[current]

    counter.textContent = `${current + 1} / ${images.length}`
    if (item.alt.trim() !== '') {
      caption.textContent = item.alt
      caption.hidden = false
      overlay.setAttribute('aria-label', item.alt)
    } else {
      caption.hidden = true
      overlay.setAttribute(
        'aria-label',
        `Image ${current + 1} of ${images.length}`,
      )
    }

    prev.disabled = images.length < 2
    next.disabled = images.length < 2

    // Crossfade: fade the current image out, decode the next one off-screen,
    // swap and fade it back in. The token drops stale decodes when the user
    // pages through quickly.
    const token = ++swapToken
    overlay.classList.add('carousel-lightbox--loading')
    const candidate = new Image()
    candidate.src = item.src
    const reveal = () => {
      if (token !== swapToken) return
      image.src = item.src
      image.alt = item.alt
      overlay.classList.remove('carousel-lightbox--loading')
    }
    if (typeof candidate.decode === 'function') {
      candidate.decode().then(reveal, reveal)
    } else {
      candidate.onload = reveal
      candidate.onerror = reveal
    }

    // Warm the neighbours so the arrows feel instant.
    for (const neighbour of [images[current - 1], images[current + 1]]) {
      if (neighbour) {
        const warm = new Image()
        warm.src = neighbour.src
      }
    }
  }

  const settleClose = () => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      if (isOpen) return // reopened before the exit transition finished
      overlay.hidden = true
      returnFocus?.focus()
    }
    overlay.addEventListener(
      'transitionend',
      (event) => {
        if (event.target === overlay && event.propertyName === 'opacity') {
          done()
        }
      },
      { once: true },
    )
    window.setTimeout(done, 350)
  }

  const closeOverlay = () => {
    if (!isOpen) return
    isOpen = false
    overlay.classList.remove('carousel-lightbox--open')
    document.documentElement.style.overflow = previousOverflow
    settleClose()
  }

  const openOverlay = (
    items: LightboxImage[],
    index: number,
    focus: HTMLElement,
  ) => {
    if (items.length === 0) return
    images = items
    returnFocus = focus

    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    overlay.hidden = false
    show(index)
    // Force a layout pass so the enter transition below actually runs.
    void overlay.offsetHeight
    overlay.classList.add('carousel-lightbox--open')
    isOpen = true
    close.focus()
  }

  // Document-level (not overlay-level): focus can be lost to the page when
  // the backdrop is clicked, and keys must keep working regardless.
  document.addEventListener('keydown', (event) => {
    if (!isOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeOverlay()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      show(current - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      show(current + 1)
    } else if (event.key === 'Tab') {
      // Minimal trap: cycle between the three lightbox buttons.
      const focusables = [close, prev, next]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  })

  // Clicks on the dimmed backdrop close; clicks on the image itself do not.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeOverlay()
  })

  prev.addEventListener('click', () => show(current - 1))
  next.addEventListener('click', () => show(current + 1))
  close.addEventListener('click', closeOverlay)

  lightboxController = { open: openOverlay }
  return lightboxController
}

function lightboxButton(label: string, icon: 'left' | 'right' | 'close') {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'carousel-lightbox-button'
  button.setAttribute('aria-label', label)
  button.innerHTML =
    icon === 'close'
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
      : chevron(icon)
  return button
}

/** Largest candidate in the image's `srcset`, else its rendered source. */
function largestSrc(img: HTMLImageElement): string {
  const srcset = img.getAttribute('srcset')
  if (srcset) {
    let best: { url: string; width: number } | null = null
    for (const candidate of srcset.split(',')) {
      const [url, descriptor] = candidate.trim().split(/\s+/)
      if (!url) continue
      const width = descriptor?.endsWith('w')
        ? Number.parseInt(descriptor, 10)
        : Number.NaN
      if (Number.isNaN(width)) continue
      if (!best || width > best.width) {
        best = { url, width }
      }
    }
    if (best) return new URL(best.url, document.baseURI).href
  }
  return img.currentSrc || img.src
}

const chevron = (direction: 'left' | 'right') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${
    direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'
  }"/></svg>`

document.querySelectorAll('.carousel').forEach(initCarousel)
