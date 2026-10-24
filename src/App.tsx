import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Braces,
  Check,
  Code2,
  Copy,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  MapPin,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'
import { profile, projects } from './data/portfolio'
import type { Project, ProjectCategory } from './data/portfolio'
import { ProjectsStack } from './components/ProjectsStack'
import { ProjectDialog } from './components/ProjectDialog'
import { ContactForm } from './components/ContactForm'
import { HeroHeadline } from './components/HeroHeadline'
import { AboutPortrait, PortraitMorph } from './components/PortraitMorph'
import { PageMorphTransitions } from './components/PageMorphTransitions'
import { Certificates } from './components/Certificates'
import { IntroVideoExperience } from './components/IntroVideoExperience'
import { SkillsCarousel } from './components/SkillsCarousel'
import './components/NavigationDepth.css'
import './components/Projects.css'

const MetallicScene = lazy(() => import('./components/MetallicScene'))
const navigation = ['Home', 'About', 'Skills', 'Projects', 'Education', 'Certificates', 'Contact']
const ease = [0.22, 1, 0.36, 1] as const

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-number">{number}</span>
      <span>{children}</span>
      <span className="label-line" />
    </div>
  )
}

function Navigation() {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0),
        )
        const best = [...ratios].sort((a, b) => b[1] - a[1])[0]
        if (best?.[1])
          setActive((current) => {
            const previous = ratios.get(current) || 0
            return previous === 0 || best[1] > previous + 0.02 ? best[0] : current
          })
      },
      { rootMargin: '-18% 0px -50% 0px', threshold: [0, 0.1, 0.3] },
    )
    navigation.forEach((n) => {
      const el = document.getElementById(n.toLowerCase())
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    function resize() {
      if (window.innerWidth > 1000) setMenuOpen(false)
    }
    window.addEventListener('keydown', escape)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('keydown', escape)
      window.removeEventListener('resize', resize)
    }
  }, [menuOpen])
  function goTo(id: string) {
    setActive(id)
    setMenuOpen(false)
  }
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <a
          className="brand"
          href="#home"
          onClick={() => goTo('home')}
          aria-label="Jafeer Abdullah, home"
        >
          Abu<span>.</span>
          <span className="brand-name">
            JAFEER
            <br />
            ABDULLAH
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((name) => (
            <a
              key={name}
              href={`#${name.toLowerCase()}`}
              className={active === name.toLowerCase() ? 'active' : ''}
              aria-current={active === name.toLowerCase() ? 'location' : undefined}
              onClick={() => goTo(name.toLowerCase())}
            >
              {name}
            </a>
          ))}
        </nav>
        <a className="nav-resume" href={profile.resume} download>
          Résumé <Download size={14} />
        </a>
        <button
          ref={toggleRef}
          className="mobile-toggle icon-button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {navigation.map((name, i) => (
              <a
                key={name}
                href={`#${name.toLowerCase()}`}
                onClick={() => goTo(name.toLowerCase())}
                aria-current={active === name.toLowerCase() ? 'location' : undefined}
              >
                <span>0{i + 1}</span>
                {name}
                <ArrowUpRight size={17} />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function PortraitClip() {
  return (
    <svg width="0" height="0" className="clip-definitions" aria-hidden="true">
      <defs>
        <clipPath id="portrait-silhouette" clipPathUnits="objectBoundingBox">
          <path
            transform="scale(0.0006906077 0.0009208103)"
            d="M238 1086 C250 1035 279 920 303 805 C317 744 327 690 352 653 C390 637 453 629 502 611 C554 592 596 571 624 535 L635 513 L630 479 C615 454 600 431 595 405 L593 385 C592 366 600 355 609 354 L602 334 L596 313 L593 295 L598 270 L603 247 L613 220 L622 207 L631 193 L650 178 L668 157 L685 158 L705 143 L723 143 L744 129 L759 138 L782 137 L804 148 L824 151 L841 169 L862 183 L875 206 L883 231 L888 254 L886 280 L881 309 L873 336 L865 357 C870 377 861 408 849 433 L838 444 C835 473 823 502 807 521 L808 553 C833 581 874 610 917 627 C966 641 1023 651 1059 674 C1079 704 1098 771 1114 817 C1139 900 1172 1005 1203 1086 Z"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 65])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110])
  return (
    <section id="home" className="hero" ref={ref} aria-label="Introduction">
      <div className="hero-topline">
        <span className="eyebrow">DEVELOPER. DESIGN THINKER. BUILDER.</span>
        <span className="edition eyebrow">PORTFOLIO — VOL. 01 / 2026</span>
      </div>
      <motion.h1
        className="hero-name"
        style={{ y: titleY }}
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease }}
      >
        JAFEER ABDULLAH<span className="sr-only"> — Full Stack Software Developer</span>
      </motion.h1>
      <div className="hero-portrait-frame">
        <motion.img
          style={{ y: portraitY }}
          className="hero-portrait"
          src="/images/jafeer-studio-portrait.webp"
          alt="Jafeer Abdullah wearing a suit"
          width="1448"
          height="1086"
          fetchPriority="high"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        />
      </div>
      <IntroVideoExperience />
      <div className="hero-side-note eyebrow">
        BASED IN SRI LANKA <span>KATTANKUDY / BATTICALOA</span>
      </div>
      <div className="hero-star" aria-hidden="true">
        ✳
      </div>
      <div className="hero-bottom">
        <motion.div
          className="hero-intro"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <HeroHeadline />
          <p>
            I turn ideas into practical web and mobile experiences — with clean code and an eye for
            detail.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#projects">
              View projects
              <ArrowUpRight size={17} />
            </a>
            <a className="hero-download" href={profile.resume} download>
              <Download size={16} />
              <span>Download résumé</span>
            </a>
          </div>
        </motion.div>
        <a className="scroll-cue" href="#about" aria-label="Scroll to about section">
          <ArrowDown size={20} />
          <span className="eyebrow">SCROLL TO EXPLORE</span>
        </a>
        <div className="hero-right">
          <span className="eyebrow">WEB / MOBILE / SOFTWARE</span>
          <p>
            Built with curiosity.
            <br />
            Made to be useful.
          </p>
          <div className="social-links">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <Github size={17} />
              <span>GitHub</span>
              <ArrowUpRight size={12} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={17} />
              <span>LinkedIn</span>
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
      <div className="hero-baseline">
        <span>FULL STACK SOFTWARE DEVELOPER</span>
        <div>
          PHP / LARAVEL <i /> FLUTTER / DART <i /> JAVA / TYPESCRIPT
        </div>
        <span className="baseline-end">
          OPEN TO WHAT’S NEXT <ArrowDownRight size={12} />
        </span>
      </div>
    </section>
  )
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Decorative scene safely falls back without blocking content. */
  }
  render() {
    return this.state.failed ? <div className="sculpture-fallback">✳</div> : this.props.children
  }
}

