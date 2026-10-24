import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react'
import { AnimatePresence, motion, useInView, useTransform } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { MotionValue } from 'motion/react'
import { ArrowLeft, ArrowRight, Code2, Database, Layers3, Pause, Play, Wrench } from 'lucide-react'
import { skillGroups } from '../data/portfolio'
import { SkillIcon, skillArtwork } from './SkillIcon'
import type { SkillName } from './SkillIcon'
import { useSkillOrbit } from './useSkillOrbit'
import './SkillsCarousel.css'

const icons = { code: Code2, layers: Layers3, database: Database, tool: Wrench }
type SkillGroup = (typeof skillGroups)[number]
const wrap = (index: number, count: number) => ((index % count) + count) % count
const shortest = (distance: number, count: number) => {
  if (distance > count / 2) return distance - count
  if (distance < -count / 2) return distance + count
  return distance
}
const spring = { type: 'spring', stiffness: 150, damping: 25, mass: 0.9 } as const

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    setWidth(node.clientWidth)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}

/** One horizontal gesture advances one item; vertical touch scrolling stays native. */
function useSwipe(onStep: (direction: number) => void) {
  const start = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null)
  const suppressClick = useRef(false)
  function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const point = start.current
    if (!point || point.id !== event.pointerId) return
    start.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    const dx = event.clientX - point.x
    if (!cancelled && point.dragging && Math.abs(dx) > 40) {
      onStep(dx < 0 ? 1 : -1)
      event.currentTarget.focus({ preventScroll: true })
    }
  }
  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!event.isPrimary || event.button !== 0) return
      suppressClick.current = false
      start.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false }
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const point = start.current
      if (!point || point.id !== event.pointerId) return
      const dx = event.clientX - point.x,
        dy = event.clientY - point.y
      if (!point.dragging && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        point.dragging = true
        suppressClick.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event),
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (!suppressClick.current) return
      suppressClick.current = false
      event.preventDefault()
      event.stopPropagation()
    },
  }
}

function handleKeys(
  event: KeyboardEvent<HTMLDivElement>,
  onStep: (direction: number) => void,
  onSelect: (index: number) => void,
  count: number,
) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  event.currentTarget.focus({ preventScroll: true })
  if (event.key === 'Home') onSelect(0)
  else if (event.key === 'End') onSelect(count - 1)
  else onStep(event.key === 'ArrowRight' ? 1 : -1)
}

function OrbitSkill({
  label,
  index,
  count,
  rotation,
  radiusX,
  radiusY,
  compact,
  active,
  onSelect,
}: {
  label: SkillName
  index: number
  count: number
  rotation: MotionValue<number>
  radiusX: number
  radiusY: number
  compact: boolean
  active: boolean
  onSelect: (source: HTMLButtonElement) => void
}) {
  const angle = (value: number) => (((index * 360) / count - value) * Math.PI) / 180
  const x = useTransform(rotation, (value) => {
    const sine = Math.sin(angle(value))
    return radiusX * (compact ? Math.tanh(2 * sine) / Math.tanh(2) : sine)
  })
  const y = useTransform(rotation, (value) => Math.cos(angle(value)) * radiusY)
  const z = useTransform(rotation, (value) => Math.cos(angle(value)) * (compact ? 12 : 48))
  const scale = useTransform(rotation, (value) => 1 + Math.cos(angle(value)) * 0.04)
  const opacity = useTransform(rotation, (value) => 0.9 + Math.cos(angle(value)) * 0.1)
  return (
    <motion.div
      className="skill-orbit-node"
      data-active={active}
      style={{
        ...({ '--skill-brand': skillArtwork[label].color } as CSSProperties),
        x,
        y,
        z,
        scale,
        opacity,
      }}
    >
      <button
        type="button"
        className="skill-orbit-tag"
        aria-label={label}
        aria-pressed={active}
        onClick={(event) => onSelect(event.currentTarget)}
      >
        <span className="skill-orbit-face">
          <SkillIcon name={label} />
        </span>
        <span className="sr-only">{label}</span>
      </button>
      <span className="skill-orbit-tooltip" role="tooltip" aria-hidden="true">
        {label}
      </span>
    </motion.div>
  )
}

