/**
 * Browser client for the Reclaim zkTLS flow (brief §3): fetch a proof
 * request config from the server, run the verification flow (browser
 * extension when present, Reclaim portal in a new tab otherwise), then read
 * the verified balance back from `/api/reclaim-verify` — proofs arrive
 * server-side through the callback URL, so the browser polls by session id.
 *
 * Throws {@link ZkTlsError} carrying a typed {@link ZkTlsFailure} so the
 * caller (Verify page) can map each failure to its own UI phase.
 */
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk'
import type { VerificationResult } from './reclaim-proof.ts'

/** Why a zkTLS verification did not produce a balance. */
export type ZkTlsFailure =
  | { code: 'config_unavailable' }
  | { code: 'flow_rejected'; message: string }
  | { code: 'balance_missing' }
  | { code: 'verification_timeout' }

/** Typed error carrying the failure — never a bare string/unknown throw. */
export class ZkTlsError extends Error {
  readonly failure: ZkTlsFailure

  constructor(failure: ZkTlsFailure) {
    super(failure.code === 'flow_rejected' ? failure.message : failure.code)
    this.name = 'ZkTlsError'
    this.failure = failure
  }
}

/** Retrieval poll cadence: 12 × 1.5s ≈ 18s ceiling; the UI's slow phase covers 10s+. */
const POLL_MS = 1_500
const POLL_MAX = 12

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Run one AdSense zkTLS verification end to end.
 *
 * @returns The verified final balance in integer cents (1/100 IDRX).
 * @throws ZkTlsError with a typed failure for every non-success path.
 */
export async function verifyAdSenseZk(): Promise<{ finalBalanceCents: number }> {
  const configRes = await fetch('/api/reclaim-request', { method: 'POST' })
  if (!configRes.ok) throw new ZkTlsError({ code: 'config_unavailable' })
  const { config } = (await configRes.json()) as { config?: string }
  if (typeof config !== 'string') throw new ZkTlsError({ code: 'config_unavailable' })

  const request = await ReclaimProofRequest.fromJsonString(config)
  const sessionId = request.getSessionId()

  if (await request.isBrowserExtensionAvailable()) {
    await request.triggerReclaimFlow()
  } else {
    // Portal mode: the user completes verification in a new tab.
    window.open(await request.getRequestUrl(), '_blank', 'noopener')
  }

  // With the callback URL set, proofs go to the server; the browser only
  // learns that the session finished (onSuccess may pass an empty array).
  let flowError: unknown = null
  await request.startSession({
    onSuccess: () => {},
    onError: (err) => {
      flowError = err
    },
  })
  if (flowError !== null) {
    throw new ZkTlsError({ code: 'flow_rejected', message: messageOf(flowError) })
  }

  // The callback can land a beat behind onSuccess — poll briefly.
  for (let attempt = 0; attempt < POLL_MAX; attempt++) {
    const poll = await fetch('/api/reclaim-verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (poll.ok) {
      const result = (await poll.json()) as VerificationResult
      if (result.verified) return { finalBalanceCents: result.finalBalanceCents }
      throw new ZkTlsError({ code: 'balance_missing' })
    }
    if (poll.status !== 404) throw new ZkTlsError({ code: 'config_unavailable' })
    await delay(POLL_MS)
  }
  throw new ZkTlsError({ code: 'verification_timeout' })
}
