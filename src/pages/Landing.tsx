/**
 * Landing — the marketing surface, always dark (`data-theme` is set by the
 * AppShell). In five seconds: cash out today, one flat fee, repaid
 * automatically on the 21st. Hero card stack, proof strip + creator
 * marquee, how-it-works, an interactive rail showcase, the payday-loan
 * comparison, the vault pitch, creator quotes, final CTA.
 */
import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ClipboardText,
  Fingerprint,
  Lightning,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import { formatIDRX } from '../lib/money.ts'
import { useReveal } from '../lib/useReveal.ts'
import { Logo } from '../components/layout/Logo.tsx'

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

/** Sixteen-spike starburst — pure geometry, tinted with currentColor. */
function Starburst({ size, className }: { size: number; className?: string }) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 19
    const a = (Math.PI * i) / 16
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <polygon points={points} fill="currentColor" />
    </svg>
  )
}

/** The four steps, one card each. */
const STEPS = [
  {
    name: 'Verify',
    Icon: Fingerprint,
    text: 'Seal your AdSense session — balance only, never your password.',
  },
  {
    name: 'Choose',
    Icon: SlidersHorizontal,
    text: 'Pick an amount up to 70% of your final balance. Fee shown up front.',
  },
  {
    name: 'Review',
    Icon: ClipboardText,
    text: 'Link your payout account and confirm the Oct 21 repayment.',
  },
  {
    name: 'Done',
    Icon: Lightning,
    text: 'Money lands today. Repayment collects itself on the 21st.',
  },
] as const

/** Proof-strip stats. */
const STATS = [
  { value: '2.5%', label: 'flat, once — shown before you commit' },
  { value: '4 steps', label: 'verify to cash, about a minute' },
  { value: 'Oct 21', label: 'repayment collects itself' },
] as const

/** Creator-type marquee chips. */
const TYPES = ['VTuber', 'Podcaster', 'Illustrator', 'Educator', 'Streamer', 'Musician', 'Writer', 'Reviewer'] as const

/** Creator quotes — believable names, no stock-photo faces. */
const QUOTES = [
  {
    initial: 'R',
    name: 'Rani',
    meta: '412K subscribers · Bandung',
    quote: 'The fee showed up before I tapped anything. 2.5%, done — no daily interest eating my payout.',
  },
  {
    initial: 'B',
    name: 'Bagas',
    meta: '128K subscribers · Surabaya',
    quote: 'Brand deal fell through two weeks before payday. Cashy covered the gap and collected on the 21st like it said.',
  },
  {
    initial: 'S',
    name: 'Sari',
    meta: '87K subscribers · Jakarta',
    quote: "I've turned down payday loans twice. This one shows the cost up front and then leaves me alone.",
  },
] as const

/** Vault tiers shown on the LP pitch (mock figures, brief §5). */
const TIERS = [
  { name: 'Senior', yieldPct: '9.0%', risk: 'Lowest risk', fill: 60 },
  { name: 'Junior', yieldPct: '18.0%', risk: 'Highest risk', fill: 92 },
  { name: 'Reserve', yieldPct: '4.0%', risk: 'Low risk', fill: 38 },
] as const

