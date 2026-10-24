import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './HeroTypewriter.css'

const roles = [
  { label: 'Full Stack Developer', emoji: '🚀' },
  { label: 'UI/UX Designer', emoji: '🎨' },
  { label: 'Digital Creator', emoji: '📈' },
  { label: 'Data Analyst', emoji: '📊' },
  { label: 'Graphic Designer', emoji: '🖌️' },
] as const
const roleSummary = roles.map((role) => role.label).join(', ')
const tagline = 'Thoughtful by design.'

interface TypewriterFrame {
  index: number
  length: number
  phase: 'holding' | 'deleting' | 'waiting' | 'typing'
}

/** Only this small span updates per character; the hero and tagline stay independent. */
function ProfessionalRole({ active, reduced }: { active: boolean; reduced: boolean }) {
  // The server and first client render both contain the complete primary role.
  const [frame, setFrame] = useState<TypewriterFrame>({
    index: 0,
    length: roles[0].label.length,
    phase: 'holding',
  })
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    const sync = () => setTabVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (!active || reduced || !tabVisible) return
    const delay =
      frame.phase === 'holding'
        ? 2000
        : frame.phase === 'waiting'
          ? 260
          : frame.phase === 'deleting'
            ? 30 + (frame.length % 3) * 4
            : 70 + (frame.length % 4) * 9
    const timer = window.setTimeout(() => {
      setFrame((current) => {
        if (current.phase === 'holding') return { ...current, phase: 'deleting' }
        if (current.phase === 'waiting') {
          return { index: (current.index + 1) % roles.length, length: 0, phase: 'typing' }
        }
        if (current.phase === 'deleting') {
          const length = Math.max(0, current.length - 1)
          return { ...current, length, phase: length === 0 ? 'waiting' : 'deleting' }
        }
        const length = Math.min(roles[current.index].label.length, current.length + 1)
        return {
          ...current,
          length,
          phase: length === roles[current.index].label.length ? 'holding' : 'typing',
        }
      })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [active, reduced, tabVisible, frame])

  const role = roles[reduced ? 0 : frame.index]
  return (
    <span
      className="hero-headline-line hero-typewriter"
      data-phase={reduced ? 'static' : frame.phase}
      data-running={active && !reduced && tabVisible ? 'true' : 'false'}
      title={roleSummary}
      aria-hidden="true"
    >
      <span className="hero-role-emoji" key={role.label}>
        {role.emoji}
      </span>
      <span className="hero-role-text">
        {reduced ? role.label : role.label.slice(0, frame.length)}
      </span>
      <span className="hero-role-cursor" />
    </span>
  )
}

export function HeroHeadline() {
  const heading = useRef<HTMLHeadingElement>(null)
  const visible = useInView(heading)
  const reduced = useReducedMotion()

  return (
    <motion.h2
      ref={heading}
      className="hero-headline"
      aria-label={`${roleSummary}. ${tagline}`}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.3, staggerChildren: 0.09 } },
      }}
    >
      <ProfessionalRole active={visible} reduced={Boolean(reduced)} />
      <span
        className="hero-headline-line hero-headline-accent"
        data-animate={visible && !reduced ? 'true' : undefined}
        aria-hidden="true"
      >
        {tagline.split(' ').map((word, wordIndex) => (
          <Fragment key={word}>
            {wordIndex > 0 && ' '}
            <span className="hero-headline-word-window">
              <motion.span
                className="hero-headline-word"
                variants={{
                  hidden: { opacity: 0, y: '110%', filter: 'blur(5px)' },
                  visible: {
                    opacity: 1,
                    y: '0%',
                    filter: 'blur(0px)',
                    transition: { duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </span>
    </motion.h2>
  )
}
