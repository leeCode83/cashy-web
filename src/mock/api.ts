/**
 * Mock API — async stand-ins for the onchain flow with artificial pauses so
 * pending states are visible in the demo (brief §10). Every failure path is
 * reachable for the judges through `?demo=link-fail|funded|repay-fail`;
 * the parameter never appears in the UI.
 */

/** Demo scenario codes understood by the mock API. */
export type DemoCode = 'link-fail' | 'funded' | 'repay-fail'

/**
 * Demo scenario pinning. The query must work even after client-side
 * navigation strips it, so the scenario is captured once at module init —
 * at that moment the URL is exactly what the judge loaded — and stays
 * pinned for the session. A later `?demo=` in the URL re-pins it.
 */
const INITIAL_DEMO = new URLSearchParams(window.location.search).get('demo')
let pinnedScenario: DemoCode | null =
  INITIAL_DEMO === 'link-fail' || INITIAL_DEMO === 'funded' || INITIAL_DEMO === 'repay-fail' ? INITIAL_DEMO : null

/** Read the demo override for this session. */
export function demoScenario(): DemoCode | null {
  const value = new URLSearchParams(window.location.search).get('demo')
  if (value === 'link-fail' || value === 'funded' || value === 'repay-fail') pinnedScenario = value
  return pinnedScenario
}

/**
 * Artificial latency: 500–2500 ms unless overridden, so pending states are
 * clearly visible without feeling broken.
 */
export function delay(ms?: number): Promise<void> {
  const wait = ms ?? 500 + Math.random() * 2000
  return new Promise((resolve) => setTimeout(resolve, wait))
}

/** Error carrying a machine-readable scenario code for callers to branch on. */
export class MockError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export type VerifyMethod = 'adsense' | 'analytics'

/**
 * Simulated AdSense/Analytics verification. The zkTLS seal is prerecorded in
 * the demo; the result is all any screen ever sees — never the session.
 *
 * @returns The creator's final balance in cents.
 */
export async function verifyAdSense(method: VerifyMethod): Promise<{ finalBalanceCents: number; method: VerifyMethod }> {
  await delay()
  // Both methods read the same demo balance; only the limit differs.
  return { finalBalanceCents: 840_000_000, method }
}

/**
 * Bind the payout account (one tap; a wallet approval happens behind the
 * curtain). Fails when `?demo=link-fail` is set.
 */
export async function connectPayoutAccount(): Promise<void> {
  await delay()
  if (demoScenario() === 'link-fail') throw new MockError('link-fail')
}

/**
 * Submit the cash-out. Fails with the funded scenario when `?demo=funded`
 * is set — another lender has already advanced this payout.
 */
export async function submitCashOut(): Promise<void> {
  await delay()
  if (demoScenario() === 'funded') throw new MockError('funded')
}

/** Retry a failed auto-repay (demo `repay-fail` branch). Always succeeds. */
export async function retryRepayment(): Promise<void> {
  await delay()
}

/** Transaction hash shown for LP deposits in the demo. */
export const DEMO_TX_HASH = '0x3f9a…c21e'

/**
 * Simulated LP deposit. The caller drives the three visible phases
 * (confirm in wallet → waiting for confirmation → deposited); this just
 * occupies the chain for a beat and hands back the hash. The amount and
 * tier are the caller's bookkeeping — the demo chain accepts everything.
 */
export async function depositToVault(): Promise<{ hash: string }> {
  await delay()
  return { hash: DEMO_TX_HASH }
}
