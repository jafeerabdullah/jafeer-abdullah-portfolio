import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import './IntroVideoModal.css'

interface IntroVideoModalProps {
  src: string
  onClose: () => void
  onExplore: () => void
}

const formatTime = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

export function IntroVideoModal({ src, onClose, onExplore }: IntroVideoModalProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const mounted = useRef(false)
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [error, setError] = useState('')

  useLayoutEffect(() => {
    mounted.current = true
    const media = video.current!
    const shell = document.querySelector<HTMLElement>('.app-shell')
    const previousFocus = document.activeElement as HTMLElement | null
    const previousInert = shell?.inert ?? false
    const previousOverflow = document.body.style.overflow
    const previousGutter = document.documentElement.style.scrollbarGutter
    const position = { top: scrollY, left: scrollX }
    // Keep the existing layout width while background scrolling is locked.
    document.documentElement.style.scrollbarGutter = 'stable'
    document.body.style.overflow = 'hidden'
    if (shell) shell.inert = true
    if (media.getAttribute('src') !== src) media.setAttribute('src', src)
    media.volume = 0.8
    // Playback is requested only by the explicit Play or Replay buttons.
    const focusFrame = requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }),
    )
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        media.pause()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
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
      mounted.current = false
      cancelAnimationFrame(focusFrame)
      media.pause()
      media.removeAttribute('src')
      media.load()
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = previousOverflow
      document.documentElement.style.scrollbarGutter = previousGutter
      if (shell) shell.inert = previousInert
      window.scrollTo({ ...position, behavior: 'instant' })
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [onClose, src])

  async function play(replay = false) {
    const media = video.current
    if (!media) return
    setError('')
    if (replay || media.ended) {
      media.currentTime = 0
      setEnded(false)
    }
    try {
      await media.play()
      if (!mounted.current) media.pause()
    } catch (reason) {
      if (mounted.current && !(reason instanceof DOMException && reason.name === 'AbortError')) {
        setError('Playback could not start. Please try Play again or open the video below.')
      }
    }
  }
  function togglePlayback() {
    if (video.current?.paused) void play()
    else video.current?.pause()
  }
  function changeVolume(value: number) {
    const media = video.current
    if (!media) return
    media.volume = value
    media.muted = value === 0
    setVolume(value)
    setMuted(media.muted)
  }
  function toggleMute() {
    const media = video.current
    if (!media) return
    if (media.muted || media.volume === 0) {
      if (media.volume === 0) media.volume = 0.8
      media.muted = false
    } else media.muted = true
    setVolume(media.volume)
    setMuted(media.muted)
  }

  return createPortal(
    <motion.div
      className="intro-video-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.24 }}
    >
      <div
        className="intro-video-backdrop"
        onClick={() => {
          video.current?.pause()
          onClose()
        }}
        aria-hidden="true"
      />
      <motion.div
        ref={dialog}
        id="intro-video-dialog"
        className="intro-video-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-video-title"
        aria-describedby="intro-video-description"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.985, y: reduced ? 0 : 6 }}
        transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="intro-video-header">
          <div>
            <p className="intro-video-eyebrow">A PERSONAL INTRODUCTION</p>
            <h2 id="intro-video-title">Meet Jafeer Abdullah.</h2>
          </div>
          <button
            type="button"
            className="intro-video-icon"
            aria-label="Close introduction video"
            onClick={() => {
              video.current?.pause()
              onClose()
            }}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        <div className="intro-video-screen">
          <video
            ref={video}
            src={src}
            playsInline
            preload="metadata"
            poster="/images/jafeer-studio-portrait.webp"
            aria-label="Jafeer Abdullah's introduction video"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onPlay={() => {
              setPlaying(true)
              setEnded(false)
            }}
            onPause={() => setPlaying(false)}
            onPlaying={() => setBuffering(false)}
            onWaiting={() => setBuffering(true)}
            onCanPlay={() => setBuffering(false)}
            onVolumeChange={(event) => {
              setVolume(event.currentTarget.volume)
              setMuted(event.currentTarget.muted)
            }}
            onEnded={() => {
              setEnded(true)
              setPlaying(false)
              setBuffering(false)
            }}
            onError={() =>
              setError(
                'The introduction could not be loaded. You can open the video directly below.',
              )
            }
          />
          {!playing && !ended && !error && (
            <button
              type="button"
              className="intro-video-start"
              aria-label="Play introduction video"
              onClick={() => void play()}
            >
              <Play size={24} fill="currentColor" aria-hidden="true" />
              <span>Play introduction</span>
            </button>
          )}
          {buffering && playing && (
            <span className="intro-video-buffering" role="status">
              Loading introduction…
            </span>
          )}
          {ended && (
            <div className="intro-video-ended">
              <p role="status">Thanks for watching.</p>
              <button type="button" className="intro-video-explore" onClick={onExplore}>
                Explore My Work <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <div className="intro-video-controls">
          <div className="intro-video-timeline">
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={Math.min(time, duration || 1)}
              disabled={!duration}
              aria-label="Video position"
              aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
              onChange={(event) => {
                if (video.current) video.current.currentTime = Number(event.currentTarget.value)
                setTime(Number(event.currentTarget.value))
                setEnded(false)
              }}
            />
            <span>
              {formatTime(time)} / {formatTime(duration)}
            </span>
          </div>
          <div className="intro-video-toolbar">
            <button
              type="button"
              className="intro-video-text-control"
              aria-label={playing ? 'Pause introduction' : 'Play introduction'}
              onClick={togglePlayback}
            >
              {playing ? (
                <Pause size={17} aria-hidden="true" />
              ) : (
                <Play size={17} aria-hidden="true" />
              )}
              <span>{playing ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              className="intro-video-text-control"
              aria-label="Replay introduction"
              disabled={!duration}
              onClick={() => void play(true)}
            >
              <RotateCcw size={17} aria-hidden="true" />
              <span>Replay</span>
            </button>
            <div className="intro-video-volume">
              <button
                type="button"
                className="intro-video-icon"
                aria-label={muted || volume === 0 ? 'Unmute introduction' : 'Mute introduction'}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={19} aria-hidden="true" />
                ) : (
                  <Volume2 size={19} aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                aria-label="Video volume"
                aria-valuetext={muted ? 'Muted' : `${Math.round(volume * 100)} percent`}
                onChange={(event) => changeVolume(Number(event.currentTarget.value))}
              />
            </div>
          </div>
          <p id="intro-video-description" className="intro-video-description">
            A short introduction, in my own words. Press Play to begin with sound.
          </p>
          {error && (
            <p className="intro-video-error" role="alert">
              {error}{' '}
              <a href={src} target="_blank" rel="noreferrer">
                Open introduction video <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
