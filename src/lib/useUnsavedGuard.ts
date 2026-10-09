/**
 * Warn before the tab closes while a form holds unsent input (brief §9).
 * In-app navigation stays untouched — the Back button is part of the flow.
 */
import { useEffect } from 'react'

/** @param active - True while there is input the user has not sent yet. */
export function useUnsavedGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}
