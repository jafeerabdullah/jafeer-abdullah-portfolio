import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import { PORTRAIT_SNAPSHOT_EVENT } from './PortraitMorph'

const sections = [
  'home',
  'about',
  'skills',
  'projects',
  'education',
  'certificates',
  'contact',
] as const
type SectionId = (typeof sections)[number]
type NavigationRequest = {
  id: SectionId
  pushHistory: boolean
  keyboard: boolean
  x: number
  y: number
}
const surfaces: Record<SectionId, string> = {
  home: '.hero-portrait-frame',
  about: '.about-photo-wrap',
  skills: '.skills-grid',
  projects: '.project-preview',
  education: '.experience-card',
  certificates: '.certificate-card[data-active="true"] .certificate-preview',
  contact: '.contact-form-wrap',
}
const labels: Record<SectionId, string> = {
  home: 'Jafeer Abdullah',
  about: 'Behind the code',
  skills: 'The toolkit',
  projects: 'Selected work',
  education: 'The journey',
  certificates: 'Certifications',
  contact: 'Let’s connect',
}
const isSection = (id: string): id is SectionId => sections.some((section) => section === id)
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

function currentSection(): SectionId {
  let nearest: SectionId = 'home'
  let distance = Infinity
  for (const id of sections) {
    const rect = document.getElementById(id)!.getBoundingClientRect()
    if (rect.top < innerHeight * 0.6 && rect.bottom > 90) {
      const score = Math.abs(rect.top - 100)
      if (score < distance) {
        nearest = id
        distance = score
      }
    }
  }
  return nearest
}

function surface(section: HTMLElement): HTMLElement | null {
  if (section.id === 'home' || section.id === 'about') {
    const bridge = document.querySelector<HTMLElement>('.portrait-bridge[data-visible="true"]')
    if (bridge) return bridge
  }
  return section.querySelector<HTMLElement>(surfaces[section.id as SectionId])
}

