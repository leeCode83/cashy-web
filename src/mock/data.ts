/**
 * Mock data — the single source for every figure shown in the demo
 * (brief §5: one consistent set of numbers across all screens). Amounts are
 * integer cents (1/100 IDRX); display goes through formatIDRX only.
 * All figures are demo values and may be tuned without touching screens.
 */

/** A creator's final AdSense balance once Google posts it (around the 3rd). */
export const creator = {
  name: 'Dewi',
  /** Final balance ready to cash out: 8,400,000.00 IDRX. */
  finalBalanceCents: 840_000_000,
  /** Bureau limit as a share of the final balance: 70% via AdSense. */
  limitBps: 7_000,
  /** Lower limit when verified through YouTube Analytics: 40%. */
  analyticsLimitBps: 4_000,
  /** Minimum cash-out in the demo: 100,000.00 IDRX. */
  minCashOutCents: 10_000_000,
  /** Day Google posts the final balance. */
  postedOn: 'Oct 3',
  /** Fixed Google payout day — the whole product hangs on this date. */
  payoutOn: 'Oct 21',
  /** On-time repayments shown in the credit record. */
  onTimeRepayments: 3,
} as const

/** Bureau limit for a balance, floored to whole cents. */
export function limitFor(balanceCents: number, bps: number): number {
  return Math.floor((balanceCents * bps) / 10_000)
}

/** Advance lifecycle (brief §7.5): Active → Repaid, with Repay Failed branch. */
export type AdvanceStatus = 'active' | 'repaid' | 'repay-failed'

/** One advance, from cash-out to repayment. */
export interface Advance {
  /** Amount received today, in cents. */
  principalCents: number
  /** Flat fee in cents. */
  feeCents: number
  /** Collected on the payout date: principal + fee, exactly. */
  repayCents: number
  status: AdvanceStatus
}

/** Row in the creator's activity list / history. */
export interface HistoryEntry {
  id: string
  /** ISO date, rendered with Intl.DateTimeFormat('en-US'). */
  date: string
  /** One-line description, e.g. `Cash out`. */
  label: string
  amountCents: number
  status: AdvanceStatus | 'posted'
}

/** Seeded history so the demo never shows an empty table uninvited. */
export const seedHistory: HistoryEntry[] = [
  { id: 'h1', date: '2026-09-21', label: 'Advance repaid', amountCents: 400_000_000, status: 'repaid' },
  { id: 'h2', date: '2026-08-21', label: 'Advance repaid', amountCents: 350_000_000, status: 'repaid' },
  { id: 'h3', date: '2026-07-21', label: 'Advance repaid', amountCents: 380_000_000, status: 'repaid' },
]

/** A vault tranche. Junior is never preselected and demands a risk ack. */
export type TierId = 'senior' | 'junior' | 'reserve'

export interface Tier {
  id: TierId
  name: string
  /** Estimated annual yield, in percent (9.0 = 9.0%). */
  yieldPct: number
  /** Short risk wording, e.g. `Lowest`. */
  risk: string
  /** Where this tier stands in the loss waterfall, plain words. */
  lossOrder: string
  /** Remaining deposit capacity in cents. */
  capacityLeftCents: number
}

export const tiers: Tier[] = [
  { id: 'senior', name: 'Senior', yieldPct: 9.0, risk: 'Lowest', lossOrder: 'Takes losses 3rd', capacityLeftCents: 4_000_000_000 },
  { id: 'junior', name: 'Junior', yieldPct: 18.0, risk: 'Highest', lossOrder: 'Takes losses 1st', capacityLeftCents: 1_000_000_000 },
  { id: 'reserve', name: 'Reserve', yieldPct: 4.0, risk: 'Low', lossOrder: 'Takes losses 2nd', capacityLeftCents: 1_500_000_000 },
]

/** Vault totals shown in the LP header. */
export const vault = {
  totalDepositedCents: 12_000_000_000,
  activeAdvances: 7,
  repaidOnTimePct: 98.4,
} as const

/** Mock LP wallet — the connected account. */
export const lpWallet = {
  address: '0x9f4b88e2c15a3d7e6b0a4c2f81d93e571a77',
  shortAddress: '0x9f4b…1a77',
  balanceCents: 2_500_000_000,
} as const

/** One LP position after a deposit. */
export interface LpPosition {
  tier: Tier['id']
  amountCents: number
  /** Accrued yield so far, in cents (static in the demo). */
  accruedCents: number
  status: 'deposited'
}

/** Live feed entries — proof for the judges, short plain words. */
export const liveFeed = {
  nullifiers: [
    { id: 'n1', label: 'Payout #A1F3 claimed. Can’t be funded again.', hash: '0x3f9a…c21e' },
    { id: 'n2', label: 'Payout #B7E2 claimed. Can’t be funded again.', hash: '0x81bd…44f0' },
    { id: 'n3', label: 'Payout #C9D1 claimed. Can’t be funded again.', hash: '0x2e6c…9a05' },
  ],
  advances: [
    { id: 'a1', label: 'Advance to 0x41c…9d2f', amountCents: 500_000_000 },
    { id: 'a2', label: 'Advance to 0x88a…10b4', amountCents: 225_000_000 },
    { id: 'a3', label: 'Repayment from 0x9f4b…1a77', amountCents: 625_000_000 },
  ],
} as const

/** Payout account the creator binds in Review (account ending in 4821). */
export const payoutAccount = { last4: '4821' } as const
