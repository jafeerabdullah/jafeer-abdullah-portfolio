import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Project } from '../data/portfolio'
import { ProjectVisual } from './ProjectVisual'

const wrap = (value: number, count: number) => ((value % count) + count) % count
const spring = { type: 'spring', stiffness: 170, damping: 28, mass: 1 } as const
const ease = [0.22, 1, 0.36, 1] as const

export function ProjectsStack({
  projects,
  onOpen,
}: {
  projects: Project[]
  onOpen: (project: Project) => void
}) {
  const count = projects.length
  const [selection, setSelection] = useState({ index: 0, direction: 1 })
  const selected = count ? wrap(selection.index, count) : 0
  const [compact, setCompact] = useState(false)
  const reduced = useReducedMotion()
  const region = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null)
  const suppressClick = useRef(false)

  useLayoutEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  function move(direction: number) {
    if (count < 2) return
    // Functional updates and interruptible Motion springs keep rapid input in order.
    setSelection((current) => ({ index: wrap(current.index + direction, count), direction }))
  }
  function choose(index: number) {
    setSelection((current) => {
      if (index === current.index) return current
      let distance = index - current.index
      if (distance > count / 2) distance -= count
      if (distance < -count / 2) distance += count
      return { index, direction: Math.sign(distance) || 1 }
    })
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !count) return
    event.preventDefault()
    region.current?.focus({ preventScroll: true })
    if (event.key === 'Home') choose(0)
    else if (event.key === 'End') choose(count - 1)
    else move(event.key === 'ArrowRight' ? 1 : -1)
  }
  function finishGesture(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const start = gesture.current
    if (!start || event.pointerId !== start.id) return
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    if (!cancelled && start.dragging && Math.abs(event.clientX - start.x) > 40) {
      move(event.clientX < start.x ? 1 : -1)
      region.current?.focus({ preventScroll: true })
    }
  }

  if (!count) return null
  return (
    <div
      ref={region}
      className="project-stack"
      role="region"
      aria-roledescription="carousel"
      aria-label="Project showcase"
      aria-describedby="project-stack-help"
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-count={count}
    >
      <div
        className="project-stack-stage"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return
          suppressClick.current = false
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            dragging: false,
          }
        }}
        onPointerMove={(event) => {
          const start = gesture.current
          if (!start || start.id !== event.pointerId) return
          const dx = event.clientX - start.x,
            dy = event.clientY - start.y
          if (!start.dragging && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            start.dragging = true
            suppressClick.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }
        }}
        onPointerUp={(event) => finishGesture(event)}
        onPointerCancel={(event) => finishGesture(event, true)}
        onClickCapture={(event) => {
          if (!suppressClick.current) return
          suppressClick.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        {projects.map((_, offset) => {
          // Keep the active preview first for the existing section snapshot transition.
          const index = wrap(selected + offset, count)
          const project = projects[index]
          const active = offset === 0
          const depth = Math.min(offset, 4)
          const showing = depth < 4
          return (
            <motion.article
              key={project.id}
              className="project-card"
              data-active={active}
              data-depth={depth}
              data-project-id={project.id}
              aria-hidden={!active}
              inert={!active}
              aria-roledescription="slide"
              aria-labelledby={`project-card-title-${project.id}`}
              layout
              layoutId={`project-${project.id}`}
              initial={false}
              style={{ zIndex: active ? 10 : showing ? 4 - depth : 0 }}
              animate={{
                x: showing
                  ? depth * (compact ? 8 : 36)
                  : -selection.direction * (compact ? 28 : 64),
                y: showing ? -depth * (compact ? 12 : 22) : 16,
                z: reduced ? 0 : showing ? -depth * 70 : -250,
                rotateY: reduced ? 0 : showing ? -depth * 0.65 : 0,
                scale: showing ? 1 - depth * (compact ? 0.016 : 0.025) : 0.88,
                opacity: showing ? 1 - depth * 0.12 : 0,
              }}
              transition={
                reduced ? { duration: 0 } : { ...spring, layout: { duration: 0.65, ease } }
              }
            >
              <div className="project-card-copy">
                <motion.p className="project-category eyebrow" layoutId={`category-${project.id}`}>
                  {project.number} /{' '}
                  {project.category === 'Java' ? 'SOFTWARE' : project.category.toUpperCase()}{' '}
                  DEVELOPMENT
                </motion.p>
                <motion.h3 id={`project-card-title-${project.id}`} layoutId={`title-${project.id}`}>
                  {project.shortTitle}
                </motion.h3>
                <p className="project-description">{project.description}</p>
                <div className="tags">
                  {project.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="project-open"
                  aria-label={`Explore ${project.shortTitle}`}
                  onClick={() => onOpen(project)}
                  tabIndex={active ? 0 : -1}
                >
                  <span>View Project</span>
                  <span className="project-stack-action-icon">
                    <ArrowUpRight size={21} />
                  </span>
                </button>
              </div>
              <motion.button
                type="button"
                className="project-preview"
                layoutId={`visual-${project.id}`}
                aria-label={`Open preview for ${project.shortTitle}`}
                onClick={() => onOpen(project)}
                tabIndex={active ? 0 : -1}
              >
                <div className="project-preview-artwork">
                  <ProjectVisual project={project} />
                </div>
              </motion.button>
            </motion.article>
          )
        })}
      </div>
      <div className="project-stack-controls">
        <div className="project-stack-arrows" role="group" aria-label="Browse projects">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous project"
            disabled={count < 2}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={19} />
          </button>
          <span className="project-stack-counter eyebrow" aria-hidden="true">
            {String(selected + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span>
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Next project"
            disabled={count < 2}
            onClick={() => move(1)}
          >
            <ArrowRight size={19} />
          </button>
        </div>
        <div className="project-stack-picker" role="group" aria-label="Select a project">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              aria-label={`Show project ${project.number}: ${project.shortTitle}`}
              aria-pressed={index === selected}
              onClick={() => choose(index)}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <p id="project-stack-help" className="project-stack-help">
        Browse with the arrows, swipe, or use your keyboard.
      </p>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {projects[selected].shortTitle}. Project {selected + 1} of {count}.
      </span>
    </div>
  )
}