function SculptureAccent() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '100px' })
  const reduced = useReducedMotion()
  const [capable, setCapable] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px) and (pointer: fine)')
    function check() {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2')
      setCapable(media.matches && !!gl && (navigator.hardwareConcurrency || 4) >= 4)
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    }
    check()
    media.addEventListener('change', check)
    return () => media.removeEventListener('change', check)
  }, [])
  return (
    <div ref={ref} className="sculpture" aria-hidden="true">
      {visible && capable && !reduced ? (
        <SceneBoundary>
          <Suspense fallback={<div className="sculpture-fallback">✳</div>}>
            <MetallicScene />
          </Suspense>
        </SceneBoundary>
      ) : (
        <div className="sculpture-fallback">✳</div>
      )}
    </div>
  )
}

function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <SectionLabel number="01">THE PERSON BEHIND THE CODE</SectionLabel>
        <div className="about-grid">
          <Reveal className="about-visual">
            <AboutPortrait />
            <div className="photo-signature">
              Jafeer Abdullah <ArrowUpRight size={22} />
            </div>
          </Reveal>
          <div className="about-copy">
            <Reveal>
              <h2 className="section-heading">
                Curiosity is where
                <br />
                it all <span className="serif-word">begins.</span>
              </h2>
              <p className="lead">
                I’m Jafeer, a software developer who enjoys making complicated things feel a little
                simpler.
              </p>
              <p>
                I’m reading for a Bachelor of Applied IT at SLTC / ICST University Park, with
                graduation expected in June 2027. My work spans full stack web applications, Flutter
                mobile apps, and Java systems built on data structures and algorithms.
              </p>
              <p>
                Along the way, I’ve led two university project teams, collaborated on a POS
                application, and completed a virtual full stack internship. I also bring an interest
                in data analysis and graphic design — because how something works and how it feels
                both matter.
              </p>
              <a className="text-link" href="#contact">
                Let’s make something useful
                <ArrowUpRight size={17} />
              </a>
            </Reveal>
            <Reveal className="about-facts">
              <div>
                <strong>{String(projects.length).padStart(2, '0')}</strong>
                <span>Projects in practice</span>
              </div>
              <div>
                <strong>02</strong>
                <span>University teams led</span>
              </div>
              <div>
                <strong>2027</strong>
                <span>Expected graduation</span>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal className="principles-line">
          <Sparkles size={17} />
          <p>A problem-solving mindset. A detail-focused eye. Always learning.</p>
          <span className="eyebrow">THAT’S THE APPROACH.</span>
        </Reveal>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="section skills-section">
      <div className="container">
        <SectionLabel number="02">THE TOOLKIT</SectionLabel>
        <div className="section-heading-row">
          <Reveal>
            <h2 className="section-heading">
              The tools behind
              <br />
              the <span className="serif-word">thinking.</span>
            </h2>
          </Reveal>
          <Reveal className="section-aside">
            <p>
              From a database query to the last interface detail.
              <br />A practical toolkit, built through real projects.
            </p>
          </Reveal>
        </div>
        <SkillsCarousel />
        <div className="skills-bottom">
          <span className="eyebrow">CODE WITH STRUCTURE. DESIGN WITH INTENT.</span>
          <Braces size={18} />
        </div>
      </div>
    </section>
  )
}

