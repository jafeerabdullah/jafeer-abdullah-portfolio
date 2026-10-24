import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Play } from 'lucide-react'
import { IntroVideoModal } from './IntroVideoModal'

/** An independent overlay: the existing portrait and its scroll morph remain untouched. */
export function IntroVideoExperience() {
  const entry = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const exploreAfterClose = useRef(false)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useLayoutEffect(() => {
    const hero = document.getElementById('home')
    const portrait = hero?.querySelector<HTMLElement>('.hero-portrait-frame')
    if (!hero || !portrait) return
    let frame = 0
    let disposed = false
    let portraitBounds: DOMRect | null = null
    function measure() {
      frame = 0
      if (disposed || !entry.current || !trigger.current) return
      const bridge = document.querySelector<HTMLElement>('.portrait-bridge[data-visible="true"]')
      const bounds = (bridge ?? portrait!).getBoundingClientRect()
      portraitBounds = bounds
      const origin = hero!.getBoundingClientRect()
      const opacity = bridge
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue(
              '--portrait-copy-opacity',
            ) || 1,
          )
        : 1
      const controlY = bounds.top + bounds.height * 0.67
      const available = opacity > 0.05 && controlY > 100 && controlY < innerHeight - 36
      Object.assign(entry.current.style, {
        left: `${bounds.left - origin.left}px`,
        top: `${bounds.top - origin.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        opacity: String(opacity),
        visibility: available ? 'visible' : 'hidden',
      })
      trigger.current.disabled = !available
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    function hover(event: PointerEvent) {
      const bounds = portraitBounds
      if (!bounds || !entry.current) return
      entry.current.dataset.hovered = String(
        event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom,
      )
    }
    measure()
    const observer = new ResizeObserver(schedule)
    observer.observe(hero)
    observer.observe(portrait)
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('pointermove', hover, { passive: true })
    void document.fonts.ready.then(schedule)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('pointermove', hover)
    }
  }, [])

  function explore() {
    exploreAfterClose.current = true
    close()
  }
  function afterClose() {
    if (!exploreAfterClose.current) return
    exploreAfterClose.current = false
    // Reuse the homepage's existing project navigation and morph transition.
    requestAnimationFrame(() => {
      document.querySelector<HTMLAnchorElement>('#home .hero-actions a[href="#projects"]')?.click()
    })
  }

  return (
    <>
      <div ref={entry} className="intro-video-entry" style={{ visibility: 'hidden' }}>
        <button
          ref={trigger}
          type="button"
          className="intro-video-trigger"
          aria-label="Meet Me — open introduction video"
          aria-haspopup="dialog"
          aria-controls={open ? 'intro-video-dialog' : undefined}
          aria-expanded={open}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true })
            setOpen(true)
          }}
        >
          <Play size={15} fill="currentColor" aria-hidden="true" />
          <span>Meet Me</span>
        </button>
      </div>
      <AnimatePresence onExitComplete={afterClose}>
        {open && (
          <IntroVideoModal src="/videos/jafeer-intro.mp4" onClose={close} onExplore={explore} />
        )}
      </AnimatePresence>
    </>
  )
}
