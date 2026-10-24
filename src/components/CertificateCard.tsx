import { motion } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ArrowUpRight, Download, FileText, Maximize2 } from 'lucide-react'
import type { Certificate } from '../data/portfolio'

export function CertificateCard({
  certificate,
  onOpen,
  active,
  onActivate,
}: {
  certificate: Certificate
  onOpen: (certificate: Certificate) => void
  active: boolean
  onActivate: () => void
}) {
  const reduced = useReducedMotion()
  const dateLabel = certificate.date
    .split(' · ')[0]
    .replace(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
      (month) => month.slice(0, 3),
    )

  return (
    <div className="certificate-card-shell">
      <motion.article
        className="certificate-card"
        data-active={active}
        aria-hidden={!active}
        inert={!active}
        aria-labelledby={`certificate-card-title-${certificate.id}`}
        layoutId={`certificate-${certificate.id}`}
        transition={{
          layout: { duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <button
          className="certificate-preview"
          aria-label={`Preview ${certificate.title} certificate`}
          onClick={() => onOpen(certificate)}
        >
          <span className="certificate-preview-top">
            <span className="certificate-filetype">
              <FileText size={12} aria-hidden="true" /> {certificate.format}
            </span>
            <span className="certificate-expand">
              <Maximize2 size={14} aria-hidden="true" /> Expand preview
            </span>
          </span>
          <span className="certificate-sheet">
            <img
              src={certificate.image}
              alt={`${certificate.title} certificate`}
              width={certificate.width}
              height={certificate.height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </span>
        </button>
        <div className="certificate-meta eyebrow">
          <span>{certificate.category}</span>
          {!certificate.date.startsWith('Undated') && (
            <span className="certificate-date" title={certificate.date}>
              {dateLabel}
            </span>
          )}
        </div>
        <h3 className="certificate-title" id={`certificate-card-title-${certificate.id}`}>
          {certificate.title}
        </h3>
        <p className="certificate-issuer">{certificate.issuer}</p>
        <div className="certificate-card-actions">
          <button className="certificate-view" onClick={() => onOpen(certificate)}>
            View certificate <ArrowUpRight size={14} aria-hidden="true" />
          </button>
          {certificate.badgeUrl ? (
            <a
              className="certificate-badge-link"
              href={certificate.badgeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Credly badge <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : (
            <a
              className="certificate-download"
              href={certificate.document}
              download
              aria-label={`Download ${certificate.title} original`}
            >
              Download <Download size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </motion.article>
      {!active && (
        <button
          className="certificate-side-select"
          onClick={onActivate}
          aria-label={`Show ${certificate.title}`}
        >
          <span className="sr-only">Select this certificate</span>
        </button>
      )}
    </div>
  )
}
