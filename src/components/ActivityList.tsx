/**
 * Transaction log — every recorded event (verification, balance posting,
 * cash-outs, repayments) with its outcome. Ledger rows on desktop, stacked
 * cards under 640 px. Shared by the dashboard (filterable) and the History
 * page (full list), so status wording and formatting never drift.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowsClockwise,
  CalendarCheck,
  Fingerprint,
  HandCoins,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { StatusChip } from './status/index.ts'
import type { StatusKind } from './status/index.ts'
import type { HistoryEntry, HistoryKind } from '../mock/data.ts'
import { formatIDRX } from '../lib/money.ts'

/** Icon per event kind; glyphs match what actually happened. */
const KIND_ICON: Record<HistoryKind, Icon> = {
  verification: Fingerprint,
  balance: CalendarCheck,
  'cash-out': HandCoins,
  repayment: ArrowsClockwise,
}

/** Map a log entry to its chip kind and word (brief §7.5: same words everywhere). */
function chipFor(entry: HistoryEntry): { kind: StatusKind; label: string } {
  switch (entry.status) {
    case 'repaid':
      return { kind: 'success', label: 'Repaid' }
    case 'active':
      return { kind: 'info', label: 'Active' }
    case 'posted':
      return { kind: 'pending', label: 'Posted' }
    case 'verified':
      return { kind: 'success', label: 'Verified' }
    case 'success':
      return { kind: 'success', label: 'Success' }
    case 'rejected':
      return { kind: 'error', label: 'Rejected' }
    case 'repay-failed':
      return { kind: 'error', label: 'Repay failed' }
  }
}

/** Money presentation: sign money that moved, mute money that did not. */
function amountFor(entry: HistoryEntry): { text: string; muted: boolean } {
  if (entry.amountCents === 0) return { text: '', muted: true }
  const text =
    entry.status === 'success' && entry.amountCents > 0
      ? `+${formatIDRX(entry.amountCents)}`
      : entry.amountCents < 0
        ? `−${formatIDRX(-entry.amountCents)}`
        : formatIDRX(entry.amountCents)
  return { text, muted: entry.status === 'rejected' || entry.status === 'posted' }
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cash-out', label: 'Cash outs' },
  { id: 'repayment', label: 'Repayments' },
  { id: 'verification', label: 'Verification' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

function matches(entry: HistoryEntry, filter: FilterId): boolean {
  if (filter === 'all') return true
  if (filter === 'verification') return entry.kind === 'verification' || entry.kind === 'balance'
  return entry.kind === filter
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/**
 * @param props.entries - Rows, newest first.
 * @param props.limit - Show only the first N rows.
 * @param props.filterable - Render the kind filter chips (dashboard).
 * @param props.viewAllTo - When set, renders a View All link under the rows.
 */
export function ActivityList({ entries, limit, filterable, viewAllTo }: {
  entries: HistoryEntry[]
  limit?: number
  filterable?: boolean
  viewAllTo?: string
}) {
  const [filter, setFilter] = useState<FilterId>('all')
  const visible = entries.filter((entry) => matches(entry, filter))
  const rows = limit !== undefined ? visible.slice(0, limit) : visible

  return (
    <div className="stack">
      {filterable && (
        <div className="log__filters" role="group" aria-label="Filter activity">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`chip-btn${filter === option.id ? ' chip-btn--active' : ''}`}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="muted">
          {filter === 'all'
            ? 'No activity yet. Your first cash-out will appear here.'
            : `No ${FILTERS.find((option) => option.id === filter)?.label.toLowerCase()} yet.`}
        </p>
      ) : (
        <ul className="log__list">
          {rows.map((entry) => (
            <LogRow entry={entry} key={entry.id} />
          ))}
        </ul>
      )}
      {viewAllTo && (
        <Link className="linklike" to={viewAllTo}>
          View All
        </Link>
      )}
    </div>
  )
}

/** One ledger row: icon, label + outcome chip, detail, amount + date. */
function LogRow({ entry }: { entry: HistoryEntry }) {
  const chip = chipFor(entry)
  const amount = amountFor(entry)
  const Icon = KIND_ICON[entry.kind]
  const failed = entry.status === 'rejected' || entry.status === 'repay-failed'
  return (
    <li className={`log__row${failed ? ' log__row--failed' : ''}`}>
      <span className="log__icon" aria-hidden>
        <Icon size={18} />
      </span>
      <span className="log__main">
        <span className="log__label">
          {entry.label}
          <StatusChip kind={chip.kind} label={chip.label} />
        </span>
        <span className="log__detail small">{entry.detail}</span>
      </span>
      <span className="log__meta">
        {amount.text && (
          <span className={`log__amount u-mono${amount.muted ? ' log__amount--muted' : ''}`}>
            {amount.text}
          </span>
        )}
        <span className="log__date small u-mono">{dateFormat.format(new Date(entry.date))}</span>
      </span>
    </li>
  )
}
