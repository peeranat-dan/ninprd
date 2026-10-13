import * as React from 'react'

import { Badge } from '@ninprd/ui/components/badge'
import { cn } from '@ninprd/ui/lib/utils'

import { FACI_EXPERIENCE, FACI_ROLES, type FaciRole } from '../../faci'

type Filter = FaciRole | 'all'

const filterExperience = (filter: Filter) =>
  filter === 'all'
    ? FACI_EXPERIENCE
    : FACI_EXPERIENCE.filter(({ role }) => role === filter)

function ExperienceList() {
  const [filter, setFilter] = React.useState<Filter>('all')
  const [hasFiltered, setHasFiltered] = React.useState(false)
  const [isReady, setIsReady] = React.useState(false)
  const tabsRef = React.useRef<HTMLDivElement>(null)
  const highlightRef = React.useRef<HTMLDivElement>(null)

  const experiences = filterExperience(filter)

  // Clip the highlighted copy of the tab list down to the pressed tab.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the pressed tab changes
  React.useLayoutEffect(() => {
    const tabs = tabsRef.current
    const highlight = highlightRef.current
    if (!tabs || !highlight) return

    const moveHighlight = () => {
      const pressed = tabs.querySelector<HTMLElement>('[aria-pressed="true"]')
      if (!pressed) return
      const top = pressed.offsetTop
      const left = pressed.offsetLeft
      const right = highlight.offsetWidth - left - pressed.offsetWidth
      const bottom = highlight.offsetHeight - top - pressed.offsetHeight
      highlight.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`
    }

    moveHighlight()
    const observer = new ResizeObserver(moveHighlight)
    observer.observe(tabs)
    return () => observer.disconnect()
  }, [filter])

  // Flag which edges hide more tabs so the pill can fade out on that side.
  React.useEffect(() => {
    const scroller = tabsRef.current?.parentElement
    if (!scroller) return

    // Scrolling a tab into view stops short of the track's 4px padding.
    const slack = 6
    const markEdges = () => {
      const { scrollLeft, clientWidth, scrollWidth } = scroller
      scroller.toggleAttribute('data-more-start', scrollLeft > slack)
      scroller.toggleAttribute(
        'data-more-end',
        scrollLeft + clientWidth < scrollWidth - slack,
      )
    }

    markEdges()
    scroller.addEventListener('scroll', markEdges, { passive: true })
    const observer = new ResizeObserver(markEdges)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', markEdges)
      observer.disconnect()
    }
  }, [])

  // Enable the slide only after the first position is painted.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <div
        className="reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ '--reveal-delay': '420ms' } as React.CSSProperties}
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Experience
        </h2>
        <div className="faci-tabs-scroll">
          <div
            ref={tabsRef}
            className="faci-tabs"
            // biome-ignore lint/a11y/useSemanticElements: a toggle-button group, not a form fieldset
            role="group"
            aria-label="Filter experience by role"
            data-ready={isReady ? '' : undefined}
          >
            {FACI_ROLES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className="faci-tab cursor-pointer"
                aria-pressed={id === filter}
                onClick={(event) => {
                  event.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                  })
                  if (id === filter) return
                  setFilter(id)
                  setHasFiltered(true)
                }}
              >
                {label}
                <span className="faci-tab-count">
                  {filterExperience(id).length}
                </span>
              </button>
            ))}
            <div
              ref={highlightRef}
              className="faci-tabs-active"
              aria-hidden="true"
            >
              {FACI_ROLES.map(({ id, label }) => (
                <span key={id} className="faci-tab">
                  {label}
                  <span className="faci-tab-count">
                    {filterExperience(id).length}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {hasFiltered
          ? `Showing ${experiences.length} ${experiences.length === 1 ? 'experience' : 'experiences'}`
          : null}
      </p>

      {/* Keyed by filter so the rows remount and their entrance replays once. */}
      <ol key={filter} className="mt-6 flex flex-col gap-2">
        {experiences.map(
          (
            {
              title,
              organizer,
              roleLabel,
              batch,
              period,
              description,
              topics,
              url,
            },
            i,
          ) => (
            <li
              key={title}
              className="reveal"
              style={
                (hasFiltered
                  ? {
                      '--reveal-delay': `${i * 30}ms`,
                      '--reveal-duration': '240ms',
                    }
                  : {
                      '--reveal-delay': `${480 + i * 40}ms`,
                    }) as unknown as React.CSSProperties
              }
            >
              <div
                className={cn(
                  'group relative grid grid-cols-4 gap-1 rounded-xl border border-transparent p-3 sm:gap-6 sm:p-4',
                  url && 'experience-card',
                )}
              >
                <div className="col-span-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium sm:col-span-1 sm:flex-col sm:items-start sm:pt-1">
                  <span>{roleLabel}</span>
                  {period && (
                    <span className="text-muted-foreground tabular-nums">
                      {period}
                    </span>
                  )}
                  {batch && (
                    <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[11px] leading-4 text-primary tabular-nums sm:mt-1">
                      {batch}
                    </span>
                  )}
                </div>
                <div className="col-span-4 sm:col-span-3">
                  {url ? (
                    <span className="inline-flex items-center gap-1 text-base font-medium transition-colors duration-200 group-hover:text-primary">
                      <a
                        className="experience-link before:absolute before:inset-0 before:content-['']"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {title} · {organizer}
                      </a>
                      <span
                        aria-hidden="true"
                        className="translate-y-px opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-60"
                      >
                        ↗
                      </span>
                    </span>
                  ) : (
                    <span className="text-base font-medium">
                      {title} · {organizer}
                    </span>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {description}
                  </p>
                  <ul
                    className="mt-3 flex flex-wrap gap-1.5"
                    aria-label="Topics"
                  >
                    {topics.map((topic) => (
                      <li key={topic}>
                        <Badge variant="secondary">{topic}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ),
        )}
      </ol>
    </>
  )
}

export { ExperienceList }
