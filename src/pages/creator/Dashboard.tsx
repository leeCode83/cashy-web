/**
 * Creator dashboard — one decision per visit: take money now or not. The
 * screen is built around that: an ink-inverted borrow card (the focal
 * point), the rule-based Channel Health panel beside it (why the limit is
 * what it is), and the full transaction log under both. The payday rail
 * lives in the cash-out flow, not here.
 *
 * Flow (user-confirmed): pressing Cash Out starts the flow; verification
 * runs as its first step, never as a gate in front of this screen.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowUpRight, Info } from '@phosphor-icons/react'
import { Banner, StatusChip } from '../../components/status/index.ts'
import { ActivityList } from '../../components/ActivityList.tsx'
import { messages } from '../../messages.ts'
import { bureauTraits, bureauVerdict, creator, limitFor } from '../../mock/data.ts'
import { demoScenario, retryRepayment } from '../../mock/api.ts'
import { formatIDRX } from '../../lib/money.ts'
import { useAppState } from '../../state/AppStateContext.ts'

/** Time-of-day greeting; the demo persona is Dewi. */
function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Skeleton beat so the loading state is visible in the demo, in ms. */
const SKELETON_MS = 600

/** Live recompute cadence for the bureau panel, in ms. */
const BUREAU_TICK_MS = 4_000

export default function Dashboard() {
  const navigate = useNavigate()
  const { verifiedMethod, advance, history, markRepaid } = useAppState()
  const [loading, setLoading] = useState(true)
  const [repayState, setRepayState] = useState<'idle' | 'retrying' | 'repaid'>('idle')

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), SKELETON_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (loading) return <Skeleton />

  const repayFailed = advance !== null && repayState === 'idle' && demoScenario() === 'repay-fail'
  const advanceIsLive = advance !== null && advance.status === 'active'
  const repayBanner =
    repayState === 'repaid'
      ? {
          kind: 'success' as const,
          text: messages.creator.repaidOnTime(
            formatIDRX(advance?.repayCents ?? 0),
            formatIDRX(creator.finalBalanceCents - (advance?.repayCents ?? 0)),
          ),
        }
      : repayFailed
        ? { kind: 'error' as const, text: messages.creator.repayFailed }
        : advanceIsLive
          ? { kind: 'info' as const, text: messages.creator.repayScheduled(formatIDRX(advance.repayCents)) }
          : null

  const retry = (): void => {
    if (advance === null) return
    setRepayState('retrying')
    void retryRepayment().then(() => {
      markRepaid(advance.repayCents)
      setRepayState('repaid')
    })
  }

  const limitBps = verifiedMethod === 'analytics' ? creator.analyticsLimitBps : creator.limitBps
  const limit = limitFor(creator.finalBalanceCents, limitBps)
  const limitPct = limitBps / 100

  return (
    <div className="container page">
      <header>
        <h1 className="page__title">
          {greeting()}, {creator.name}
        </h1>
      </header>

      {repayBanner !== null && (
        <Banner
          kind={repayBanner.kind}
          title={repayBanner.text.title}
          body={repayBanner.text.body}
          action={repayFailed ? { label: messages.creator.repayFailed.action!, onClick: retry } : undefined}
        />
      )}
      {repayState === 'retrying' && (
        <Banner kind="pending" title="Retrying repayment…" body="We’ll let you know as soon as it goes through." />
      )}

      <div className="dash">
        <section className="card dash__borrow" aria-label="Cash out">
          {advanceIsLive ? (
            <div className="stack">
              <p className="borrow__eyebrow small">Active advance</p>
              <p className="borrow__amount u-mono">{formatIDRX(advance.principalCents)}</p>
              <p className="borrow__line">
                We collect {formatIDRX(advance.repayCents)} on Oct 21. <StatusChip kind="info" label="Active" />
              </p>
              <div>
                <button type="button" className="btn btn--primary" disabled>
                  Cash Out
                </button>
              </div>
              <p className="borrow__hint small">{messages.creator.activeAdvanceHint}</p>
            </div>
          ) : (
            <div className="stack">
              <p className="borrow__eyebrow small">Available to cash out</p>
              <p className="borrow__amount u-mono">{formatIDRX(limit)}</p>
              <p className="borrow__line">
                Up to {limitPct}% of your {formatIDRX(creator.finalBalanceCents)} final balance. Flat 2.5% fee, shown
                before you commit.
              </p>
              <div>
                <button type="button" className="btn btn--primary" onClick={() => navigate('/creator/cash-out/verify')}>
                  Cash Out
                </button>
              </div>
              <p className="borrow__hint small">
                Verification runs first if this session hasn’t checked yet. Takes about a minute.
              </p>
            </div>
          )}
        </section>

        <ChannelHealth />

        <section className="card dash__log" aria-label="Activity">
          <header className="row row--between">
            <h2 className="section-title">Activity</h2>
            <span className="small muted">{history.length} events</span>
          </header>
          <ActivityList entries={history} filterable viewAllTo="/creator/history" />
        </section>
      </div>
    </div>
  )
}

/**
 * Rule-based bureau output as a live panel: six channel traits with meters,
 * the weighted conclusion under them. Scores jitter around their demo bases
 * so the recompute reads as realtime; reduced-motion holds them static.
 */
function ChannelHealth() {
  const [scores, setScores] = useState<number[]>(() => bureauTraits.map((trait) => trait.base))
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tick = window.setInterval(() => {
      setScores((current) =>
        current.map((score) => Math.min(0.97, Math.max(0.45, score + (Math.random() - 0.5) * 0.04))),
      )
      setUpdatedAt(new Date())
    }, BUREAU_TICK_MS)
    return () => window.clearInterval(tick)
  }, [])

  const timeFormat = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <aside className="card dash__health" aria-label="Channel health">
      <header className="row row--between">
        <h2 className="section-title">Channel health</h2>
        <span className="health__live small muted">
          <span className="health__dot" aria-hidden />
          Live · updated {timeFormat.format(updatedAt)}
        </span>
      </header>
      <ul className="health__traits">
        {bureauTraits.map((trait, index) => (
          <li key={trait.id}>
            <div className="row row--between">
              <span>{trait.label}</span>
              <span className="health__score u-mono">{Math.round(scores[index] * 100)}</span>
            </div>
            <div
              className="health__bar"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(scores[index] * 100)}
              aria-label={trait.label}
            >
              <i style={{ '--score': scores[index] } as React.CSSProperties} />
            </div>
            <p className="small muted">{trait.detail}</p>
          </li>
        ))}
      </ul>
      <div className="health__verdict">
        <p className="health__headline">{bureauVerdict.headline}</p>
        <p className="small">{bureauVerdict.body}</p>
        <p className="small muted">
          {creator.onTimeRepayments} on-time repayments ·{' '}
          <a className="linklike" href="https://explorer.example/address/0x9f4b" target="_blank" rel="noreferrer">
            Verified onchain <ArrowUpRight size={14} aria-hidden />
          </a>
        </p>
      </div>
      <p className="small muted health__note">
        Rule-based, recomputed every few seconds. <Info size={12} aria-hidden /> Nothing here is a credit score.
      </p>
    </aside>
  )
}

/** Loading skeleton matching the dashboard's shape. */
function Skeleton() {
  return (
    <div className="container page">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--card" />
      <div className="skeleton skeleton--card" />
    </div>
  )
}