export default function Landing() {
  const root = useReveal<HTMLDivElement>()

  return (
    <div className="landing" ref={root}>
      {/* Hero — copy left, floating balance cards right. */}
      <section className="container hero">
        <div className="hero__copy stack">
          <p className="eyebrow reveal">For creators</p>
          <h1 className="hero__title reveal" style={{ '--reveal-delay': '60ms' } as React.CSSProperties}>
            Get paid before payday.
          </h1>
          <p className="hero__sub reveal" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            Cash out up to 70% of your final AdSense balance today. One flat 2.5% fee, no interest — repaid
            automatically on the 21st.
          </p>
          <div className="row reveal" style={{ '--reveal-delay': '180ms' } as React.CSSProperties}>
            <Link className="btn btn--primary" to="/creator">
              Get Cash Early
            </Link>
            <Link className="btn btn--secondary" to="/lp">
              Earn From The Vault
            </Link>
          </div>
          <p className="hero__note small muted reveal" style={{ '--reveal-delay': '240ms' } as React.CSSProperties}>
            Balance-only verification. Your password never leaves Google.
          </p>
        </div>

        <div className="hero__visual reveal" style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
          <div className="hero__glow" aria-hidden />
          <Starburst size={104} className="hero__star hero__star--lg" />
          <Starburst size={56} className="hero__star hero__star--sm" />
          <div className="card hero__card hero__card--main">
            <p className="row row--between">
              <span className="small muted">Final balance</span>
              <span className="chip tone--success">
                <Lightning size={14} aria-hidden /> Payable on the 21st
              </span>
            </p>
            <p className="hero__amount u-mono">8,400,000.00 IDRX</p>
          </div>
          <div className="card hero__card hero__card--sub">
            <p className="small muted">You cash out today</p>
            <p className="u-mono hero__amount--sm">
              5,000,000.00 <span className="muted">IDRX</span>
            </p>
            <p className="small muted">Fee 125,000.00 · flat 2.5%</p>
          </div>
        </div>
      </section>

      {/* Proof strip — three stats plus a creator-type marquee. */}
      <section className="proof" aria-label="Why Cashy">
        <div className="container proof__stats">
          {STATS.map((stat) => (
            <div className="proof__stat reveal" key={stat.value}>
              <span className="proof__value">{stat.value}</span>
              <span className="small muted">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="marquee" aria-hidden>
          <div className="marquee__track">
            {[...TYPES, ...TYPES].map((type, i) => (
              <span className="marquee__chip" key={`${type}-${i}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — four cards, staggered reveal. */}
      <section className="container landing__section" id="how" aria-label="How it works">
        <h2 className="landing__title reveal">How it works</h2>
        <div className="how-grid">
          {STEPS.map((step, index) => (
            <article
              className="how-card reveal"
              style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}
              key={step.name}
            >
              <span className="how-card__num u-mono">{String(index + 1).padStart(2, '0')}</span>
              <step.Icon size={26} aria-hidden />
              <h3 className="how-card__name">{step.name}</h3>
              <p className="small muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Rail showcase — the product's signature element, interactive. */}
      <section className="container landing__section" id="rail" aria-label="The payday rail">
        <div className="showcase reveal">
          <p className="eyebrow">The payday rail</p>
          <h2 className="landing__title">One rail. No calendar math.</h2>
          <div className="showcase__card card">
            <LandingRail />
          </div>
          <p className="small muted showcase__hint">
            Drag the marker — what you get today, what gets collected on the 21st.
          </p>
        </div>
      </section>

      {/* Why not a payday loan — comparison, Cashy column tinted. */}
      <section className="container landing__section" aria-label="Why not a payday loan">
        <h2 className="landing__title reveal">Why not a payday loan</h2>
        <div className="compare-card reveal">
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
        </div>
      </section>

      {/* Vault pitch — tier cards left, caption right. */}
      <section className="container landing__section" aria-label="Earn from the vault">
        <div className="vpitch">
          <div className="vtiers">
            {TIERS.map((tier, index) => (
              <article
                className="vtier reveal"
                style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}
                key={tier.name}
              >
                <p className="small muted">{tier.name}</p>
                <p className="vtier__yield u-mono">{tier.yieldPct}</p>
                <p className="small">{tier.risk}</p>
                <div className="vtier__bar" aria-hidden>
                  <i style={{ width: `${tier.fill}%` }} />
                </div>
                <p className="small muted">Est. yield, capacity shown in the vault</p>
              </article>
            ))}
          </div>
          <div className="stack">
            <p className="eyebrow reveal">For LPs</p>
            <h2 className="landing__title reveal">Earn from the vault</h2>
            <p className="muted reveal">
              Advances are funded by a vault of lenders in three tranches. Senior first in, last out. Junior earns the
              most and takes losses first — the app tells you before you commit.
            </p>
            <div className="reveal">
              <Link className="btn btn--secondary" to="/lp">
                Open The Vault <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Creator quotes — asymmetric offsets, initial avatars. */}
      <section className="container landing__section" aria-label="Creators on Cashy">
        <h2 className="landing__title reveal">Paid early, again and again</h2>
        <div className="quotes">
          {QUOTES.map((q, index) => (
            <figure
              className="quote card reveal"
              style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
              key={q.name}
            >
              <blockquote>“{q.quote}”</blockquote>
              <figcaption className="row">
                <span className="quote__avatar" aria-hidden>
                  {q.initial}
                </span>
                <span className="stack stack--tight">
                  <span className="quote__name">{q.name}</span>
                  <span className="small muted">{q.meta}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA — one statement, one action. */}
      <section className="container final">
        <h2 className="final__title reveal">
          Money lands <em>today.</em>
        </h2>
        <p className="muted reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
          Verify once, choose an amount, done before your coffee cools.
        </p>
        <div className="reveal" style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
          <Link className="btn btn--primary btn--lg" to="/creator">
            Get Cash Early
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="container landing__footer-inner">
          <span className="topbar__brand" translate="no">
            <Logo size={22} />
            <span>Cashy</span>
          </span>
          <nav className="landing__footer-nav" aria-label="Footer">
            <a className="small muted" href="#how">
              How It Works
            </a>
            <Link className="small muted" to="/creator">
              Creator App
            </Link>
            <Link className="small muted" to="/lp">
              Vault
            </Link>
          </nav>
          <span className="small muted">Demo — ETH Jakarta 2026 · Advances settle onchain in IDRX</span>
        </div>
      </footer>
    </div>
  )
}
