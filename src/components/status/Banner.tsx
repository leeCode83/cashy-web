/**
 * Page banner — for conditions that persist above the content and never
 * dismiss themselves (brief §7.2). Errors use role="alert"; everything else
 * is a polite live region. Banners always offer an action when one exists.
 */
import { StatusIcon } from './StatusIcon.tsx'
import type { StatusKind } from './StatusKind.ts'

/** One primary action attached to the banner. */
export interface BannerAction {
  label: string
  onClick: () => void
}

/**
 * @param props.kind - Status kind; error banners announce assertively.
 * @param props.title - What happened (≤6 words).
 * @param props.body - Why, and what it means for the user's money.
 * @param props.action - Optional primary action.
 */
export function Banner({ kind, title, body, action }: {
  kind: StatusKind
  title: string
  body: string
  action?: BannerAction
}) {
  return (
    <div className={`banner tone--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <StatusIcon kind={kind} />
      <div className="banner__text">
        <p className="banner__title">{title}</p>
        {body !== '' && <p className="banner__body">{body}</p>}
      </div>
      {action && (
        <button type="button" className="btn btn--ghost" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
