/**
 * Step 4 — Done (brief §6.3). Title flips from "Money's on its way" to
 * "Money received" after a mock beat, the rail marker plays its one-shot
 * slide, and the timeline shows today, the 21st, and the credit record.
 * No confetti. View Receipt opens a native dialog with the numbers.
 */
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { StatusCard } from '../../../components/status/index.ts'
import { PaydayRail } from '../../../components/PaydayRail.tsx'
import { messages } from '../../../messages.ts'
import { creator } from '../../../mock/data.ts'
import { formatIDRX } from '../../../lib/money.ts'
import { useAppState } from '../../../state/AppStateContext.ts'

/** Mock beat before the funds "land", in ms (brief: 2–3 s). */
const ARRIVAL_MS = 2_500

export default function Done() {
  const navigate = useNavigate()
  const { advance } = useAppState()
  const [received, setReceived] = useState(false)
  const receiptRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setReceived(true), ARRIVAL_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (advance === null) return <Navigate to="/creator" replace />

  const amount = formatIDRX(advance.principalCents)
  const repay = formatIDRX(advance.repayCents)
  const message = received ? messages.done.received(amount, repay) : messages.done.onItsWay(amount)

  return (
    <div className="stack">
      <StatusCard kind={received ? 'success' : 'pending'} title={message.title} body={message.body} />

      <PaydayRail
        slideIn
        stops={[
          { label: 'Today', sub: 'Received' },
          { label: 'Oct 21', sub: 'Auto-repay' },
          { label: 'Credit record', sub: 'Updated' },
        ]}
      />

      <p className="muted small">
        Payout of {formatIDRX(creator.finalBalanceCents)} is scheduled for {creator.payoutOn}; we collect {repay} from
        it automatically.
      </p>

      <div className="row">
        <button type="button" className="btn btn--primary" onClick={() => navigate('/creator')}>
          {messages.done.backToDashboard}
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => receiptRef.current?.showModal()}>
          {messages.done.viewReceipt}
        </button>
      </div>

      <dialog ref={receiptRef} className="receipt" aria-label="Receipt">
        <div className="stack">
          <h2 className="page__title">Receipt</h2>
          <div className="summary">
            <div className="summary__row">
              <span className="muted">You received</span>
              <span className="summary__amount">{amount}</span>
            </div>
            <div className="summary__row">
              <span className="muted">Fee, flat, no interest</span>
              <span className="summary__amount">{formatIDRX(advance.feeCents)}</span>
            </div>
            <div className="summary__row">
              <span className="muted">Collected on Oct 21</span>
              <span className="summary__amount">{repay}</span>
            </div>
          </div>
          <button type="button" className="btn btn--secondary" onClick={() => receiptRef.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}
