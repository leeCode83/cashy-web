/**
 * POST /api/reclaim-request — mint a Reclaim proof-request config for the
 * browser. Secrets live here only: the app secret never leaves the server,
 * the browser receives the serialized request via `{ config }` and feeds it
 * to `ReclaimProofRequest.fromJsonString` (see `src/lib/zktls.ts`).
 *
 * Proofs come back server-side through the app callback URL (JSON mode), so
 * this function must run where the URL is publicly reachable — i.e. the
 * Vercel deployment, not `vite dev`.
 */
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk'

/** Uniform error envelope for every endpoint (see the zktls brief §5). */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * Origin as seen from the public internet. Vercel fronts requests with a
 * proxy, so the forwarded headers — not `req.url` — carry the real scheme
 * and host that Reclaim must call back.
 */
function publicOrigin(req: Request): string {
  const url = new URL(req.url)
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? url.host
  return `${proto}://${host}`
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const appId = process.env.RECLAIM_APP_ID
  const appSecret = process.env.RECLAIM_APP_SECRET
  const providerId = process.env.RECLAIM_PROVIDER_ID
  if (!appId || !appSecret || !providerId) return json({ error: 'env_missing' }, 500)

  try {
    const proofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId)
    // JSON mode: proofs arrive at /api/reclaim-verify as a JSON body with the
    // session id in the X-Reclaim-Session-Id header.
    proofRequest.setAppCallbackUrl(`${publicOrigin(req)}/api/reclaim-verify`, true)
    return json({ config: proofRequest.toJsonString() })
  } catch (err) {
    console.error('reclaim-request: init failed:', err)
    return json({ error: 'reclaim_init_failed' }, 500)
  }
}
