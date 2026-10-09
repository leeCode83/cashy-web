/**
 * Payday Rail — the product's signature element (brief §4.4): a horizontal
 * line from "Today" to "The 21st" with an accent marker where the money is.
 * Rests with the marker at {@link markerAt}; `slideIn` plays the one-shot
 * right-to-left slide (Done screen). Transform/opacity only; with
 * prefers-reduced-motion the marker renders at rest immediately.
 */
import type { CSSProperties } from 'react'

/** One labeled dot on the rail. Keep labels short — the rail never scrolls. */
export interface RailStop {
  /** Primary label, e.g. `Today` or `Oct 21`. */
  label: string
  /** Secondary line under the label, e.g. an amount. Rendered in mono. */
  sub?: string
}

/**
 * @param props.stops - Two or three stops, left to right.
 * @param props.markerAt - Index of the stop the money marker rests on.
 * @param props.slideIn - Slide the marker in from the right edge once.
 */
export function PaydayRail({ stops, markerAt = 0, slideIn = false }: {
  stops: RailStop[]
  markerAt?: number
  slideIn?: boolean
}) {
  const count = stops.length - 1
  const pct = count > 0 ? (markerAt / count) * 100 : 0
  const style = { '--pct': `${pct}%`, '--pct-n': pct } as CSSProperties
  const description = stops.map((stop) => `${stop.label}${stop.sub ? ` ${stop.sub}` : ''}`).join(', ')

  return (
    <div className="rail" style={style} role="img" aria-label={`Payday rail: ${description}`}>
      <div className="rail__line" aria-hidden />
      <div className={`rail__marker${slideIn ? ' rail__marker--slide' : ''}`} aria-hidden />
      {stops.map((stop) => (
        <div className="rail__stop" key={stop.label}>
          <span className="rail__dot" aria-hidden />
          <span className="rail__label">{stop.label}</span>
          {stop.sub && <span className="rail__sub u-mono">{stop.sub}</span>}
        </div>
      ))}
    </div>
  )
}
