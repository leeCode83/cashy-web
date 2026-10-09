/**
 * Runnable checks for the zkTLS proof path — the one place where a wrong
 * balance or a replayed proof would surface to users. Run with `npm test`
 * (plain node, no framework). The figures mirror the mock AdSense page:
 * final balance 8.400.000 IDRX = 840.000.000 cents.
 */
import {
  balanceSourceFromResult,
  extractBalanceCents,
  normalizeProofBody,
  parseBalanceToCents,
  parseProofBody,
  toVerifiedResult,
} from './reclaim-proof.ts'

/** Compare and throw a labeled error on mismatch — keeps the file dependency-free. */
function check(label: string, actual: unknown, expected: unknown): void {
  const left = JSON.stringify(actual)
  const right = JSON.stringify(expected)
  if (left !== right) {
    throw new Error(`${label}: expected ${right}, got ${left}`)
  }
}

// Balance text parsing: every shape the mock page or a locale could emit.
check('idr dotted', parseBalanceToCents('IDRX 8.400.000'), 840_000_000)
check('en-us commas', parseBalanceToCents('8,400,000'), 840_000_000)
check('plain digits', parseBalanceToCents('8400000'), 840_000_000)
check('with decimals', parseBalanceToCents('8.400.000,00'), 840_000_000)
check('nbsp padded', parseBalanceToCents('\u00A08.400.000\u00A0IDRX'), 840_000_000)
check('inside sentence', parseBalanceToCents('saldo akhir: 8.400.000 IDRX terkunci'), 840_000_000)
check('zero', parseBalanceToCents('0'), 0)
check('no digits', parseBalanceToCents('IDRX saja'), null)

// Extractor: tolerant across the shapes a proof takes along the flow.
check(
  'extract from extractedParameters',
  extractBalanceCents({ extractedParameters: { balance: '8.400.000' } }),
  840_000_000,
)
check(
  'extract from claimData.parameters',
  extractBalanceCents({ claimData: { parameters: { balance: '8,400,000' } } }),
  840_000_000,
)
check(
  'extract numeric balance',
  extractBalanceCents({ parameters: { balance: 8_400_000 } }),
  840_000_000,
)
check('extract rejects non-object', extractBalanceCents('8.400.000'), null)
check('extract rejects missing balance', extractBalanceCents({ extractedParameters: {} }), null)
check('extract rejects digitless balance', extractBalanceCents({ extractedParameters: { balance: 'IDRX' } }), null)

// Result mapping: first parseable proof wins, empty means unverified.
check(
  'result first good proof wins',
  toVerifiedResult([{ extractedParameters: { balance: 'oops' } }, { extractedParameters: { balance: '8.400.000' } }]),
  { verified: true, finalBalanceCents: 840_000_000 },
)
check('result empty proofs', toVerifiedResult([]), { verified: false })
check('source zktls on verified', balanceSourceFromResult({ verified: true, finalBalanceCents: 1 }), 'zktls')
check('source null on unverified', balanceSourceFromResult({ verified: false }), null)

// Body parsing: frontend JSON, URL-encoded callback, form body, garbage.
const proof = { extractedParameters: { balance: '8.400.000' } }
check('parse plain json', parseProofBody('{"a":1}'), { a: 1 })
check('parse urlencoded once', parseProofBody(encodeURIComponent('{"a":1}')), { a: 1 })
check('parse urlencoded twice', parseProofBody(encodeURIComponent(encodeURIComponent('{"a":1}'))), { a: 1 })
check(
  'parse form body',
  parseProofBody(`proof=${encodeURIComponent(JSON.stringify(proof))}&extra=1`),
  proof,
)
check('parse garbage', parseProofBody('%%% not anything'), null)

// Normalization: which container holds the proofs, which id wins.
check(
  'normalize frontend shape',
  normalizeProofBody({ proof, sessionId: 's1' }, null),
  { proofs: [proof], sessionId: 's1' },
)
check(
  'normalize header beats body',
  normalizeProofBody({ proof, sessionId: 'body' }, 'header'),
  { proofs: [proof], sessionId: 'header' },
)
check(
  'normalize raw callback proof',
  normalizeProofBody({ claimData: {}, signatures: [] }, 's2'),
  { proofs: [{ claimData: {}, signatures: [] }], sessionId: 's2' },
)
check(
  'normalize retrieval mode',
  normalizeProofBody({ sessionId: 's3' }, null),
  { proofs: [], sessionId: 's3' },
)

// Round trip: exactly what the Reclaim callback puts on the wire.
const wire = encodeURIComponent(JSON.stringify({ proofs: [proof] }))
const roundTrip = normalizeProofBody(parseProofBody(wire), 'sess-1')
check('round trip proofs', roundTrip.proofs.length, 1)
check('round trip session', roundTrip.sessionId, 'sess-1')
check('round trip balance', toVerifiedResult(roundTrip.proofs), {
  verified: true,
  finalBalanceCents: 840_000_000,
})

console.log('zkTLS proof path: all checks passed')
