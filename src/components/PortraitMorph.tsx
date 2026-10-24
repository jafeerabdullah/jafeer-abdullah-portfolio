import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface PortraitBounds {
  left: number
  top: number
  width: number
  height: number
}

interface BridgeBounds {
  from: PortraitBounds
  to: PortraitBounds
  end: number
}

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress
const phase = (value: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (value - from) / (to - from)))
export const PORTRAIT_SNAPSHOT_EVENT = 'portfolio:portrait-snapshot'

export function AboutPortrait() {
  return (
    <div className="about-photo-wrap">
      <img
        src="/images/jafeer-about-sunglasses.jpeg"
        alt="Jafeer Abdullah outdoors wearing sunglasses and a striped shirt"
        width="960"
        height="1280"
        loading="lazy"
      />
      <div className="photo-corner top-left" />
      <div className="photo-corner bottom-right" />
      <span className="photo-index eyebrow">A LITTLE MORE HUMAN.</span>
    </div>
  )
}

/** One fixed portrait travels between the two real image frames, in either scroll direction. */
export function PortraitMorph() {
  const reduced = useReducedMotion()
  const [bounds, setBounds] = useState<BridgeBounds | null>(null)
  const bridge = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const progress = useTransform(scrollY, (y) =>
    bounds ? Math.max(0, Math.min(1, y / bounds.end)) : 0,
  )
  const left = useTransform(progress, (p) =>
    bounds ? mix(bounds.from.left, bounds.to.left, p) : 0,
  )
  const top = useTransform([progress, scrollY], (values) => {
    const [p, y] = values as number[]
    return bounds ? mix(bounds.from.top, bounds.to.top, p) - y : 0
  })
  const width = useTransform(progress, (p) =>
    bounds ? mix(bounds.from.width, bounds.to.width, p) : 0,
  )
  const height = useTransform(progress, (p) =>
    bounds ? mix(bounds.from.height, bounds.to.height, p) : 0,
  )
  const radius = useTransform(progress, [0, 0.34, 0.7, 1], [0, 46, 20, 0])
  const suitOpacity = useTransform(progress, [0, 0.7, 0.79, 1], [1, 1, 0, 0])
  const photoOpacity = useTransform(progress, [0, 0.7, 0.79, 1], [0, 0, 1, 1])
  const panelOpacity = useTransform(progress, [0, 0.18, 0.52, 1], [0, 0, 1, 1])
  const edgeOpacity = useTransform(progress, [0, 0.24, 0.72, 1], [0, 0.55, 0.3, 0])
  const visibility = useTransform(scrollY, (y) => (bounds && y < bounds.end ? 'visible' : 'hidden'))

  useLayoutEffect(() => {
    const media = window.matchMedia(
      '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
    )
    const hero = document.querySelector<HTMLElement>('#home .hero-portrait-frame')
    const about = document.querySelector<HTMLElement>('#about .about-photo-wrap')
    if (!hero || !about) return
    let disposed = false
    function measure() {
      if (disposed) return
      if (!media.matches || reduced) {
        setBounds(null)
        return
      }
      const fromRect = hero!.getBoundingClientRect()
      const toRect = about!.getBoundingClientRect()
      const reveal = about!.closest<HTMLElement>('.reveal')
      const revealY = reveal ? new DOMMatrixReadOnly(getComputedStyle(reveal).transform).m42 : 0
      const from = {
        left: fromRect.left,
        top: fromRect.top + window.scrollY,
        width: fromRect.width,
        height: fromRect.height,
      }
      const to = {
        left: toRect.left,
        top: toRect.top + window.scrollY - revealY,
        width: toRect.width,
        height: toRect.height,
      }
      setBounds({ from, to, end: Math.max(1, to.top - from.top) })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(hero)
    observer.observe(about)
    media.addEventListener('change', measure)
    window.addEventListener('resize', measure)
    void document.fonts.ready.then(measure)
    return () => {
      disposed = true
      observer.disconnect()
      media.removeEventListener('change', measure)
      window.removeEventListener('resize', measure)
    }
  }, [reduced])

  useEffect(() => {
    const heroCopy = document.querySelector<HTMLElement>('#home .hero-bottom')
    const previousInert = heroCopy?.inert ?? false
    function sync(y: number) {
      const active = !!bounds && !reduced && y < bounds.end
      const currentPhase = bounds ? phase(y, 0, bounds.end) : 0
      if (heroCopy) heroCopy.inert = previousInert || (active && currentPhase >= 0.4)
      document.documentElement.toggleAttribute('data-portrait-bridge', active)
      if (active) {
        const phase = Math.max(0, Math.min(1, y / bounds!.end))
        const copyOpacity = 1 - Math.max(0, Math.min(1, (phase - 0.23) / 0.17))
        document.documentElement.style.setProperty('--portrait-copy-opacity', String(copyOpacity))
      } else {
        document.documentElement.style.removeProperty('--portrait-copy-opacity')
      }
      if (bridge.current) bridge.current.dataset.visible = String(active)
    }
    function snapshot() {
      const y = window.scrollY
      sync(y)
      if (!bounds || !bridge.current) return
      const p = phase(y, 0, bounds.end)
      const rounded =
        p < 0.34
          ? mix(0, 46, phase(p, 0, 0.34))
          : p < 0.7
            ? mix(46, 20, phase(p, 0.34, 0.7))
            : mix(20, 0, phase(p, 0.7, 1))
      Object.assign(bridge.current.style, {
        left: `${mix(bounds.from.left, bounds.to.left, p)}px`,
        top: `${mix(bounds.from.top, bounds.to.top, p) - y}px`,
        width: `${mix(bounds.from.width, bounds.to.width, p)}px`,
        height: `${mix(bounds.from.height, bounds.to.height, p)}px`,
        borderRadius: `${rounded}px`,
        visibility: y < bounds.end ? 'visible' : 'hidden',
      })
      const layers: Record<string, number> = {
        '.portrait-bridge-suit': 1 - phase(p, 0.7, 0.79),
        '.portrait-bridge-about': phase(p, 0.7, 0.79),
        '.portrait-bridge-panel': phase(p, 0.18, 0.52),
        '.portrait-bridge-edge':
          p < 0.24
            ? mix(0, 0.55, phase(p, 0, 0.24))
            : p < 0.72
              ? mix(0.55, 0.3, phase(p, 0.24, 0.72))
              : mix(0.3, 0, phase(p, 0.72, 1)),
      }
      Object.entries(layers).forEach(([selector, opacity]) => {
        const layer = bridge.current?.querySelector<HTMLElement>(selector)
        if (layer) layer.style.opacity = String(opacity)
      })
    }
    sync(scrollY.get())
    const unsubscribe = scrollY.on('change', sync)
    // Native snapshots suspend animation frames: synchronize this one frame directly.
    window.addEventListener(PORTRAIT_SNAPSHOT_EVENT, snapshot)
    return () => {
      unsubscribe()
      window.removeEventListener(PORTRAIT_SNAPSHOT_EVENT, snapshot)
      document.documentElement.removeAttribute('data-portrait-bridge')
      document.documentElement.style.removeProperty('--portrait-copy-opacity')
      if (heroCopy) heroCopy.inert = previousInert
    }
  }, [bounds, reduced, scrollY])

  if (!bounds || reduced) return null
  return createPortal(
    <motion.div
      ref={bridge}
      className="portrait-bridge"
      style={{ left, top, width, height, borderRadius: radius, visibility }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      aria-hidden="true"
    >
      <motion.div className="portrait-bridge-panel" style={{ opacity: panelOpacity }} />
      <motion.div className="portrait-bridge-suit" style={{ opacity: suitOpacity }}>
        <img
          className="hero-portrait"
          src="/images/jafeer-studio-portrait.webp"
          alt=""
          width="1448"
          height="1086"
        />
      </motion.div>
      <motion.div className="portrait-bridge-about" style={{ opacity: photoOpacity }}>
        <AboutPortrait />
      </motion.div>
      <motion.div className="portrait-bridge-edge" style={{ opacity: edgeOpacity }} />
    </motion.div>,
    document.body,
  )
}
