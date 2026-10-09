/**
 * Step 1 — Verify (brief §6.3). One task: seal the AdSense session and see
 * the final balance. States in order: waiting for sign-in → sealing →
 * verified, with cancel and the Analytics fallback path. What is shared and
 * what is never seen is spelled out on screen.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { StatusCard, Banner } from '../../../components/status/index.ts'
import { messages } from '../../../messages.ts'
import { verifyAdSense } from '../../../mock/api.ts'
import type { VerifyMethod } from '../../../mock/api.ts'
import { creator, limitFor } from '../../../mock/data.ts'
import { formatIDRX, formatPercent } from '../../../lib/money.ts'
import { useAppState } from '../../../state/AppStateContext.ts'

/** Phases of the verify step. */
type Phase = 'idle' | 'waiting' | 'sealing' | 'slow' | 'verified' | 'cancelled'

/** Sign-in beat before sealing starts, in ms. */
const SIGN_IN_MS = 1_200
/** Sealing is allowed to take this long before "Still working…" appears. */
const SLOW_MS = 10_000

export default function Verify() {
  const navigate = useNavigate()
  const { verifiedMethod, setVerifiedMethod } = useAppState()
  const [phase, setPhase] = useState<Phase>(verifiedMethod !== null ? 'verified' : 'idle')
  const [method, setMethod] = useState<VerifyMethod>('adsense')
  /** A cancelled run must not be able to write its result. */
  const runId = useRef(0)

  const balance = formatIDRX(creator.finalBalanceCents)

  useEffect(() => {
    if (phase === 'waiting') {
      const timer = window.setTimeout(() => setPhase('sealing'), SIGN_IN_MS)
      return () => window.clearTimeout(timer)
    }
    if (phase !== 'sealing') return
    const id = runId.current
    const startedAt = Date.now()
    void verifyAdSense(method).then((result) => {
      if (runId.current !== id) return
      setVerifiedMethod(result.method)
      setPhase('verified')
    })
    const slowTimer = window.setTimeout(() => {
      if (runId.current === id && Date.now() - startedAt >= SLOW_MS) setPhase('slow')
    }, SLOW_MS)
    return () => window.clearTimeout(slowTimer)
  }, [phase, method, setVerifiedMethod])

  const start = (next: VerifyMethod): void => {
    setMethod(next)
    runId.current += 1
    setPhase('waiting')
  }

  const cancel = (): void => {
    runId.current += 1
    setPhase('cancelled')
  }

  return (
    <div className="stack">
      <header className="stack">
        <h1 className="page__title">Verify Your Balance</h1>
        <p className="muted">
          Sign in to AdSense. We seal your session so only the result is shared — never your password or full figures.
        </p>
      </header>

      {method === 'analytics' && phase !== 'verified' && (
        <Banner
          kind="warning"
          title={messages.verify.lowerLimit.title}
          body={messages.verify.lowerLimit.body}
          action={{ label: messages.verify.lowerLimit.action!, onClick: () => start('adsense') }}
        />
      )}

      {phase === 'idle' && (
        <div className="stack">
          <button type="button" className="btn btn--primary" onClick={() => start('adsense')}>
            Connect AdSense
          </button>
          <p className="muted small">
            We share your final balance only. We never see your password, your full figures, or anything else.
          </p>
          <p className="small">
            <button type="button" className="linklike" onClick={() => start('analytics')}>
              Connect YouTube Analytics instead
            </button>
            <span className="muted"> — lower limit with this method (up to {formatPercent(creator.analyticsLimitBps)} of your balance).</span>
          </p>
        </div>
      )}

      {phase === 'waiting' && (
        <StatusCard kind="waiting" title={messages.verify.waitingSignIn.title} body={messages.verify.waitingSignIn.body}>
          <button type="button" className="btn btn--secondary" onClick={() => start(method)}>
            {messages.verify.waitingSignIn.action}
          </button>
          <button type="button" className="btn btn--ghost" onClick={cancel}>
            Cancel
          </button>
        </StatusCard>
      )}

      {(phase === 'sealing' || phase === 'slow') && (
        <StatusCard
          kind="pending"
          title={phase === 'slow' ? messages.verify.stillWorking.title : messages.verify.sealing.title}
          body={phase === 'slow' ? messages.verify.stillWorking.body : messages.verify.sealing.body}
        >
          {phase === 'slow' ? (
            <button type="button" className="btn btn--ghost" onClick={cancel}>
              {messages.verify.stillWorking.action}
            </button>
          ) : (
            <span className="spinner-inline" role="status" aria-label="Working" />
          )}
        </StatusCard>
      )}

      {phase === 'cancelled' && (
        <StatusCard kind="info" title={messages.verify.cancelled.title} body={messages.verify.cancelled.body}>
          <button type="button" className="btn btn--secondary" onClick={() => start(method)}>
            {messages.verify.cancelled.action}
          </button>
        </StatusCard>
      )}

      {phase === 'verified' && (
        <>
          <StatusCard kind="success" title={messages.verify.verified(balance).title} body={messages.verify.verified(balance).body} />
          {verifiedMethod === 'analytics' && (
            <p className="muted small">
              Verified through YouTube Analytics — you can take up to {formatPercent(creator.analyticsLimitBps)} of your
              balance ({formatIDRX(limitFor(creator.finalBalanceCents, creator.analyticsLimitBps))}).
            </p>
          )}
          <div>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/creator/cash-out/amount')}>
              {messages.verify.verified(balance).action}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
