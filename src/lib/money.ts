/**
 * Money primitives for the Cashy demo.
 *
 * Every amount is stored as an integer number of cents (1/100 IDRX) so no
 * floating point error can reach the screen. Display always goes through
 * {@link formatIDRX}; fee math always goes through {@link feeFor} and
 * {@link repayFor}, so figures shown next to each other always add up.
 *
 * Numbers use the Indonesian convention everywhere — dots for thousands,
 * comma for decimals (`5.000.000,00 IDRX`) — in displays and in inputs
 * alike, so what the user types always looks like what the app shows.
 */

/** Flat advance fee in basis points: 250 = 2.5%. It is a fee, never interest. */
export const FEE_BPS = 250

const GROUPING = new Intl.NumberFormat('id-ID')

/** Integer part and optional fraction (≤2 digits) of a cleaned input string. */
interface AmountParts {
  intDigits: string
  fracDigits: string | null
}

/**
 * Split cleaned input (digits and `.`/`,` only) into integer and fraction
 * digit runs. The Indonesian shape — dots as grouping, comma as decimal —
 * is canonical; other habits survive a paste. A separator counts as the
 * decimal mark when at most two digits follow it, or when it is a lone
 * comma: that lone comma is always someone typing decimals one keystroke
 * at a time, and re-reading it as grouping would silently multiply the
 * amount by a thousand mid-typing.
 */
function amountParts(clean: string): AmountParts {
  const lastIdx = Math.max(clean.lastIndexOf('.'), clean.lastIndexOf(','))
  if (lastIdx < 0) return { intDigits: clean, fracDigits: null }
  const after = clean.slice(lastIdx + 1)
  const sepCount = (clean.match(/[.,]/g) ?? []).length
  const isComma = clean[lastIdx] === ','
  // A lone comma is someone typing decimals one keystroke at a time; a comma
  // after dot-grouping is the canonical decimal mark. Re-reading either as
  // grouping would silently multiply the amount by a thousand mid-typing.
  const commaIsDecimal = isComma && (sepCount === 1 || clean.slice(0, lastIdx).includes('.'))
  if (after.length <= 2 || commaIsDecimal) {
    return {
      intDigits: clean.slice(0, lastIdx).replace(/[.,]/g, ''),
      fracDigits: after.replace(/\D/g, '').slice(0, 2),
    }
  }
  return { intDigits: clean.replace(/[.,]/g, ''), fracDigits: null }
}

/**
 * Format a cents amount as an IDRX figure: `12.500.000,00 IDRX`.
 * Dots group thousands, a comma precedes the two decimals, and the space
 * before the unit is non-breaking so a figure never wraps away from its unit.
 *
 * @param cents - Amount in integer cents (1/100 IDRX).
 * @returns Display string, e.g. `'8.400.000,00\u00A0IDRX'`.
 */
export function formatIDRX(cents: number): string {
  const whole = Math.trunc(cents / 100)
  const frac = Math.abs(cents % 100)
  return `${GROUPING.format(whole)},${String(frac).padStart(2, '0')}\u00A0IDRX`
}

/**
 * Format a basis-point rate as a percent with at most one decimal: `2,5%`, `70%`.
 *
 * @param bps - Rate in basis points (250 = 2.5%).
 */
export function formatPercent(bps: number): string {
  const value = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(bps / 100)
  return `${value}%`
}

/**
 * Flat fee for a principal, rounded half-up to whole cents.
 *
 * @param principalCents - Advance amount in cents.
 * @param bps - Fee rate in basis points; defaults to the product fee.
 * @returns Fee in integer cents, e.g. 5.000.000,00 at 2,5% → 125.000,00.
 */
export function feeFor(principalCents: number, bps: number = FEE_BPS): number {
  return Math.round((principalCents * bps) / 10_000)
}

/**
 * Total collected on the repayment date: principal + fee, exactly.
 * Keeping this as its own helper guarantees the review screen, the rail and
 * the history can never disagree about the number.
 *
 * @returns Repayment amount in integer cents.
 */
export function repayFor(principalCents: number, bps: number = FEE_BPS): number {
  return principalCents + feeFor(principalCents, bps)
}

/**
 * Parse typed or pasted text into cents. The expected shape is Indonesian —
 * `5.000.000`, `1.000.000,25` — but other habits are tolerated so paste is
 * never blocked: `5.000.000,00`, `1,234.56` and plain `5000000` all parse.
 * One known limit: a lone `5,000` (comma as thousands, nothing else) reads
 * as `5,00` — the safer side of an ambiguity that has no right answer.
 *
 * @returns Integer cents, or null when the text contains no valid amount.
 */
export function parseIDRXInput(raw: string): number | null {
  const clean = raw.replace(/[\s\u00A0]/g, '')
  if (!/^[\d.,]*$/.test(clean) || !/\d/.test(clean)) return null
  const { intDigits, fracDigits } = amountParts(clean)
  if (intDigits === '' && !fracDigits) return null
  const frac = ((fracDigits ?? '') + '00').slice(0, 2)
  return Number(intDigits || '0') * 100 + Number(frac)
}

/**
 * Normalize what the user just typed into the canonical input shape — dots
 * for thousands, comma for decimals — so the field formats itself on every
 * keystroke: `5000000` → `5.000.000`, `5000000,5` → `5.000.000,5`. A trailing
 * comma survives so the user can continue into decimals, and extra decimal
 * digits are dropped rather than re-read as grouping. Paste is never blocked.
 *
 * @returns The formatted text; empty string when nothing usable was typed.
 */
export function formatIDRXInputText(raw: string): string {
  const clean = raw.replace(/[\s\u00A0]/g, '')
  if (!/^[\d.,]*$/.test(clean)) return raw
  const { intDigits, fracDigits } = amountParts(clean)
  if (intDigits === '' && !fracDigits) return ''
  const grouped = GROUPING.format(Number(intDigits || '0'))
  return fracDigits !== null ? `${grouped},${fracDigits}` : grouped
}
