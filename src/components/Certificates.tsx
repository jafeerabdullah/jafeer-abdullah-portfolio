import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Download,
  FileText,
  Maximize2,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { certifications } from '../data/portfolio'
import type { Certificate, CertificateCategory } from '../data/portfolio'
import { CertificateCard } from './CertificateCard'
import './Certificates.css'

const ease = [0.22, 1, 0.36, 1] as const
const count = (value: number) => String(value).padStart(2, '0')

function CertificateDialog({
  certificate,
  onClose,
}: {
  certificate: Certificate
  onClose: () => void
}) {
  const dialog = useRef<HTMLDivElement>(null)
  const documentArea = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const reduced = useReducedMotion()

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const shell = document.querySelector<HTMLElement>('.app-shell')!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    shell.inert = true
    const frame = requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }),
    )
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const nodes = dialog.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex="0"]',
      )
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
    document.addEventListener('keydown', keydown)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      shell.inert = false
      document.removeEventListener('keydown', keydown)
      requestAnimationFrame(() => previousFocus?.focus({ preventScroll: true }))
    }
  }, [onClose])

  function fit() {
    setZoom(1)
    documentArea.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  return createPortal(
    <motion.div
      className="dialog-layer certificate-layer"
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      <motion.div
        className="dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.35 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`certificate-title-${certificate.id}`}
        className="certificate-dialog"
        layoutId={`certificate-${certificate.id}`}
        transition={{ layout: { duration: reduced ? 0 : 0.55, ease } }}
      >
        <div className="certificate-dialog-top">
          <span className="eyebrow">
            <FileText size={14} /> CERTIFICATE ARCHIVE
          </span>
          <button className="icon-button" aria-label="Close certificate preview" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="certificate-dialog-body">
          <div className="certificate-reader">
            <div className="certificate-zoom" role="group" aria-label="Document zoom controls">
              <button
                className="icon-button"
                aria-label="Zoom out"
                disabled={zoom === 1}
                onClick={() => setZoom((v) => Math.max(1, v - 0.5))}
              >
                <Minus size={16} />
              </button>
              <span aria-live="polite">{zoom === 1 ? 'FIT' : `${zoom * 100}%`}</span>
              <button
                className="icon-button"
                aria-label="Zoom in"
                disabled={zoom === 3}
                onClick={() => setZoom((v) => Math.min(3, v + 0.5))}
              >
                <Plus size={16} />
              </button>
              <button className="fit-document" onClick={fit}>
                <Maximize2 size={13} /> Fit document
              </button>
            </div>
            <div
              ref={documentArea}
              className={`certificate-document ${zoom > 1 ? 'is-zoomed' : ''}`}
              tabIndex={0}
              role="region"
              aria-label={`${certificate.title} document; use the arrow keys to scroll when zoomed`}
            >
              <img
                src={certificate.image}
                alt={`${certificate.title} certificate, issued to ${certificate.recipient}`}
                width={certificate.width}
                height={certificate.height}
                decoding="async"
                style={zoom > 1 ? { width: `${zoom * 100}%` } : undefined}
              />
            </div>
          </div>
          <div className="certificate-detail">
            <p className="eyebrow accent">
              {certificate.category} / {certificate.format}
            </p>
            <h2 id={`certificate-title-${certificate.id}`}>{certificate.title}</h2>
            <p className="certificate-detail-issuer">{certificate.issuer}</p>
            <span className="credential-result">
              <Award size={15} />
              {certificate.credential}
            </span>
            <p className="certificate-detail-description">{certificate.description}</p>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>{certificate.date}</dd>
              </div>
              <div>
                <dt>Recipient on document</dt>
                <dd>{certificate.recipient}</dd>
              </div>
            </dl>
            <div className="certificate-detail-actions">
              {certificate.badgeUrl && (
                <a
                  className="button button-gold"
                  href={certificate.badgeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Credly badge <ArrowUpRight size={16} />
                </a>
              )}
              <a className="button button-outline" href={certificate.document} download>
                Download original {certificate.format} <Download size={15} />
              </a>
              <a className="text-link" href={certificate.image} target="_blank" rel="noreferrer">
                Open readable preview <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export function Certificates() {
  const [filter, setFilter] = useState<'All' | CertificateCategory>('All')
  const [selected, setSelected] = useState<Certificate | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [stageWidth, setStageWidth] = useState(720)
  const stage = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null)
  const suppressClick = useRef(false)
  const dragX = useMotionValue(0)
  const reduced = useReducedMotion()
  const close = useCallback(() => setSelected(null), [])
  const visible = certifications.filter((c) => filter === 'All' || c.category === filter)
  const index = Math.min(activeIndex, visible.length - 1)
  const active = visible[index]
  const shift = Math.min(stageWidth * 0.42, 305)

  useEffect(() => {
    if (!stage.current) return
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width))
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => () => dragX.stop(), [dragX])

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + visible.length) % visible.length)
  }
  function select(next: number) {
    setActiveIndex(next)
    stage.current?.focus({ preventScroll: true })
  }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || visible.length < 2) return
    dragX.stop()
    suppressClick.current = false
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false }
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = gesture.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!start.dragging && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      start.dragging = true
      event.currentTarget.setPointerCapture(event.pointerId)
      suppressClick.current = true
    }
    if (start.dragging) dragX.set(Math.max(-90, Math.min(90, dx * 0.45)))
  }
  function pointerEnd(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const start = gesture.current
    if (!start || start.id !== event.pointerId) return
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    const dx = event.clientX - start.x
    if (!cancelled && start.dragging && Math.abs(dx) > 42) {
      move(dx < 0 ? 1 : -1)
      stage.current?.focus({ preventScroll: true })
    }
    if (reduced) dragX.set(0)
    else animate(dragX, 0, { type: 'spring', stiffness: 300, damping: 32 })
  }

  return (
    <section
      id="certificates"
      className="section certificates-section"
      aria-labelledby="certificates-heading"
    >
      <div className="container">
        <div className="section-label">
          <span className="section-number">05</span>
          <span>CERTIFICATES & ACHIEVEMENTS</span>
          <span className="label-line" />
        </div>
        <div className="certificate-heading">
          <h2 className="section-heading" id="certificates-heading">
            Certifications
          </h2>
          <div className="certificate-intro">
            <p>
              A growing collection of technical credentials,
              <br />
              academic milestones, and personal achievements.
            </p>
            <span className="certificate-tally">
              <span>{count(certifications.length)}</span> DOCUMENTS <i />{' '}
              {count(certifications.filter((c) => c.badgeUrl).length)} DIGITAL BADGES
            </span>
          </div>
        </div>
        <div className="certificate-toolbar">
          <div className="certificate-filters" role="group" aria-label="Filter certificates">
            {(['All', 'Technology', 'Academic', 'Achievements'] as const).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilter(category)
                  setActiveIndex(0)
                  dragX.set(0)
                }}
                aria-pressed={filter === category}
                className={filter === category ? 'selected' : ''}
              >
                {category === 'All' ? 'All certificates' : category}
                <span>
                  {count(
                    category === 'All'
                      ? certifications.length
                      : certifications.filter((c) => c.category === category).length,
                  )}
                </span>
                {filter === category && (
                  <motion.span className="filter-underline" layoutId="certificate-filter" />
                )}
              </button>
            ))}
          </div>
          <span className="eyebrow certificate-hint">
            <Maximize2 size={12} /> OPEN TO TAKE A CLOSER LOOK
          </span>
        </div>
        <motion.div
          ref={stage}
          className="certificate-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Certificate gallery"
          aria-describedby="certificate-carousel-help"
          tabIndex={0}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduced ? 0 : 0.6, ease }}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={(event) => pointerEnd(event)}
          onPointerCancel={(event) => pointerEnd(event, true)}
          onClickCapture={(event) => {
            if (!suppressClick.current) return
            event.preventDefault()
            event.stopPropagation()
            suppressClick.current = false
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              if (event.key === 'Home') setActiveIndex(0)
              else if (event.key === 'End') setActiveIndex(visible.length - 1)
              else move(event.key === 'ArrowRight' ? 1 : -1)
            }
          }}
        >
          <motion.div className="certificate-track" style={{ x: dragX }}>
            {visible.map((certificate, cardIndex) => {
              let offset = (cardIndex - index + visible.length) % visible.length
              if (offset > visible.length / 2) offset -= visible.length
              const isActive = offset === 0
              const nearby = Math.abs(offset) <= 1
              return (
                <motion.div
                  key={certificate.id}
                  className="certificate-slot"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${cardIndex + 1} of ${visible.length}: ${certificate.title}`}
                  aria-hidden={!nearby}
                  inert={!nearby}
                  data-position={offset}
                  style={{
                    zIndex: isActive ? 3 : nearby ? 2 : 0,
                    visibility: nearby ? 'visible' : 'hidden',
                  }}
                  initial={false}
                  animate={{
                    x: offset * shift,
                    y: isActive ? 0 : 18,
                    z: reduced || isActive ? 0 : -110,
                    rotateY: reduced ? 0 : Math.sign(offset) * -23,
                    scale: isActive ? 1 : 0.88,
                    opacity: nearby ? (isActive ? 1 : 0.64) : 0,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 240, damping: 29, mass: 0.9 }
                  }
                >
                  <CertificateCard
                    certificate={certificate}
                    active={isActive}
                    onActivate={() => select(cardIndex)}
                    onOpen={setSelected}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
        <div
          className="certificate-carousel-controls"
          role="group"
          aria-label="Browse certificates"
        >
          <button
            className="icon-button"
            aria-label="Previous certificate"
            disabled={visible.length < 2}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <div className="certificate-progress">
            <span aria-hidden="true">
              {count(index + 1)} <span>/ {count(visible.length)}</span>
            </span>
            <span className="certificate-progress-line" aria-hidden="true">
              <motion.i
                animate={{ scaleX: (index + 1) / visible.length }}
                transition={{ duration: reduced ? 0 : 0.3 }}
              />
            </span>
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {index + 1} of {visible.length}: {active.title}
            </span>
          </div>
          <button
            className="icon-button"
            aria-label="Next certificate"
            disabled={visible.length < 2}
            onClick={() => move(1)}
          >
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
        <p className="certificate-carousel-help" id="certificate-carousel-help">
          Drag or swipe to explore · Use arrow keys when the gallery is focused
        </p>
        <p className="certificate-archive-note">
          <FileText size={13} /> Original documents available in each preview. Cisco credentials
          also link to their Credly badges.
        </p>
      </div>
      <AnimatePresence>
        {selected && <CertificateDialog key={selected.id} certificate={selected} onClose={close} />}
      </AnimatePresence>
    </section>
  )
}
