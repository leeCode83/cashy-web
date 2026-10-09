/**
 * Scroll-entry reveal — the one taste-skill motion addition scoped to the
 * marketing page (brief: delight is reserved for the Payday Rail; this is
 * the Landing-only exception for "entry into view"). IntersectionObserver
 * based, unobserves after the first reveal, and short-circuits to visible
 * immediately when the user prefers reduced motion. Visibility is applied
 * as a class directly on the node from inside the effect (not React state),
 * so render never reads a ref value.
 */
import { useEffect, useRef } from 'react'

/** @returns a ref to attach to the element; add the base `.reveal` class in JSX. */
export function useScrollReveal<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('reveal--visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('reveal--visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
