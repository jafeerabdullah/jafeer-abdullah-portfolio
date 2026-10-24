import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const getSnapshot = () => window.matchMedia(query).matches
const getServerSnapshot = () => false
const subscribe = (notify: () => void) => {
  const preference = window.matchMedia(query)
  preference.addEventListener('change', notify)
  return () => preference.removeEventListener('change', notify)
}

/** Keep server and first hydration render identical, then follow live OS preferences. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