function SkillWheel({
  group,
  direction,
  paused,
  pauseUntil,
  documentVisible,
  reduced,
  onInteract,
  onToggle,
}: {
  group: SkillGroup
  direction: RefObject<1 | -1>
  paused: boolean
  pauseUntil: number
  documentVisible: boolean
  reduced: boolean
  onInteract: () => void
  onToggle: () => void
}) {
  const { ref, width } = useWidth()
  const visible = useInView(ref, { amount: 0.2 })
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const {
    rotation,
    selected,
    select,
    move: moveOrbit,
    running,
    cycleDirection,
  } = useSkillOrbit({
    count: group.items.length,
    direction,
    enabled: visible && documentVisible && !paused && !hovered && !keyboardFocus && !interacting,
    reduced: Boolean(reduced),
    pauseUntil,
    onInteract,
  })
  const hubLogo = useRef<HTMLDivElement>(null)
  const flightId = useRef(0)
  const [flight, setFlight] = useState<{
    id: number
    label: SkillName
    fromX: number
    fromY: number
    toX: number
    toY: number
    size: number
  } | null>(null)
  const compact = width < 600
  const tagWidth = compact
    ? Math.min(180, (width - 76) / 2)
    : Math.min(190, Math.max(150, (width - 260) / 2))
  const radiusX = compact ? (width - 52) / 2 - 6 : Math.min(350, (width - tagWidth) / 2 - 12)
  const radiusY = compact ? 190 : 170
  const selectedName = group.items[selected]
  const move = (direction: number) => {
    setFlight(null)
    moveOrbit(direction)
  }
  const choose = (index: number, source?: HTMLButtonElement) => {
    if (index !== selected && !reduced && source && ref.current && hubLogo.current) {
      const from = source.getBoundingClientRect()
      const to = hubLogo.current.getBoundingClientRect()
      const bounds = ref.current.getBoundingClientRect()
      setFlight({
        id: ++flightId.current,
        label: group.items[index],
        fromX: from.x + from.width / 2 - bounds.x - to.width / 2,
        fromY: from.y + from.height / 2 - bounds.y - to.height / 2,
        toX: to.x - bounds.x,
        toY: to.y - bounds.y,
        size: to.width,
      })
    } else setFlight(null)
    select(index)
  }
  const swipe = useSwipe(move)
  useEffect(() => {
    if (!interacting) return
    const release = () => {
      setInteracting(false)
      onInteract()
    }
    window.addEventListener('pointerup', release, true)
    window.addEventListener('pointercancel', release, true)
    return () => {
      window.removeEventListener('pointerup', release, true)
      window.removeEventListener('pointercancel', release, true)
    }
  }, [interacting, onInteract])

  const path =
    Array.from({ length: 97 }, (_, index) => {
      const angle = (index * Math.PI * 2) / 96
      const sine = Math.sin(angle)
      const x = compact ? Math.tanh(2 * sine) / Math.tanh(2) : sine
      return `${index ? 'L' : 'M'}${x.toFixed(4)},${Math.cos(angle).toFixed(4)}`
    }).join(' ') + ' Z'

  return (
    <motion.div
      className="skill-wheel-panel"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onFocusCapture={(event) => {
        if (event.target.matches(':focus-visible')) setKeyboardFocus(true)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false)
      }}
      onKeyDownCapture={() => setKeyboardFocus(true)}
      onPointerDownCapture={() => {
        setKeyboardFocus(false)
        setInteracting(true)
        onInteract()
      }}
    >
      <div
        ref={ref}
        className={`skill-orbit-stage ${compact ? 'is-compact' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Skills in ${group.title}`}
        aria-describedby="skills-interaction-help"
        tabIndex={0}
        data-auto-rotation={reduced ? 'reduced' : running ? 'running' : 'paused'}
        data-direction={cycleDirection === 1 ? 'clockwise' : 'counterclockwise'}
        style={{ '--skill-brand': skillArtwork[selectedName].color } as CSSProperties}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        onKeyDown={(event) => handleKeys(event, move, choose, group.items.length)}
        {...swipe}
      >
        {!reduced && (
          <button
            type="button"
            className="skill-rotation-control"
            aria-label={paused ? 'Resume automatic rotation' : 'Pause automatic rotation'}
            title={paused ? 'Resume automatic rotation' : 'Pause automatic rotation'}
            onClick={onToggle}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
        <svg
          className="skill-orbit-guide"
          aria-hidden="true"
          viewBox="-1.02 -1.02 2.04 2.04"
          preserveAspectRatio="none"
          style={{ width: radiusX * 2, height: radiusY * 2 }}
        >
          <path d={path} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="skill-orbit-hub" aria-hidden="true" data-selected-skill={selectedName}>
          <div className="skill-hub-logo" ref={hubLogo}>
            <motion.div
              key={selectedName}
              className="skill-hub-artwork"
              initial={reduced ? false : { opacity: 0, scale: 0.82, y: 4 }}
              animate={{ opacity: flight?.label === selectedName ? 0 : 1, scale: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <SkillIcon name={selectedName} />
            </motion.div>
          </div>
          <span className="skill-selected-name">
            <motion.span
              key={selectedName}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.12 }}
            >
              {selectedName}
            </motion.span>
          </span>
          <span className="eyebrow">
            {String(selected + 1).padStart(2, '0')} / {String(group.items.length).padStart(2, '0')}
          </span>
        </div>
        <div className="skill-orbit-plane">
          {group.items.map((label, index) => (
            <OrbitSkill
              key={label}
              label={label}
              index={index}
              count={group.items.length}
              rotation={rotation}
              radiusX={radiusX}
              radiusY={radiusY}
              compact={compact}
              active={selected === index}
              onSelect={(source) => choose(index, source)}
            />
          ))}
        </div>
        {flight && !reduced && (
          <motion.div
            key={flight.id}
            className="skill-selection-flight"
            aria-hidden="true"
            style={
              {
                width: flight.size,
                height: flight.size,
                '--skill-brand': skillArtwork[flight.label].color,
              } as CSSProperties
            }
            initial={{ x: flight.fromX, y: flight.fromY, opacity: 0.9, scale: 0.72 }}
            animate={{ x: flight.toX, y: flight.toY, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 210, damping: 27, mass: 0.8 }}
            onAnimationComplete={() =>
              setFlight((current) => (current?.id === flight.id ? null : current))
            }
          >
            <SkillIcon name={flight.label} />
          </motion.div>
        )}
      </div>
      <div className="skill-navigation" role="group" aria-label="Browse skills">
        <button
          type="button"
          className="icon-button"
          aria-label="Previous skill"
          onClick={() => move(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="eyebrow">
          {String(selected + 1).padStart(2, '0')}{' '}
          <span>/ {String(group.items.length).padStart(2, '0')}</span>
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label="Next skill"
          onClick={() => move(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <span
        role="status"
        aria-live={running ? 'off' : 'polite'}
        aria-atomic="true"
        className="sr-only"
      >
        {group.title}: {group.items[selected]}, {selected + 1} of {group.items.length}
      </span>
    </motion.div>
  )
}

export function SkillsCarousel() {
  const [category, setCategory] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pauseUntil, setPauseUntil] = useState(0)
  const [documentVisible, setDocumentVisible] = useState(true)
  const direction = useRef<1 | -1>(1)
  const scene = useRef<HTMLDivElement>(null)
  const visible = useInView(scene)
  const reduced = useReducedMotion()
  const { ref, width } = useWidth()
  const interact = useCallback(() => setPauseUntil(performance.now() + 4000), [])
  const chooseCategory = (index: number) => {
    interact()
    setCategory(index)
  }
  const move = (direction: number) => {
    interact()
    setCategory((current) => wrap(current + direction, skillGroups.length))
  }
  const swipe = useSwipe(move)
  useEffect(() => {
    const sync = () => setDocumentVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
  return (
    <div
      ref={scene}
      className="skills-grid skills-carousel"
      data-atmosphere-active={visible && documentVisible && !reduced ? 'true' : 'false'}
    >
      <div className="skills-atmosphere" aria-hidden="true">
        <div className="skills-nebula" />
        {Array.from({ length: 26 }, (_, index) => (
          <span
            key={index}
            className={`skills-star ${index % 9 === 0 ? 'is-sparkle' : ''} ${index % 7 === 0 ? 'is-drifting' : ''}`}
            style={
              {
                left: `${4 + ((index * 37) % 92)}%`,
                top: `${19 + ((index * 23) % 73)}%`,
                '--star-size': `${index % 9 === 0 ? 5 : index % 3 === 0 ? 2 : 1}px`,
                '--star-duration': `${5 + (index % 6) * 1.7}s`,
                '--star-delay': `${-index * 1.3}s`,
                '--star-color': ['191 177 218', '133 187 183', '202 182 139'][index % 3],
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        ref={ref}
        className="skill-category-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="Skill categories"
        aria-describedby="skills-interaction-help"
        tabIndex={0}
        onKeyDown={(event) => handleKeys(event, move, chooseCategory, skillGroups.length)}
        {...swipe}
      >
        <div className="skill-category-track">
          {skillGroups.map((group, index) => {
            const offset = shortest(index - category, skillGroups.length)
            const active = offset === 0,
              nearby = Math.abs(offset) <= 1
            const Icon = icons[group.icon]
            return (
              <motion.div
                key={group.title}
                className="skill-category-slot"
                aria-hidden={!nearby}
                inert={!nearby}
                data-position={offset}
                initial={false}
                style={{
                  zIndex: active ? 3 : nearby ? 2 : 0,
                  visibility: nearby ? 'visible' : 'hidden',
                }}
                animate={{
                  x: offset * Math.min(270, width * 0.42),
                  y: active ? 0 : 12,
                  z: active || reduced ? 0 : -70,
                  rotateY: reduced ? 0 : Math.sign(offset) * -22,
                  scale: active ? 1 : 0.88,
                  opacity: nearby ? (active ? 1 : 0.6) : 0,
                }}
                transition={reduced ? { duration: 0 } : spring}
              >
                <article className="skill-card skill-category-card" data-active={active}>
                  <div className="skill-card-top">
                    <Icon size={22} strokeWidth={1.3} />
                    <span className="eyebrow">0{index + 1}</span>
                  </div>
                  <h3>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseCategory(index)}
                    >
                      {group.title}
                    </button>
                  </h3>
                </article>
              </motion.div>
            )
          })}
        </div>
      </div>
      <div
        className="skill-navigation skill-category-navigation"
        role="group"
        aria-label="Browse skill categories"
      >
        <button
          type="button"
          className="icon-button"
          aria-label="Previous category"
          onClick={() => move(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="eyebrow">
          0{category + 1} <span>/ 04</span>
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label="Next category"
          onClick={() => move(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <SkillWheel
          key={category}
          group={skillGroups[category]}
          direction={direction}
          paused={paused}
          pauseUntil={pauseUntil}
          documentVisible={documentVisible}
          reduced={reduced}
          onInteract={interact}
          onToggle={() => setPaused((current) => !current)}
        />
      </AnimatePresence>
      <p id="skills-interaction-help" className="skill-interaction-help">
        Select a category, then explore its skills. Swipe or use the arrow keys when a carousel is
        focused.
      </p>
    </div>
  )
}
