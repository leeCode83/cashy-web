/**
 * Landing (brief §6.1) — in five seconds: cash out today, one flat fee,
 * repaid automatically on the 21st. Hero with an interactive rail demo on
 * the right (drag or arrow keys), a one-line how-it-works, the payday-loan
 * comparison, and one sentence on why it's onchain.
 */
import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Link } from 'react-router'
import { formatIDRX } from '../lib/money.ts'
import { useScrollReveal } from '../lib/useScrollReveal.ts'

/** Hero mock figures (brief §5). */
const DEMO = {
  principal: 500_000_000,
  fee: 12_500_000,
  repay: 512_500_000,
} as const

/** Scrub rail — the marketing demo of the Payday Rail. Draggable, keyboard operable. */
function LandingRail() {
  const [fraction, setFraction] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const scrub = (clientX: number): void => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    setFraction(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)))
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId)
    scrub(event.clientX)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.buttons > 0) scrub(event.clientX)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight') setFraction((f) => Math.min(1, f + 0.1))
    if (event.key === 'ArrowLeft') setFraction((f) => Math.max(0, f - 0.1))
  }

  const atPayout = fraction > 0.5
  const caption = atPayout
    ? `The 21st — ${formatIDRX(DEMO.repay)} is collected automatically. Nothing to remember.`
    : `Today — you get ${formatIDRX(DEMO.principal)}. One flat fee of ${formatIDRX(DEMO.fee)}.`

  return (
    <div className="landrail">
      <div
        className="rail"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Payday rail demo — drag from today to the 21st"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
        aria-valuetext={caption}
        style={{ '--pct': `${fraction * 100}%`, '--pct-n': fraction * 100 } as React.CSSProperties}
      >
        <div className="rail__line" aria-hidden />
        <div className="rail__marker" aria-hidden />
        <div className="rail__stop" aria-hidden>
          <span className="rail__dot" />
          <span className="rail__label">Today</span>
        </div>
        <div className="rail__stop" aria-hidden>
          <span className="rail__dot" />
          <span className="rail__label">The 21st</span>
        </div>
      </div>
      <p className="landrail__caption small" role="status">
        {caption}
      </p>
    </div>
  )
}

/** The four steps, one line each — not three equal cards. */
const STEPS = [
  { name: 'Verify', text: 'Seal your AdSense session — balance only, never your password.' },
  { name: 'Choose', text: 'Pick an amount up to 70% of your final balance. Fee shown up front.' },
  { name: 'Review', text: 'Link your payout account and confirm the Oct 21 repayment.' },
  { name: 'Done', text: 'Money lands today. Repayment collects itself on the 21st.' },
]

export default function Landing() {
  const demoRef = useScrollReveal<HTMLDivElement>()
  const howRef = useScrollReveal<HTMLElement>()
  const compareRef = useScrollReveal<HTMLElement>()
  const onchainRef = useScrollReveal<HTMLElement>()

  return (
    <div className="landing">
      <section className="container hero">
        <div className="hero__copy stack">
          <h1 className="hero__title">Get paid before payday.</h1>
          <p className="hero__sub">
            Cash out part of your final AdSense balance today. One flat fee, no interest, repaid automatically on the
            21st.
          </p>
          <div className="row">
            <Link className="btn btn--primary" to="/creator">
              Get Cash Early
            </Link>
            <Link className="btn btn--secondary" to="/lp">
              Earn From The Vault
            </Link>
          </div>
        </div>
        <div ref={demoRef} className="hero__demo card reveal">
          <LandingRail />
        </div>
      </section>

      <section ref={howRef} className="container landing__section reveal" id="how" aria-label="How it works">
        <h2 className="section-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li className="steps__item" key={step.name}>
              <span className="steps__number u-mono">{index + 1}</span>
              <span>
                <strong>{step.name}.</strong> <span className="muted">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section ref={compareRef} className="container landing__section reveal" aria-label="Why not a payday loan">
        <h2 className="section-title">Why not a payday loan</h2>
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Aspect</span>
              </th>
              <th scope="col">Payday loan</th>
              <th scope="col">Cashy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Cost</th>
              <td className="muted">0.3% per day — about 9% a month</td>
              <td>
                Flat <span className="u-mono">2.5%</span> once, shown before you commit
              </td>
            </tr>
            <tr>
              <th scope="row">Repayment</th>
              <td className="muted">Due on your next payday, roll-overs encouraged</td>
              <td>Automatic on the 21st, from the payout itself</td>
            </tr>
            <tr>
              <th scope="row">Your record</th>
              <td className="muted">Hard credit checks</td>
              <td>A clean onchain record of on-time repayments</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section ref={onchainRef} className="container landing__section reveal" aria-label="Why onchain">
        <h2 className="section-title">Why onchain</h2>
        <p className="muted">
          Advances, deposits and repayments settle onchain in IDRX, so every number you see can be verified by anyone.{' '}
          <a className="linklike" href="https://cashy.example/how" target="_blank" rel="noreferrer">
            See how it works
          </a>
          .
        </p>
      </section>

      <footer className="landing__footer">
        <div className="container row row--between">
          <span translate="no">Cashy</span>
          <span className="muted small">Demo — ETH Jakarta 2026</span>
        </div>
      </footer>
    </div>
  )
}
