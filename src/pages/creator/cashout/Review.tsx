/**
 * Step 3 — Review (brief §6.3). Left: the numbers and the rail. Right: bind
 * the payout account (one tap; wallet approval behind the curtain) and the
 * repayment consent. The primary button stays disabled, with the reason
 * written below it, until both are done. `?demo=link-fail` and `?demo=funded`
 * drive the error paths.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Banner, StatusCard, StatusChip } from '../../../components/status/index.ts'
import { PaydayRail } from '../../../components/PaydayRail.tsx'
import { messages } from '../../../messages.ts'
import { connectPayoutAccount, submitCashOut, MockError } from '../../../mock/api.ts'
import { creator } from '../../../mock/data.ts'
import { feeFor, formatIDRX, parseIDRXInput, repayFor } from '../../../lib/money.ts'
import { useAppState } from '../../../state/AppStateContext.ts'

/** Phases of binding the payout account. */
type BindPhase = 'idle' | 'waiting' | 'linked' | 'failed'

export default function Review() {
  const navigate = useNavigate()
  const { verifiedMethod, amountDraft, startAdvance } = useAppState()
  const [bind, setBind] = useState<BindPhase>('idle')
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState<'funded' | 'sendFailed' | null>(null)

  const principal = parseIDRXInput(amountDraft)
  const fee = principal !== null ? feeFor(principal) : 0
  const repay = principal !== null ? repayFor(principal) : 0
  const keep = principal !== null ? creator.finalBalanceCents - repay : 0

  const connect = (): void => {
    setBind('waiting')
    void connectPayoutAccount()
      .then(() => setBind('linked'))
      .catch(() => setBind('failed'))
  }

  const ready = bind === 'linked' && consent && principal !== null && !sending

  const submit = (): void => {
    if (principal === null) return
    setSending(true)
    void submitCashOut()
      .then(() => {
        startAdvance({ principalCents: principal, feeCents: fee, repayCents: repay, status: 'active' })
        navigate('/creator/cash-out/done')
      })
      .catch((error: unknown) => {
        setSending(false)
        setFailure(error instanceof MockError && error.code === 'funded' ? 'funded' : 'sendFailed')
      })
  }

  return (
    <div className="stack">
      <header>
        <h1 className="page__title">Review And Cash Out</h1>
      </header>

      {failure === 'funded' && (
        <Banner
          kind="error"
          title={messages.review.alreadyFunded.title}
          body={messages.review.alreadyFunded.body}
          action={{
            label: messages.review.alreadyFunded.action!,
            onClick: () => navigate('/creator'),
          }}
        />
      )}
      {failure === 'sendFailed' && (
        <Banner
          kind="error"
          title={messages.review.sendFailed.title}
          body={messages.review.sendFailed.body}
          action={{ label: messages.review.sendFailed.action!, onClick: submit }}
        />
      )}

      <div className="review-grid">
        <section className="stack" aria-label="Summary">
          <div className="card--shell">
            <div className="card--core summary">
              <div className="summary__row">
                <span className="muted">You get today</span>
                <span className="summary__amount">{formatIDRX(principal ?? 0)}</span>
              </div>
              <div className="summary__row">
                <span className="muted">Fee — flat, no interest</span>
                <span className="summary__amount">{formatIDRX(fee)}</span>
              </div>
              <div className="summary__row">
                <span className="muted">Repaid on Oct 21</span>
                <span className="summary__amount">{formatIDRX(repay)}</span>
              </div>
              <div className="summary__row">
                <span className="muted">You keep from your payout</span>
                <span className="summary__amount">{formatIDRX(keep)}</span>
              </div>
            </div>
          </div>
          <PaydayRail
            stops={[
              { label: 'Today', sub: `You get ${formatIDRX(principal ?? 0)}` },
              { label: 'The 21st', sub: `Repaid ${formatIDRX(repay)}` },
            ]}
          />
          <p className="muted small">
            Verified with {verifiedMethod === 'analytics' ? 'YouTube Analytics' : 'AdSense'}. Limit applied.
          </p>
        </section>

        <section className="stack" aria-label="Payout account and consent">
          {bind === 'idle' && (
            <div className="card stack">
              <p className="muted small">
                Your repayment is collected from this account on Oct 21, when your payout arrives.
              </p>
              <button type="button" className="btn btn--secondary" onClick={connect}>
                {messages.review.connectPayout}
              </button>
            </div>
          )}
          {bind === 'waiting' && (
            <StatusCard
              kind="waiting"
              title={messages.review.waitingApproval.title}
              body={messages.review.waitingApproval.body}
            >
              <button type="button" className="btn btn--secondary" onClick={connect}>
                {messages.review.waitingApproval.action}
              </button>
            </StatusCard>
          )}
          {bind === 'linked' && (
            <div className="card row row--between">
              <div className="stack stack--tight">
                <strong>Payout account</strong>
                <span className="muted small">{messages.review.linked.body}</span>
              </div>
              <StatusChip kind="success" label="Account linked" />
            </div>
          )}
          {bind === 'failed' && (
            <StatusCard
              kind="error"
              title={messages.review.approvalFailed.title}
              body={messages.review.approvalFailed.body}
            >
              <button type="button" className="btn btn--secondary" onClick={connect}>
                {messages.review.approvalFailed.action}
              </button>
            </StatusCard>
          )}

          <label className="row consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span className="small">{messages.review.consent}</span>
          </label>

          <div className="stack stack--tight">
            <button type="button" className="btn btn--primary btn--block" disabled={!ready} onClick={submit}>
              {sending ? (
                <>
                  <span className="spinner" aria-hidden /> {messages.review.sending}
                </>
              ) : (
                messages.review.cashOutNow
              )}
            </button>
            {!ready && !sending && <p className="muted small">{messages.review.disabledReason}</p>}
          </div>

          <div className="row">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/creator/cash-out/amount')}>
              Back
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
