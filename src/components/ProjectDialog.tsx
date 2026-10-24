import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ArrowUpRight, Check, Github, X } from 'lucide-react'
import type { Project } from '../data/portfolio'
import { ProjectVisual } from './ProjectVisual'

export function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.querySelector<HTMLElement>('.app-shell')!.inert = true
    const frame = requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }),
    )
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const nodes = dialog.current?.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]')
      if (!nodes?.length) return
      const first = nodes[0],
        last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = oldOverflow
      document.querySelector<HTMLElement>('.app-shell')!.inert = false
      document.removeEventListener('keydown', onKey)
      requestAnimationFrame(() => previousFocus?.focus({ preventScroll: true }))
    }
  }, [onClose])

  return createPortal(
    <motion.div
      className="dialog-layer"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.7 }}
    >
      <motion.div
        className="dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.45 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dialog-title-${project.id}`}
        className="project-dialog"
        layoutId={`project-${project.id}`}
        transition={{ layout: { duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] } }}
      >
        <button
          className="dialog-close icon-button"
          aria-label="Close project details"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <motion.div className="dialog-visual" layoutId={`visual-${project.id}`}>
          <ProjectVisual project={project} />
        </motion.div>
        <motion.div
          className="dialog-content"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.22 }}
        >
          <motion.p className="eyebrow accent" layoutId={`category-${project.id}`}>
            {project.number} / {project.type}
          </motion.p>
          <motion.h2 id={`dialog-title-${project.id}`} layoutId={`title-${project.id}`}>
            {project.title}
          </motion.h2>
          <p className="dialog-intro">{project.description}</p>
          <div className="tags">
            {project.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="dialog-copy-grid">
            <div>
              <h3>The problem</h3>
              <p>{project.problem}</p>
            </div>
            <div>
              <h3>My contribution</h3>
              <p>{project.contribution}</p>
            </div>
          </div>
          <h3>Inside the project</h3>
          <ul className="feature-list">
            {project.features.map((f) => (
              <li key={f}>
                <Check size={15} />
                {f}
              </li>
            ))}
          </ul>
          <div className="project-detail-links">
            <a
              className="button button-gold"
              href={project.repository}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              Explore the repository
              <ArrowUpRight size={17} />
            </a>
            {project.liveUrl && (
              <a
                className="button button-outline"
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit website <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
