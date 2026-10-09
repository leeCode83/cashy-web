/**
 * Activity list — the creator's history as a table on desktop that becomes
 * a card list under 640 px, with expandable rows for detail (brief §6.6).
 * Shared by the dashboard preview (last 5) and the History page (all rows),
 * so status wording and formatting can never drift between them.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import { CaretDown } from '@phosphor-icons/react'
import { StatusChip } from './status/index.ts'
import type { StatusKind } from './status/index.ts'
import type { HistoryEntry } from '../mock/data.ts'
import { formatIDRX } from '../lib/money.ts'

/** Map a history entry to its chip kind and word (brief §7.5: same words everywhere). */
function chipFor(entry: HistoryEntry): { kind: StatusKind; label: string } {
  switch (entry.status) {
    case 'repaid':
      return { kind: 'success', label: 'Repaid' }
    case 'active':
      return { kind: 'info', label: 'Active' }
    case 'posted':
      return { kind: 'pending', label: 'Posted' }
    case 'repay-failed':
      return { kind: 'error', label: 'Repay failed' }
  }
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/**
 * @param props.entries - Rows, newest first.
 * @param props.limit - Show only the first N rows.
 * @param props.viewAllTo - When set, renders a View All link under the rows.
 */
export function ActivityList({ entries, limit, viewAllTo }: {
  entries: HistoryEntry[]
  limit?: number
  viewAllTo?: string
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const rows = limit !== undefined ? entries.slice(0, limit) : entries

  if (entries.length === 0) {
    return <p className="muted">No activity yet. Your first cash-out will appear here.</p>
  }

  return (
    <div className="stack">
      <table className="activity">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Activity</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="visually-hidden">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => {
            const chip = chipFor(entry)
            const open = openId === entry.id
            return (
              <FragmentRow
                key={entry.id}
                entry={entry}
                chip={chip}
                open={open}
                onToggle={() => setOpenId(open ? null : entry.id)}
              />
            )
          })}
        </tbody>
      </table>
      {viewAllTo && (
        <Link className="linklike" to={viewAllTo}>
          View All
        </Link>
      )}
    </div>
  )
}

/** A row plus its expandable detail row, kept together. */
function FragmentRow({ entry, chip, open, onToggle }: {
  entry: HistoryEntry
  chip: { kind: StatusKind; label: string }
  open: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr className={open ? 'activity__row--open' : undefined}>
        <td data-label="Date">{dateFormat.format(new Date(entry.date))}</td>
        <td data-label="Activity">{entry.label}</td>
        <td data-label="Amount" className="u-mono">
          {formatIDRX(entry.amountCents)}
        </td>
        <td data-label="Status">
          <StatusChip kind={chip.kind} label={chip.label} />
        </td>
        <td>
          <button
            type="button"
            className="activity__toggle"
            aria-expanded={open}
            aria-label={open ? `Hide details for ${entry.label}` : `Show details for ${entry.label}`}
            onClick={onToggle}
          >
            <CaretDown size={16} aria-hidden style={open ? { transform: 'rotate(180deg)' } : undefined} />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="activity__detail">
          <td colSpan={5}>
            {entry.status === 'active'
              ? 'We collect the repayment from your linked payout account on Oct 21, when your payout arrives.'
              : entry.status === 'posted'
                ? 'Google posted your final balance for this month.'
                : entry.status === 'repaid'
                  ? 'Collected automatically from your linked payout account on time.'
                  : 'The collection didn’t go through. Retry from your dashboard before Oct 23.'}
          </td>
        </tr>
      )}
    </>
  )
}