function Projects({ onOpen }: { onOpen: (project: Project) => void }) {
  const [filter, setFilter] = useState<'All' | ProjectCategory>('All')
  const visible = projects.filter((p) => filter === 'All' || p.category === filter)
  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        <SectionLabel number="03">SELECTED WORK</SectionLabel>
        <div className="section-heading-row">
          <Reveal>
            <h2 className="section-heading">
              Ideas, turned
              <br />
              into <span className="serif-word">something real.</span>
            </h2>
          </Reveal>
          <Reveal className="section-aside">
            <p>
              {projects.length} projects. Different challenges.
              <br />
              The same drive to build something useful.
            </p>
            <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
              All repositories
              <Github size={16} />
              <ArrowUpRight size={14} />
            </a>
          </Reveal>
        </div>
        <div className="project-toolbar">
          <div className="project-filters" role="group" aria-label="Filter projects">
            {(['All', 'Web', 'Mobile', 'Java'] as const).map((f) => (
              <button
                className={filter === f ? 'selected' : ''}
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f === 'All' ? 'All work' : f}
                <span>
                  {String(
                    f === 'All' ? projects.length : projects.filter((p) => p.category === f).length,
                  ).padStart(2, '0')}
                </span>
                {filter === f && (
                  <motion.span className="filter-underline" layoutId="filter-line" />
                )}
              </button>
            ))}
          </div>
          <span className="eyebrow project-hint">
            SELECT A PROJECT TO EXPLORE <ArrowDownRight size={14} />
          </span>
        </div>
        <ProjectsStack key={filter} projects={visible} onOpen={onOpen} />
        <p className="project-note">
          <Check size={13} /> Screenshots from the original repositories. Concept visuals are
          labeled.
        </p>
      </div>
    </section>
  )
}

