/**
 * Deposit form — the single deposit flow, rendered in the sticky panel on
 * desktop and inside the bottom sheet on mobile. Owns nothing global:
 * amount draft, ack and phase come in as props from the Vault screen.
 * Validations: connect first, insufficient balance, over capacity, and the
 * Junior risk ack. Phases: confirm in wallet → waiting for confirmation →
 * deposited (toast).
 */
import { Banner, StatusCard } from './status/index.ts'
import { messages } from '../messages.ts'
import type { Tier } from '../mock/data.ts'
import { lpWallet } from '../mock/data.ts'
import { formatIDRX, formatIDRXInputText, parseIDRXInput } from '../lib/money.ts'
import { useAppState } from '../state/AppStateContext.ts'
import type { DepositPhase } from './useDeposit.ts'

/** Props shared by both mounts of the form (panel and sheet). */
export interface DepositFormProps {
  tier: Tier
  capacityLeftCents: number
  amountDraft: string
  setAmountDraft: (draft: string) => void
  juniorAck: boolean
  setJuniorAck: (ack: boolean) => void
  phase: DepositPhase
  hash: string | null
  onConnect: () => void
  onDeposit: () => void
}

/**
 * The form itself. One early return per state keeps the happy path flat.
 */
export function DepositForm(props: DepositFormProps) {
  const {
    tier,
    capacityLeftCents,
    amountDraft,
    setAmountDraft,
    juniorAck,
    setJuniorAck,
    phase,
    hash,
    onConnect,
    onDeposit,
  } = props
  const { lpConnected } = useAppState()

  if (!lpConnected) {
    return (
      <Banner
        kind="info"
        title={messages.lp.connectFirst.title}
        body={messages.lp.connectFirst.body}
        action={{ label: messages.lp.connectFirst.action!, onClick: onConnect }}
      />
    )
  }

  if (phase === 'wallet') {
    return <StatusCard kind="waiting" title={messages.lp.confirmInWallet.title} body={messages.lp.confirmInWallet.body} />
  }

  if (phase === 'pending') {
    return (
      <StatusCard kind="pending" title={messages.lp.waitingConfirmation.title} body={messages.lp.waitingConfirmation.body}>
        <span className="u-mono small">
          {hash ?? ''}{' '}
          <a className="linklike" href="https://explorer.example/tx/mock" target="_blank" rel="noreferrer">
            ↗
          </a>
        </span>
      </StatusCard>
    )
  }

  const parsed = parseIDRXInput(amountDraft)
  let error: { title: string; body: string } | null = null
  if (amountDraft.trim() !== '' && parsed === null) error = messages.amount.invalid
  else if (parsed !== null && parsed > lpWallet.balanceCents) error = messages.lp.insufficient(formatIDRX(lpWallet.balanceCents))
  else if (parsed !== null && parsed > capacityLeftCents) error = messages.lp.overCapacity(formatIDRX(capacityLeftCents), tier.name)

  const valid =
    parsed !== null &&
    parsed > 0 &&
    parsed <= lpWallet.balanceCents &&
    parsed <= capacityLeftCents &&
    (tier.id !== 'junior' || juniorAck)
  const yearlyEstimate = parsed !== null ? Math.floor((parsed * tier.yieldPct) / 100) : 0

  return (
    <div className="stack">
      {tier.id === 'junior' && <Banner kind="warning" title={messages.lp.juniorRisk.title} body={messages.lp.juniorRisk.body} />}
      {tier.id === 'junior' && (
        <label className="row consent">
          <input type="checkbox" checked={juniorAck} onChange={(event) => setJuniorAck(event.target.checked)} />
          <span className="small">{messages.lp.juniorRiskAck}</span>
        </label>
      )}

      <div className="field">
        <label className="field__label" htmlFor="deposit-amount">
          Amount
        </label>
        <div className="amount-input amount-input--sm">
          <input
            id="deposit-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="u-mono"
            placeholder="0,00"
            value={amountDraft}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? 'deposit-error' : undefined}
            onChange={(event) => setAmountDraft(formatIDRXInputText(event.target.value))}
          />
          <span className="amount-input__unit" translate="no">
            IDRX
          </span>
        </div>
        {error !== null && (
          <p className="field__error" id="deposit-error" role="alert">
            {error.title} {error.body}
          </p>
        )}
      </div>

      <p className="muted small">
        Balance <span className="u-mono">{formatIDRX(lpWallet.balanceCents)}</span>
      </p>
      <p className="muted small">
        You’ll receive ≈ <span className="u-mono">{parsed !== null ? formatIDRX(yearlyEstimate) : formatIDRX(0)}</span> per year at{' '}
        {tier.yieldPct.toFixed(1)}%.
      </p>

      <button type="button" className="btn btn--primary btn--block" disabled={!valid} onClick={onDeposit}>
        {messages.lp.deposit}
      </button>
      {!valid && tier.id === 'junior' && amountDraft.trim() !== '' && !juniorAck && parsed !== null && (
        <p className="muted small">Confirm that you understand the Junior risk to continue.</p>
      )}
    </div>
  )
}
