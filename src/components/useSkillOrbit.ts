import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { animate, useMotionValue } from 'motion/react'

const cycleDuration = 72_000
const rampDuration = 2_000
const wrap = (value: number, count: number) => ((value % count) + count) % count
const smoothstep = (value: number) => value * value * (3 - 2 * value)

/** Integrated speed: a steady orbit with two-second, zero-velocity turnarounds. */
function distanceAt(elapsed: number) {
  const speed = 360 / (cycleDuration - rampDuration)
  const ramp = (time: number) => {
    const progress = time / rampDuration
    return speed * rampDuration * (progress ** 3 - progress ** 4 / 2)
  }
  if (elapsed < rampDuration) return ramp(elapsed)
  if (elapsed > cycleDuration - rampDuration) return 360 - ramp(cycleDuration - elapsed)
  return speed * (elapsed - rampDuration / 2)
}

export function useSkillOrbit({
  count,
  direction,
  enabled,
  reduced,
  pauseUntil,
  onInteract,
}: {
  count: number
  direction: RefObject<1 | -1>
  enabled: boolean
  reduced: boolean
  pauseUntil: number
  onInteract: () => void
}) {
  const rotation = useMotionValue(0)
  const [selected, setSelected] = useState(0)
  const selectedRef = useRef(0)
  const [cycleDirection, setCycleDirection] = useState(direction.current)
  const elapsed = useRef(0)
  const manual = useRef<ReturnType<typeof animate> | null>(null)
  const [settling, setSettling] = useState(false)
  const [cooling, setCooling] = useState(() => pauseUntil > performance.now())
  const spacing = 360 / count

  function updateSelected(index: number) {
    if (index === selectedRef.current) return
    selectedRef.current = index
    setSelected(index)
  }

  function select(index: number) {
    onInteract()
    manual.current?.stop()
    const next = wrap(index, count)
    const current = rotation.get()
    let delta = next - wrap(current / spacing, count)
    if (delta > count / 2) delta -= count
    if (delta < -count / 2) delta += count
    const target = current + delta * spacing
    updateSelected(next)
    if (reduced) {
      manual.current = null
      rotation.set(target)
      setSettling(false)
    } else {
      setSettling(true)
      manual.current = animate(rotation, target, {
        type: 'spring',
        stiffness: 150,
        damping: 25,
        mass: 0.9,
        onComplete: () => {
          manual.current = null
          setSettling(false)
        },
      })
    }
  }

  useEffect(() => {
    const remaining = pauseUntil - performance.now()
    setCooling(remaining > 0)
    if (remaining <= 0) return
    const timer = window.setTimeout(() => setCooling(false), remaining)
    return () => window.clearTimeout(timer)
  }, [pauseUntil])

  useEffect(() => {
    if (!reduced) return
    manual.current?.stop()
    manual.current = null
    setSettling(false)
    // Stop at the selected skill, including when the preference changes mid-orbit.
    const position = Math.round(rotation.get() / 360) * 360
    rotation.set(position + selectedRef.current * spacing)
  }, [reduced, rotation, spacing])

  const running = enabled && !reduced && !cooling && !settling && count > 1
  useEffect(() => {
    if (!running) return
    let frame = 0
    let previous: number | null = null
    let resumedFor = 0
    const tick = (now: number) => {
      const delta = previous === null ? 0 : Math.min(100, Math.max(0, now - previous))
      previous = now
      if (!manual.current) {
        resumedFor += delta
        // Preserve cycle progress through pauses; ease back into its existing direction.
        const advance = delta * smoothstep(Math.min(1, resumedFor / 1000))
        const next = Math.min(cycleDuration, elapsed.current + advance)
        const movement = direction.current * (distanceAt(next) - distanceAt(elapsed.current))
        const angle = rotation.get() + movement
        rotation.set(angle)
        elapsed.current = next
        const index =
          direction.current === 1
            ? Math.floor(angle / spacing + 0.000001)
            : Math.ceil(angle / spacing - 0.000001)
        updateSelected(wrap(index, count))
        if (next === cycleDuration) {
          elapsed.current = 0
          direction.current = direction.current === 1 ? -1 : 1
          setCycleDirection(direction.current)
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, count, direction, rotation, spacing])

  useEffect(() => () => manual.current?.stop(), [])

  return {
    rotation,
    selected,
    select,
    move: (amount: number) => select(selectedRef.current + amount),
    running,
    cycleDirection,
  }
}
