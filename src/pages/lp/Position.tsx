/**
 * My Position (brief §6.5) — one row per tier with amount, running yield and
 * status. Empty state points to the Vault. Withdraw is out of scope.
 */
import { Link } from 'react-router'
import { StatusChip } from '../../components/status/index.ts'
import { tiers } from '../../mock/data.ts'
import { formatIDRX } from '../../lib/money.ts'
import { useAppState } from '../../state/AppStateContext.ts'

export default function Position() {
  const { lpPositions } = useAppState()

  if (lpPositions.length === 0) {
    return (
      <div className="container page">
        <header>
          <h1 className="page__title">My Position</h1>
        </header>
        <div className="card stack">
          <p className="muted">No positions yet. Deposit into a tranche to start earning.</p>
          <div>
            <Link className="btn btn--primary" to="/lp">
              Go to Vault
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <header>
        <h1 className="page__title">My Position</h1>
      </header>
      <div className="stack">
        {lpPositions.map((position) => {
          const tier = tiers.find((candidate) => candidate.id === position.tier)
          return (
            <section className="card row row--between position-row" key={position.tier} aria-label={tier?.name}>
              <div className="stack stack--tight">
                <strong>{tier?.name}</strong>
                <span className="muted small">
                  Est. yield {tier?.yieldPct.toFixed(1)}% · Accrued{' '}
                  <span className="u-mono">{formatIDRX(position.accruedCents)}</span>
                </span>
              </div>
              <div className="stack stack--tight" style={{ textAlign: 'right' }}>
                <span className="u-mono position-row__amount">{formatIDRX(position.amountCents)}</span>
                <StatusChip kind="success" label="Deposited" />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
