/**
 * Creator dashboard (brief §6.2) — one task: know what you can cash out and
 * start. Three states: not verified, ready, active advance. `?demo=repay-fail`
 * shows the failed auto-repay banner with its retry path.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowUpRight, Info } from '@phosphor-icons/react'
import { Banner, StatusChip } from '../../components/status/index.ts'
import { PaydayRail } from '../../components/PaydayRail.tsx'
import { ActivityList } from '../../components/ActivityList.tsx'
import { messages } from '../../messages.ts'
import { creator, limitFor } from '../../mock/data.ts'
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

      <div className="dash-grid">
        <section className="card dash-hero" aria-label="Cash out">
          {advance === null && verifiedMethod === null && (
            <div className="stack">
              <h2>Ready in one step</h2>
              <p className="muted">Verify your AdSense balance to see what you can cash out today.</p>
              <div>
                <button type="button" className="btn btn--primary" onClick={() => navigate('/creator/cash-out/verify')}>
                  Verify AdSense
                </button>
              </div>
            </div>
          )}
          {!advanceIsLive && verifiedMethod !== null && (
            <div className="stack">
              <p className="muted small">Ready to cash out</p>
              <p className="dash-hero__amount u-mono">{formatIDRX(creator.finalBalanceCents)}</p>
              <p className="muted">
                Final balance. You can take up to{' '}
                <strong className="u-mono">
                  {formatIDRX(limitFor(creator.finalBalanceCents, verifiedMethod === 'analytics' ? creator.analyticsLimitBps : creator.limitBps))}
                </strong>
                <details className="popover">
                  <summary className="popover__summary popover__title">
                    {' '}
                    Why this limit? <Info size={14} aria-hidden />
                  </summary>
                  <div className="popover__panel">
                    <p className="popover__body">{messages.amount.whyLimit.body}</p>
                  </div>
                </details>
              </p>
              <div>
                <button type="button" className="btn btn--primary" onClick={() => navigate('/creator/cash-out/verify')}>
                  Cash Out
                </button>
              </div>
            </div>
          )}
          {advanceIsLive && (
            <div className="stack">
              <p className="muted small">Active advance</p>
              <p className="dash-hero__amount u-mono">{formatIDRX(advance.principalCents)}</p>
              <p className="muted row">
                Repays on Oct 21. <StatusChip kind="info" label="Active" />
              </p>
              <p className="muted small">{messages.creator.activeAdvanceHint}</p>
            </div>
          )}
        </section>

        <section className="card" aria-label="Payday rail">
          <PaydayRail
            stops={[
              { label: 'Today' },
              { label: creator.postedOn, sub: 'Balance posted' },
              { label: creator.payoutOn, sub: 'Payout' },
            ]}
          />
        </section>
      </div>

      <div className="dash-grid dash-grid--secondary">
        {advance !== null && (
          <section className="card stack" aria-label="Advance detail">
            <h2 className="section-title">Advance</h2>
            <p className="muted small row">
              {formatIDRX(advance.principalCents)} advanced · {formatIDRX(advance.repayCents)} collected on Oct 21.{' '}
              <StatusChip kind={advance.status === 'repaid' ? 'success' : 'info'} label={advance.status === 'repaid' ? 'Repaid' : 'Active'} />
            </p>
          </section>
        )}
        <section className="card stack" aria-label="Credit record">
          <h2 className="section-title">Credit record</h2>
          <p className="muted small">{creator.onTimeRepayments} on-time repayments</p>
          <p className="small">
            <a className="linklike" href="https://explorer.example/address/0x9f4b" target="_blank" rel="noreferrer">
              Verified onchain <ArrowUpRight size={14} aria-hidden />
            </a>
          </p>
        </section>
      </div>

      <section className="stack" aria-label="Recent activity">
        <h2 className="section-title">Recent activity</h2>
        <ActivityList entries={history} limit={5} viewAllTo="/creator/history" />
      </section>
    </div>
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
