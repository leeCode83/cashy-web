/**
 * Cash-out shell — the stepper plus the routed step (brief §6.3). The
 * stepper always shows where you are; completed steps link back, future
 * steps are inert. Each step page guards its own prerequisites.
 */
import { Link, Outlet, useLocation } from 'react-router'
import { CheckCircle, ClipboardText, Coins, SealCheck } from '@phosphor-icons/react'
import { useAppState } from '../../../state/AppStateContext.ts'

const BASE = '/creator/cash-out'

/** The four steps of the flow, in order. */
const STEPS = [
  { segment: 'verify', label: 'Verify', Icon: SealCheck },
  { segment: 'amount', label: 'Amount', Icon: Coins },
  { segment: 'review', label: 'Review', Icon: ClipboardText },
  { segment: 'done', label: 'Done', Icon: CheckCircle },
] as const

export default function CashOutLayout() {
  const { verifiedMethod } = useAppState()
  const { pathname } = useLocation()

  const current = STEPS.findIndex((step) => pathname.includes(step.segment))

  return (
    <div className="container page cashout">
      <nav className="stepper" aria-label="Cash out progress">
        {STEPS.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'active' : 'todo'
          const reachable = index <= current || (index === 1 && verifiedMethod !== null)
          const body = (
            <>
              <span className="stepper__icon">
                {state === 'done' ? <CheckCircle size={16} aria-hidden /> : <step.Icon size={16} aria-hidden />}
              </span>
              {step.label}
            </>
          )
          return (
            <span className="stepper__item" key={step.segment}>
              {index > 0 && (
                <span className="stepper__sep" aria-hidden>
                  ·
                </span>
              )}
              {reachable ? (
                <Link
                  to={`${BASE}/${step.segment}`}
                  className={`stepper__step stepper__step--${state}`}
                  aria-current={state === 'active' ? 'step' : undefined}
                >
                  {body}
                </Link>
              ) : (
                <span className={`stepper__step stepper__step--${state}`} aria-disabled>
                  {body}
                </span>
              )}
            </span>
          )
        })}
      </nav>
      <Outlet />
    </div>
  )
}
