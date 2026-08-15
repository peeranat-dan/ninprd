/**
 * Progressive enhancement for `:::carousel` blocks: the markup alone is a
 * swipeable scroll-snap strip; this adds arrows, dots, and keyboard navigation.
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
}

const chevron = (direction: 'left' | 'right') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${
    direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'
  }"/></svg>`

document.querySelectorAll('.carousel').forEach(initCarousel)
