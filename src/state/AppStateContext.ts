/**
 * Session state contract — split from the provider file so fast refresh
 * only sees the provider component. Screens import `useAppState` from here.
 */
import { createContext, useContext } from 'react'
import type { BalanceSource } from '../lib/reclaim-proof.ts'
import type { Advance, HistoryEntry, LpPosition } from '../mock/data.ts'
import type { VerifyMethod } from '../mock/api.ts'

/** Everything the demo needs across screens, in memory only. */
export interface AppState {
  /** AdSense (or Analytics) verification result for this session. */
  verifiedMethod: VerifyMethod | null
  /** Balance proven this session, in cents — zkTLS proof or pinned demo. */
  verifiedBalanceCents: number | null
  /** Where the proven balance came from; screens may badge provenance. */
  balanceSource: BalanceSource | null
  /** The live advance, or null when none is active. */
  advance: Advance | null
  /** Activity feed, newest first. */
  history: HistoryEntry[]
  /** LP wallet connection (mock). */
  lpConnected: boolean
  /** LP positions per tier. */
  lpPositions: LpPosition[]
  /** Raw text of the amount input, kept so Back never clears it. */
  amountDraft: string
}

/** Actions the app can perform on session state. */
export interface AppActions {
  setVerifiedMethod: (method: VerifyMethod) => void
  /** Record the proven balance together with the source that produced it. */
  setVerifiedBalance: (cents: number, source: BalanceSource) => void
  setAmountDraft: (draft: string) => void
  /** Record a new advance and log the cash-out in history. */
  startAdvance: (advance: Advance) => void
  /** Mark the active advance repaid and log it. */
  markRepaid: (repayCents: number) => void
  setLpConnected: (connected: boolean) => void
  /** Add a deposit to a tier, or grow the existing position there. */
  addPosition: (position: LpPosition) => void
}

/** Internal context; see {@link ../state/AppState.AppStateProvider}. */
export const AppContext = createContext<(AppState & AppActions) | null>(null)

/**
 * Access session state and actions. Throws when used outside the provider —
 * a programming error we want to see immediately.
 */
export function useAppState(): AppState & AppActions {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
