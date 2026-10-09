/**
 * Pure proof parsing for the Reclaim zkTLS flow — no network, no SDK
 * imports, so the tests run on plain node and every shape below is
 * structural. Lives in src/lib because both the serverless endpoints
 * (`api/reclaim-verify.ts`) and the browser client (`zktls.ts`) must agree
 * on the same shapes.
 */
import { parseIDRXInput } from './money.ts'

/** Where the balance number the app displays came from. */
export type BalanceSource = 'zktls' | 'mock'

/** The verified-balance answer, in the shape of the HTTP contract. */
export type VerificationResult = { verified: true; finalBalanceCents: number } | { verified: false }

/** Body of `/api/reclaim-verify` after both wire formats are normalized. */
export interface ParsedProofBody {
  proofs: unknown[]
  sessionId: string | null
}

/** First digit run in the text, read as IDRX cents: `'IDRX 8.400.000'` → 840000000. */
export function parseBalanceToCents(raw: string): number | null {
  const match = raw.match(/[\d][\d.,\u00A0 ]*[\d]|[\d]/)
  return match ? parseIDRXInput(match[0]) : null
}

/** Read the first numeric-looking `balance` entry from an unknown-shape bag. */
function balanceFromBag(bag: unknown): string | null {
  if (typeof bag !== 'object' || bag === null) return null
  const value = (bag as Record<string, unknown>)['balance']
  if (typeof value === 'string' && /\d/.test(value)) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

/**
 * Pull the verified balance out of one proof. Candidates in priority order:
 * `extractedParameters` (what `verifyProof` returns), `claimData.parameters`
 * (the raw regex captures) and `parameters` (callback shape) — any of them
 * may be present depending on which side of the flow the proof crossed.
 *
 * @returns Integer cents, or null when no candidate holds a parseable balance.
 */
export function extractBalanceCents(proof: unknown): number | null {
  if (typeof proof !== 'object' || proof === null) return null
  const bag = proof as Record<string, unknown>
  const claimData =
    typeof bag['claimData'] === 'object' && bag['claimData'] !== null
      ? (bag['claimData'] as Record<string, unknown>)
      : undefined
  for (const candidate of [bag['extractedParameters'], claimData?.['parameters'], bag['parameters']]) {
    const raw = balanceFromBag(candidate)
    if (raw !== null) return parseBalanceToCents(raw)
  }
  return null
}

function isProofLike(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  return ['claimData', 'extractedParameters', 'identifiers', 'signatures'].some((key) => key in (value as object))
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** `decodeURIComponent` that returns the input instead of throwing on bad escapes. */
function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/**
 * Parse a `/api/reclaim-verify` request body. Two wire formats arrive: the
 * Reclaim callback (URL-encoded JSON, sometimes double-encoded, or a form
 * body with a `proof` field) and our own frontend JSON. Every reading is
 * attempted; null means the body is garbage and the caller answers 400.
 */
export function parseProofBody(raw: string): unknown {
  const attempts = [raw]
  let decoded = raw
  for (let i = 0; i < 2; i++) {
    const next = safeDecode(decoded)
    if (next === decoded) break
    decoded = next
    attempts.push(decoded)
  }
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt)
    } catch {
      // try the next representation
    }
  }
  // Form-encoded callback: proof=%7B...%7D
  const params = new URLSearchParams(raw)
  if (params.has('proof')) {
    try {
      return JSON.parse(params.get('proof') ?? '')
    } catch {
      // fall through
    }
  }
  return null
}

/**
 * Normalize a parsed body into proofs plus a session id. The session id may
 * come from the `X-Reclaim-Session-Id` header (callback path), the body, or
 * ride on the proof itself.
 */
export function normalizeProofBody(parsed: unknown, headerSessionId: string | null): ParsedProofBody {
  if (typeof parsed !== 'object' || parsed === null) return { proofs: [], sessionId: headerSessionId }
  const bag = parsed as Record<string, unknown>

  const sessionId =
    headerSessionId ?? asString(bag['sessionId']) ?? asString(bag['identifier']) ?? null

  const direct = bag['proof'] ?? bag['proofs']
  let proofs: unknown[]
  if (Array.isArray(direct)) proofs = direct
  else if (direct !== undefined && direct !== null) proofs = [direct]
  else if (isProofLike(parsed)) proofs = [parsed]
  else proofs = []

  return { proofs, sessionId }
}

/**
 * Verify-shaped mapping from proofs to the app answer: the first proof that
 * yields a balance wins. `verified: false` is the "proof invalid" branch —
 * it is a 200 response, not a transport error.
 */
export function toVerifiedResult(proofs: unknown[]): VerificationResult {
  for (const proof of proofs) {
    const cents = extractBalanceCents(proof)
    if (cents !== null) return { verified: true, finalBalanceCents: cents }
  }
  return { verified: false }
}

/** Which source tag the app state should record for a verification result. */
export function balanceSourceFromResult(result: VerificationResult): BalanceSource | null {
  return result.verified ? 'zktls' : null
}
