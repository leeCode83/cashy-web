/**
 * Status chip — icon + label for entity states in lists and headers
 * (brief §7.2). Always icon and text together; never color alone.
 */
import { StatusIcon } from './StatusIcon.tsx'
import type { StatusKind } from './StatusKind.ts'

/**
 * @param props.kind - Status kind; picks the tone class and icon.
 * @param props.label - Short status text, same word used everywhere for the
 *   same state (brief §7.5).
 */
export function StatusChip({ kind, label }: { kind: StatusKind; label: string }) {
  return (
    <span className={`chip tone--${kind}`}>
      <StatusIcon kind={kind} size={14} />
      {label}
    </span>
  )
}