/** Morph real browser snapshots; the fallback uses the same expanding rounded aperture. */
export function PageMorphTransitions() {
  const reduced = useReducedMotion()
  useEffect(() => {
    const root = document.documentElement
    let disposed = false
    let busy = false
    let skipRequested = false
    let pending: NavigationRequest | null = null
    let transition: ViewTransition | null = null
    let overlay: HTMLDivElement | null = null
    const animations = new Set<Animation>()
    const named = new Map<HTMLElement, string>()
    const oldRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'

    function clearNames() {
      named.forEach((previous, element) => {
        element.style.viewTransitionName = previous
      })
      named.clear()
    }
    function name(element: HTMLElement | null, value: string) {
      if (!element) return
      const rect = element.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > innerHeight || !rect.width || !rect.height) return
      named.set(element, element.style.viewTransitionName)
      element.style.viewTransitionName = value
    }
    function scroll(request: NavigationRequest) {
      const target = document.getElementById(request.id)!
      if (request.pushHistory && location.hash !== `#${request.id}`)
        history.pushState(null, '', `#${request.id}`)
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    function focus(request: NavigationRequest) {
      if (!request.keyboard) return
      const heading = document.querySelector<HTMLElement>(`#${request.id} h1, #${request.id} h2`)
      if (!heading) return
      const previous = heading.getAttribute('tabindex')
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
      heading.addEventListener(
        'blur',
        () => {
          if (previous === null) heading.removeAttribute('tabindex')
          else heading.setAttribute('tabindex', previous)
        },
        { once: true },
      )
    }
    async function play(element: HTMLElement, frames: Keyframe[], duration: number) {
      if (disposed) return
      const animation = element.animate(frames, {
        duration: skipRequested ? 0 : duration,
        easing: 'cubic-bezier(.76,0,.24,1)',
        fill: 'forwards',
      })
      animations.add(animation)
      try {
        await animation.finished
      } catch {
        /* A newer navigation or reduced motion cancels it. */
      }
      animations.delete(animation)
    }
    async function fallback(request: NavigationRequest) {
      overlay = document.createElement('div')
      overlay.className = 'page-morph-fallback'
      overlay.setAttribute('aria-hidden', 'true')
      const index = document.createElement('span')
      index.className = 'page-morph-index'
      index.textContent = `0${sections.indexOf(request.id)} / JAFEER ABDULLAH`
      const title = document.createElement('span')
      title.className = 'page-morph-word'
      title.textContent = labels[request.id]
      overlay.append(index, title)
      document.body.append(overlay)
      const x = Math.min(innerWidth - 12, Math.max(12, request.x))
      const y = Math.min(innerHeight - 12, Math.max(12, request.y))
      const point = `inset(${y}px ${innerWidth - x}px ${innerHeight - y}px ${x}px round 80px)`
      await play(
        overlay,
        [{ clipPath: point }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }],
        430,
      )
      if (disposed) return
      scroll(request)
      await nextFrame()
      const target = document
        .querySelector<HTMLElement>(`#${request.id} h1, #${request.id} h2`)!
        .getBoundingClientRect()
      const finalY = Math.max(0, Math.min(innerHeight, target.top + target.height / 2))
      const finalX = Math.max(0, Math.min(innerWidth, target.left + target.width / 2))
      await play(
        overlay,
        [
          { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 },
          {
            clipPath: `inset(${finalY}px ${innerWidth - finalX}px ${innerHeight - finalY}px ${finalX}px round 120px)`,
            opacity: 0.9,
          },
        ],
        510,
      )
      overlay?.remove()
      overlay = null
    }

    async function navigate(request: NavigationRequest) {
      if (disposed) return
      if (busy) {
        pending = request
        skipRequested = true
        transition?.skipTransition()
        animations.forEach((animation) => animation.finish())
        return
      }
      const from = currentSection()
      if (
        reduced ||
        matchMedia('(prefers-reduced-motion: reduce)').matches ||
        from === request.id
      ) {
        scroll(request)
        focus(request)
        return
      }
      busy = true
      skipRequested = false
      root.dataset.pageMorph = 'true'
      root.dataset.morphDirection =
        sections.indexOf(request.id) > sections.indexOf(from) ? 'forward' : 'backward'
      root.style.setProperty('--morph-x', `${Math.round((request.x / innerWidth) * 100)}%`)
      root.style.setProperty('--morph-y', `${Math.round((request.y / innerHeight) * 100)}%`)
      const oldSection = document.getElementById(from)!
      name(oldSection.querySelector<HTMLElement>('h1, h2'), 'portfolio-title')
      name(surface(oldSection), 'portfolio-visual')
      try {
        // Let mobile navigation close before taking the outgoing snapshot.
        await nextFrame()
        if (disposed) return
        if (typeof document.startViewTransition === 'function') {
          transition = document.startViewTransition(() => {
            clearNames()
            scroll(request)
            // Rendering is paused here, so waiting for requestAnimationFrame would deadlock.
            window.dispatchEvent(new Event(PORTRAIT_SNAPSHOT_EVENT))
            const next = document.getElementById(request.id)!
            name(next.querySelector<HTMLElement>('h1, h2'), 'portfolio-title')
            name(surface(next), 'portfolio-visual')
          })
          // A skipped snapshot still applies navigation and must not become an unhandled rejection.
          void transition.ready.catch(() => {})
          if (skipRequested) transition.skipTransition()
          await transition.finished
        } else {
          clearNames()
          await fallback(request)
        }
        focus(request)
      } catch {
        // A browser that cannot capture a snapshot still reaches the chosen section.
        if (!disposed) {
          scroll(request)
          focus(request)
        }
      } finally {
        overlay?.remove()
        overlay = null
        clearNames()
        root.removeAttribute('data-page-morph')
        root.removeAttribute('data-morph-direction')
        root.style.removeProperty('--morph-x')
        root.style.removeProperty('--morph-y')
        transition = null
        busy = false
        if (pending && !disposed) {
          const next = pending
          pending = null
          void navigate(next)
        }
      }
    }

    function click(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank' ||
        anchor.closest('[inert]')
      )
        return
      const id = anchor.getAttribute('href')!.slice(1)
      if (!isSection(id)) return
      event.preventDefault()
      const rect = anchor.getBoundingClientRect()
      void navigate({
        id,
        pushHistory: true,
        keyboard: event.detail === 0,
        x: event.detail ? event.clientX : rect.left + rect.width / 2,
        y: event.detail ? event.clientY : rect.top + rect.height / 2,
      })
    }
    function back() {
      const id = location.hash.slice(1) || 'home'
      if (isSection(id))
        void navigate({
          id,
          pushHistory: false,
          keyboard: true,
          x: innerWidth / 2,
          y: innerHeight / 2,
        })
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (busy) skipRequested = true
      transition?.skipTransition()
      animations.forEach((animation) => animation.finish())
    }
    document.addEventListener('click', click)
    document.addEventListener('keydown', escape)
    window.addEventListener('popstate', back)
    const initialHash = location.hash.slice(1)
    const initialFrame = isSection(initialHash)
      ? requestAnimationFrame(() =>
          document
            .getElementById(initialHash)
            ?.scrollIntoView({ behavior: 'instant', block: 'start' }),
        )
      : null
    return () => {
      disposed = true
      if (initialFrame !== null) cancelAnimationFrame(initialFrame)
      transition?.skipTransition()
      animations.forEach((animation) => animation.cancel())
      overlay?.remove()
      clearNames()
      root.removeAttribute('data-page-morph')
      root.removeAttribute('data-morph-direction')
      root.style.removeProperty('--morph-x')
      root.style.removeProperty('--morph-y')
      history.scrollRestoration = oldRestoration
      document.removeEventListener('click', click)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('popstate', back)
    }
  }, [reduced])
  return null
}
