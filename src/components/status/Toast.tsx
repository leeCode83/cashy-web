/**
 * Toast — one-line success/info confirmations only (brief §7.2). Never used
 * for errors: errors must not disappear on their own. Auto-dismisses after
 * 5 s, pausing while hovered or focused; dismissible with a button; focus
 * never moves to the toast. Raise one with {@link useToast}.
 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, X } from '@phosphor-icons/react'
import { ToastContext } from './ToastContext.ts'

/** Delay before auto-dismiss, in ms. */
const TOAST_MS = 5_000

/**
 * Mount once near the app root. Renders the toast fixed at the bottom so it
 * never steals focus or blocks the main action area.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef<number | null>(null)

  const clear = (): void => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }

  const show = (text: string): void => {
    clear()
    setToast({ id: Date.now(), text })
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }

  useEffect(() => clear, [])

  const pause = (): void => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }
  const resume = (): void => {
    clear()
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }

  return (
    <ToastContext value={show}>
      {children}
      {toast && (
        <div
          className="toast"
          role="status"
          key={toast.id}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          <CheckCircle size={16} aria-hidden style={{ color: 'var(--ok)' }} />
          <p className="toast__text">{toast.text}</p>
          <button type="button" className="toast__close" aria-label="Dismiss" onClick={() => setToast(null)}>
            <X size={14} aria-hidden />
          </button>
        </div>
      )}
    </ToastContext>
  )
}