function Education() {
  return (
    <section id="education" className="section education-section">
      <div className="container">
        <SectionLabel number="04">LEARNING & EXPERIENCE</SectionLabel>
        <div className="section-heading-row">
          <Reveal>
            <h2 className="section-heading">
              A foundation.
              <br />
              An ongoing <span className="serif-word">journey.</span>
            </h2>
          </Reveal>
          <div className="sculpture-wrap">
            <SculptureAccent />
            <span className="eyebrow">ALWAYS A WORK IN PROGRESS.</span>
          </div>
        </div>
        <div className="journey-grid">
          <div>
            <h3 className="column-label">
              <GraduationCap size={19} />
              Education<span>01 — 03</span>
            </h3>
            <div className="timeline">
              <Reveal className="timeline-entry">
                <div className="timeline-meta">
                  <span className="eyebrow">2023 — PRESENT</span>
                  <span className="current-tag">IN PROGRESS</span>
                </div>
                <h4>Bachelor of Applied IT</h4>
                <p>SLTC / ICST University Park</p>
                <span className="timeline-detail">Expected graduation — June 2027</span>
              </Reveal>
              <Reveal className="timeline-entry">
                <span className="eyebrow">2022 / 2023</span>
                <h4>G.C.E. Advanced Level</h4>
                <p>Physical Science stream</p>
                <span className="timeline-detail">Combined Mathematics · Physics · Chemistry</span>
              </Reveal>
              <Reveal className="timeline-entry">
                <span className="eyebrow">2019</span>
                <h4>G.C.E. Ordinary Level</h4>
                <p>6 A passes · 3 B passes</p>
                <span className="timeline-detail">
                  Including A passes in Mathematics, ICT, and English
                </span>
              </Reveal>
            </div>
          </div>
          <div className="experience-column">
            <h3 className="column-label">
              <Code2 size={18} />
              Practical experience<span>01</span>
            </h3>
            <Reveal className="experience-card">
              <div className="experience-top">
                <span className="eyebrow">OCTOBER 2026</span>
                <span className="subtle-badge">VIRTUAL INTERNSHIP</span>
              </div>
              <h4>
                Full Stack Web
                <br />
                Development Intern
              </h4>
              <p className="company-name">Codomax Digital Solutions</p>
              <p>
                Completed a one-month, task-based virtual internship, gaining practical exposure to
                full stack web development. Completed all assigned tasks and received a certificate
                of completion.
              </p>
              <span className="experience-check">
                <Check size={14} /> COMPLETED · CERTIFICATE RECEIVED
              </span>
            </Reveal>
            <a className="journey-certificates text-link" href="#certificates">
              Explore certificates & achievements <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <Reveal className="community-note">
          <span className="eyebrow">BEYOND THE SCREEN</span>
          <p>
            University project leadership, community clean-ups, blood donation drives, book fairs,
            and the “How to Handle Big Data?” workshop at ICST University Park.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setCopyError('')
    } catch {
      setCopyError('Select the email address to copy, or open it in your email app.')
    }
  }
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <SectionLabel number="06">LET’S CONNECT</SectionLabel>
        <div className="contact-grid">
          <Reveal className="contact-copy">
            <p className="availability">
              <span /> OPEN TO INTERNSHIP OPPORTUNITIES
            </p>
            <h2>
              Good things
              <br />
              start with
              <br />
              <span className="serif-word">a conversation.</span>
              <span className="contact-arrow" aria-hidden="true">
                ↗
              </span>
            </h2>
            <p>
              I’m looking for opportunities to learn, contribute, and build with a thoughtful team.
              Have something in mind? I’d love to hear about it.
            </p>
            <div className="contact-email">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <button
                type="button"
                className="copy-email icon-button"
                onClick={copyEmail}
                aria-label={copied ? 'Email copied' : 'Copy email address'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <span className="copy-status" role="status">
              {copyError || (copied ? 'Email copied to clipboard.' : '')}
            </span>
            <div className="contact-location">
              <MapPin size={15} />
              {profile.location}
            </div>
            <a className="contact-phone" href={`tel:${profile.phone.replaceAll(' ', '')}`}>
              {profile.phone}
            </a>
            <div className="contact-socials">
              <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRight size={15} />
              </a>
              <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
                <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>
          <Reveal className="contact-form-wrap" delay={0.08}>
            <div className="form-heading">
              <span className="eyebrow">SAY HELLO</span>
              <ArrowDownRight size={20} />
            </div>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [selected, setSelected] = useState<Project | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <PortraitClip />
        <PageMorphTransitions />
        <PortraitMorph />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="app-shell">
          <Navigation />
          <main id="main-content">
            <Hero />
            <About />
            <Skills />
            <Projects onOpen={setSelected} />
            <Education />
            <Certificates />
            <Contact />
          </main>
          <footer className="site-footer container">
            <a className="footer-brand" href="#home">
              Abu<span>.</span>
            </a>
            <p>
              © 2026 Jafeer Abdullah.<span>Built with curiosity. Crafted with care.</span>
            </p>
            <a className="back-to-top" href="#home">
              BACK TO TOP
              <ArrowUp size={15} />
            </a>
          </footer>
        </div>
        <AnimatePresence>
          {selected && <ProjectDialog key={selected.id} project={selected} onClose={close} />}
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  )
}
