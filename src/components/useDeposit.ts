/**
 * Deposit orchestration hook — drives the three visible phases of a deposit
 * (confirm in wallet → waiting for confirmation → done) against the mock
 * API and hands the result back to the Vault screen.
 */
import { useState } from 'react'
import { depositToVault } from '../mock/api.ts'
import type { TierId } from '../mock/data.ts'
import type { LpPosition } from '../mock/data.ts'

/** Phases of the deposit flow; `idle` shows the form. */
export type DepositPhase = 'idle' | 'wallet' | 'pending'

/** What the hook returns to the screen. */
export interface DepositFlow {
  phase: DepositPhase
  hash: string | null
  /** Kick off a deposit of this size into this tier. */
  run: (amountCents: number, tier: TierId) => Promise<LpPosition>
  /** Return to the form after a finished or abandoned run. */
  reset: () => void
}

/** Beat for the fake wallet confirmation, in ms. */
const WALLET_MS = 1_500

export function useDeposit(): DepositFlow {
  const [phase, setPhase] = useState<DepositPhase>('idle')
  const [hash, setHash] = useState<string | null>(null)

  const run = async (amountCents: number, tier: TierId): Promise<LpPosition> => {
    setPhase('wallet')
    await new Promise((resolve) => setTimeout(resolve, WALLET_MS))
    setPhase('pending')
    const result = await depositToVault()
    setHash(result.hash)
    return { tier, amountCents, accruedCents: 0, status: 'deposited' }
  }

  const reset = (): void => {
    setPhase('idle')
    setHash(null)
  }

  return { phase, hash, run, reset }
}
