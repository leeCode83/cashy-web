/**
 * Status card — results and progress inside a flow step (Verify, Review,
 * Done, LP deposit). It replaces the action area while a step is in flight,
 * so there is exactly one thing to read and one thing to do (brief §7.2).
 */
import type { ReactNode } from 'react'
import { StatusIcon } from './StatusIcon.tsx'
import type { StatusKind } from './StatusKind.ts'

/**
 * @param props.kind - Status kind; error cards announce assertively.
 * @param props.title - What happened (≤6 words).
 * @param props.body - Why, and what it means for the user's money.
 * @param props.children - Optional actions and secondary links below the text.
 */
export function StatusCard({ kind, title, body, children }: {
  kind: StatusKind
  title: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className={`status-card tone--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <StatusIcon kind={kind} size={24} />
      <div className="status-card__text">
        <p className="status-card__title">{title}</p>
        {body !== '' && <p className="status-card__body">{body}</p>}
      </div>
      {children && <div className="status-card__actions">{children}</div>}
    </div>
  )
}
