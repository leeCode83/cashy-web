/**
 * POST /api/reclaim-verify — verify Reclaim proofs and hand out the verified
 * balance. Two callers hit this endpoint:
 *
 * - The Reclaim callback (JSON mode): a proof body plus the session id in
 *   the `X-Reclaim-Session-Id` header. The verified result is stored in
 *   memory, keyed by session id.
 * - Our frontend: `{ sessionId }` alone retrieves the stored result (the
 *   client retries briefly — the callback can land a beat after the browser
 *   learns the session finished), or `{ proof, sessionId }` verifies
 *   directly.
 *
 * A session id that already has a stored result rejects any new proof with
 * 409 `session_replayed` — in-memory replay protection, hackathon scale
 * (brief §9 keeps a durable store out of scope).
 */
import { ReclaimProofRequest, verifyProof, type Proof } from '@reclaimprotocol/js-sdk'
import {
  normalizeProofBody,
  parseProofBody,
  toVerifiedResult,
  type VerificationResult,
} from '../src/lib/reclaim-proof.ts'

/** Results per session — module scope, warm-lambda lifetime. */
const stored = new Map<string, VerificationResult>()

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function envMissing(): boolean {
  return !process.env.RECLAIM_APP_ID || !process.env.RECLAIM_APP_SECRET || !process.env.RECLAIM_PROVIDER_ID
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const raw = await req.text()
  const parsed = parseProofBody(raw)
  if (parsed === null) return json({ error: 'bad_request' }, 400)

  const headerSessionId = req.headers.get('x-reclaim-session-id')
  const { proofs, sessionId } = normalizeProofBody(parsed, headerSessionId)

  // Retrieval mode: no proof attached, ask what the callback stored.
  if (proofs.length === 0) {
    if (!sessionId) return json({ error: 'bad_request' }, 400)
    const result = stored.get(sessionId)
    if (!result) return json({ error: 'pending' }, 404)
    return json(result)
  }

  if (envMissing()) return json({ error: 'env_missing' }, 500)
  if (sessionId && stored.has(sessionId)) return json({ error: 'session_replayed' }, 409)

  try {
    const proofRequest = await ReclaimProofRequest.init(
      process.env.RECLAIM_APP_ID as string,
      process.env.RECLAIM_APP_SECRET as string,
      process.env.RECLAIM_PROVIDER_ID as string,
    )
    const outcome = await verifyProof(proofs as Proof[], proofRequest.getProviderVersion())
    const result = outcome.isVerified ? toVerifiedResult(outcome.data) : ({ verified: false } as const)
    if (sessionId && result.verified) stored.set(sessionId, result)
    return json(result.verified ? result : { verified: false, error: 'proof_invalid' })
  } catch (err) {
    console.error('reclaim-verify: proof verification threw:', err)
    return json({ verified: false, error: 'proof_invalid' })
  }
}
