/**
 * Step 2 — Amount (brief §6.3). One task: pick how much to take, with fee
 * and repayment date visible the whole time. Live inline validation, quick
 * chips, a slider bounded by the bureau limit, and "Why this limit?" for
 * the plain-language explanation.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Info } from '@phosphor-icons/react'
import { messages } from '../../../messages.ts'
import { creator, limitFor } from '../../../mock/data.ts'
import { feeFor, formatIDRX, formatIDRXInputText, formatPercent, parseIDRXInput, repayFor, FEE_BPS } from '../../../lib/money.ts'
import { useAppState } from '../../../state/AppStateContext.ts'
import { useUnsavedGuard } from '../../../lib/useUnsavedGuard.ts'

/** Whole-IDRX text for quick chips, e.g. 1.470.000. */
function plainIDRX(cents: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.trunc(cents / 100))
}

export default function Amount() {
  const navigate = useNavigate()
  const { verifiedMethod, amountDraft, setAmountDraft } = useAppState()
  const [touched, setTouched] = useState(false)

  const isAnalytics = verifiedMethod === 'analytics'
  const limit = limitFor(creator.finalBalanceCents, isAnalytics ? creator.analyticsLimitBps : creator.limitBps)

  const parsed = parseIDRXInput(amountDraft)
  let error: { title: string; body: string } | null = null
  if (touched && amountDraft.trim() === '') error = messages.amount.invalid
  else if (touched && parsed === null) error = messages.amount.invalid
  else if (touched && parsed !== null && parsed > limit) error = messages.amount.overLimit(formatIDRX(limit))
  else if (touched && parsed !== null && parsed < creator.minCashOutCents) error = messages.amount.underMinimum(formatIDRX(creator.minCashOutCents))

  const valid = parsed !== null && parsed >= creator.minCashOutCents && parsed <= limit
  // Warn on tab close while an amount is typed but not yet sent.
  useUnsavedGuard(amountDraft.trim() !== '')

  const fee = parsed !== null ? feeFor(parsed) : 0
  const repay = parsed !== null ? repayFor(parsed) : 0

  return (
    <div className="stack">
      <header>
        <h1 className="page__title">Choose Your Amount</h1>
      </header>

      <div className="amount-grid">
        <div className="stack stack--lg">
          <div className="field">
            <label className="field__label" htmlFor="amount">
              Amount
            </label>
            <div className="amount-input">
              <input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                className="u-mono"
                placeholder="0,00"
                value={amountDraft}
                aria-invalid={error !== null}
                aria-describedby={error !== null ? 'amount-error' : undefined}
                onChange={(event) => setAmountDraft(formatIDRXInputText(event.target.value))}
                onBlur={() => setTouched(true)}
              />
              <span className="amount-input__unit" translate="no">
                IDRX
              </span>
            </div>
            {error !== null && (
              <p className="field__error" id="amount-error" role="alert">
                {error.title} {error.body}
              </p>
            )}
          </div>

          <input
            className="amount-slider"
            type="range"
            min={0}
            max={limit}
            step={100_000}
            value={parsed !== null ? Math.min(parsed, limit) : 0}
            aria-label="Amount slider"
            onChange={(event) => {
              setAmountDraft(plainIDRX(Number(event.target.value)))
              setTouched(true)
            }}
          />

          <div className="row">
            {[
              { label: '25%', value: Math.floor(limit / 4) },
              { label: '50%', value: Math.floor(limit / 2) },
              { label: 'Max', value: limit },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="chip-btn"
                onClick={() => {
                  setAmountDraft(plainIDRX(chip.value))
                  setTouched(true)
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <p className="muted small">
            Up to {formatIDRX(limit)}.{' '}
            <details className="popover">
              <summary className="popover__summary popover__title">
                Why this limit? <Info size={14} aria-hidden />
              </summary>
              <div className="popover__panel">
                <p className="popover__body">{messages.amount.whyLimit.body}</p>
              </div>
            </details>
          </p>
        </div>

        <aside className="card summary" aria-label="Live summary">
          <div className="summary__row">
            <span className="muted">You get today</span>
            <span className="summary__amount">{parsed !== null ? formatIDRX(parsed) : '—'}</span>
          </div>
          <div className="summary__row">
            <span className="muted">Fee ({formatPercent(FEE_BPS)}, flat, no interest)</span>
            <span className="summary__amount">{parsed !== null ? formatIDRX(fee) : '—'}</span>
          </div>
          <div className="summary__row">
            <span className="muted">Repaid on the 21st</span>
            <span className="summary__amount">{parsed !== null ? formatIDRX(repay) : '—'}</span>
          </div>
        </aside>
      </div>

      <div className="row">
        <button type="button" className="btn btn--ghost" onClick={() => navigate('/creator/cash-out/verify')}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!valid}
          onClick={() => navigate('/creator/cash-out/review')}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
