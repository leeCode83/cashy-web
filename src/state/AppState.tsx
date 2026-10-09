/**
 * Session state — in-memory only, shared across routes so the Back button
 * never loses a draft and the dashboard reflects what the flow just did
 * (brief §3: state lives in app memory). Nothing here persists; a refresh
 * resets the demo, which is exactly what a demo wants.
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { seedHistory } from '../mock/data.ts'
import type { Advance, HistoryEntry, LpPosition } from '../mock/data.ts'
import type { VerifyMethod } from '../mock/api.ts'
import { AppContext } from './AppStateContext.ts'

let historyId = 0
const nextHistoryId = (): string => `h${(historyId += 1)}`

/**
 * Mount once around the router. Seeds history with three past repayments so
 * credit record and history have content on first load.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [verifiedMethod, setVerifiedMethod] = useState<VerifyMethod | null>(null)
  const [advance, setAdvance] = useState<Advance | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(seedHistory)
  const [lpConnected, setLpConnected] = useState(false)
  const [lpPositions, setLpPositions] = useState<LpPosition[]>([])

  const startAdvance = (newAdvance: Advance): void => {
    setAdvance(newAdvance)
    setHistory((rows) => [
      { id: nextHistoryId(), date: new Date().toISOString(), label: 'Cash out', amountCents: newAdvance.principalCents, status: 'active' },
      ...rows,
    ])
  }

  const markRepaid = (repayCents: number): void => {
    setAdvance((current) => (current ? { ...current, status: 'repaid' } : current))
    setHistory((rows) => [
      { id: nextHistoryId(), date: new Date().toISOString(), label: 'Advance repaid', amountCents: repayCents, status: 'repaid' },
      ...rows,
    ])
  }

  const addPosition = (position: LpPosition): void => {
    setLpPositions((rows) => {
      const existing = rows.find((row) => row.tier === position.tier)
      if (!existing) return [...rows, position]
      return rows.map((row) =>
        row.tier === position.tier
          ? { ...row, amountCents: row.amountCents + position.amountCents, accruedCents: row.accruedCents + position.accruedCents }
          : row,
      )
    })
  }

  return (
    <AppContext
      value={{
        verifiedMethod,
        setVerifiedMethod,
        advance,
        startAdvance,
        markRepaid,
        history,
        lpConnected,
        setLpConnected,
        lpPositions,
        addPosition,
      }}
    >
      {children}
    </AppContext>
  )
}
