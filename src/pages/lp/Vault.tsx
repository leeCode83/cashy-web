/**
 * LP Vault (brief §6.4) — three tranches, the deposit panel (sticky on
 * desktop, bottom sheet on mobile), the loss-waterfall diagram and the live
 * feed. Selected tier lives in the URL (`?tier=senior`). Junior is never
 * preselected and demands an explicit risk ack before deposit.
 */
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowUpRight, CheckCircle, Copy, Wallet } from '@phosphor-icons/react'
import { useToast } from '../../components/status/ToastContext.ts'
import { DepositForm } from '../../components/DepositForm.tsx'
import { useDeposit } from '../../components/useDeposit.ts'
import { messages } from '../../messages.ts'
import { delay } from '../../mock/api.ts'
import { DEMO_TX_HASH } from '../../mock/api.ts'
import { liveFeed, lpWallet, tiers, vault } from '../../mock/data.ts'
import type { Tier, TierId } from '../../mock/data.ts'
import { formatIDRX, parseIDRXInput } from '../../lib/money.ts'
import { useAppState } from '../../state/AppStateContext.ts'

/** Beat between "confirmed" and showing the success toast, in ms. */
const CONFIRM_MS = 1_200

export default function Vault() {
  const { setLpConnected, lpConnected, addPosition } = useAppState()
  const toast = useToast()
  const deposit = useDeposit()
  const [params, setParams] = useSearchParams()
  const [amountDraft, setAmountDraft] = useState('')
  const [juniorAck, setJuniorAck] = useState(false)
  const [capacity, setCapacity] = useState<Record<TierId, number>>({
    senior: tiers[0].capacityLeftCents,
    junior: tiers[1].capacityLeftCents,
    reserve: tiers[2].capacityLeftCents,
  })
  const sheetRef = useRef<HTMLDialogElement>(null)

  const param = params.get('tier')
  const tierId: TierId = param === 'junior' || param === 'reserve' ? param : 'senior'
  const tier: Tier = tiers.find((candidate) => candidate.id === tierId) ?? tiers[0]

  /** Selection lives in the URL (brief §9). Switching tiers clears the Junior ack. */
  const selectTier = (id: TierId): void => {
    setParams({ tier: id }, { replace: true })
    setJuniorAck(false)
  }

  const connect = (): void => {
    setLpConnected(true)
  }

  const runDeposit = (): void => {
    const amount = parseIDRXInput(amountDraft)
    if (amount === null) return
    void deposit.run(amount, tierId).then(async (position) => {
      await delay(CONFIRM_MS)
      addPosition(position)
      setCapacity((current) => ({ ...current, [tierId]: current[tierId] - amount }))
      deposit.reset()
      setAmountDraft('')
      setJuniorAck(false)
      sheetRef.current?.close()
      toast(`${messages.lp.deposited(formatIDRX(amount), tier.name).title} ${DEMO_TX_HASH} ↗`)
    })
  }

  const formProps = {
    tier,
    capacityLeftCents: capacity[tierId],
    amountDraft,
    setAmountDraft,
    juniorAck,
    setJuniorAck,
    phase: deposit.phase,
    hash: deposit.hash,
    onConnect: connect,
    onDeposit: runDeposit,
  } as const

  return (
    <div className="container page vault">
      <header className="row row--between">
        <h1 className="page__title">Vault</h1>
        {lpConnected ? (
          <span className="u-mono small">{lpWallet.shortAddress}</span>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={connect}>
            <Wallet size={18} aria-hidden /> {messages.lp.connectWallet}
          </button>
        )}
      </header>

      <div className="vault-stats card" aria-label="Vault totals">
        <div className="vault-stats__item">
          <span className="muted small">Total deposited</span>
          <span className="u-mono">{formatIDRX(vault.totalDepositedCents)}</span>
        </div>
        <div className="vault-stats__item">
          <span className="muted small">Active advances</span>
          <span className="u-mono">{vault.activeAdvances}</span>
        </div>
        <div className="vault-stats__item">
          <span className="muted small">Repaid on time</span>
          <span className="u-mono">{vault.repaidOnTimePct}%</span>
        </div>
      </div>

      <div className="vault-grid">
        <section className="stack" aria-label="Tranches and activity">
          <div className="tiers">
            {tiers.map((candidate) => {
              const selected = candidate.id === tierId
              return (
                <button
                  key={candidate.id}
                  type="button"
                  className={`tier${selected ? ' tier--selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => selectTier(candidate.id)}
                >
                  <span className="tier__name">
                    {candidate.name}
                    {selected && <CheckCircle size={16} aria-hidden />}
                  </span>
                  <span className="tier__yield u-mono">{candidate.yieldPct.toFixed(1)}%</span>
                  <span className="muted small">
                    Est. yield · Risk: {candidate.risk}
                  </span>
                  <span className="muted small">{candidate.lossOrder}</span>
                  <span className="tier__capacity u-mono">{formatIDRX(capacity[candidate.id])}</span>
                  <span className="muted small">Capacity left</span>
                </button>
              )
            })}
          </div>

          <section className="card stack" aria-label="How the waterfall works">
            <h2 className="section-title">How the waterfall works</h2>
            <div className="waterfall" role="img" aria-label="Losses hit Junior first, then Reserve, then Senior.">
              <span className="waterfall__row waterfall__row--junior">Junior · losses 1st</span>
              <span className="waterfall__row waterfall__row--reserve">Reserve · losses 2nd</span>
              <span className="waterfall__row waterfall__row--senior">Senior · losses 3rd</span>
              <span className="waterfall__hint muted small">If advances aren’t repaid, losses flow from the top.</span>
            </div>
          </section>

          <div className="feed-grid">
            <section className="card stack" aria-label="Latest nullifiers">
              <h2 className="section-title">Latest nullifiers</h2>
              <ul className="feed">
                {liveFeed.nullifiers.map((item) => (
                  <li className="feed__item" key={item.id}>
                    <span className="small">{item.label}</span>
                    <span className="feed__hash u-mono small">
                      {item.hash}
                      <button
                        type="button"
                        className="feed__copy"
                        aria-label={`Copy ${item.hash}`}
                        onClick={() => {
                          void navigator.clipboard.writeText(item.hash)
                          toast(messages.lp.copied)
                        }}
                      >
                        <Copy size={14} aria-hidden />
                      </button>
                      <a className="linklike" href="https://explorer.example" target="_blank" rel="noreferrer" aria-label="View on explorer">
                        <ArrowUpRight size={14} aria-hidden />
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card stack" aria-label="Latest advances">
              <h2 className="section-title">Latest advances</h2>
              <ul className="feed">
                {liveFeed.advances.map((item) => (
                  <li className="feed__item" key={item.id}>
                    <span className="small">{item.label}</span>
                    <span className="u-mono small">{formatIDRX(item.amountCents)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>

        <aside className="card deposit-panel" aria-label="Deposit panel">
          <h2 className="section-title">Deposit — {tier.name}</h2>
          <DepositForm {...formProps} />
        </aside>
      </div>

      {/* Mobile: floating opener + bottom sheet hosting the same form. */}
      <button
        type="button"
        className="vault__sheet-opener btn btn--primary"
        onClick={() => sheetRef.current?.showModal()}
      >
        Deposit
      </button>
      <dialog
        ref={sheetRef}
        className="deposit-sheet"
        onClick={(event) => {
          if (event.target === sheetRef.current) sheetRef.current?.close()
        }}
      >
        <div className="deposit-sheet__grabber" aria-hidden />
        <h2 className="section-title">Deposit — {tier.name}</h2>
        <DepositForm {...formProps} />
      </dialog>
    </div>
  )
}
