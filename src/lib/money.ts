/**
 * Money primitives for the Cashy demo.
 *
 * Every amount is stored as an integer number of cents (1/100 IDRX) so no
 * floating point error can reach the screen. Display always goes through
 * {@link formatIDRX}; fee math always goes through {@link feeFor} and
 * {@link repayFor}, so figures shown next to each other always add up.
 */

/** Flat advance fee in basis points: 250 = 2.5%. It is a fee, never interest. */
export const FEE_BPS = 250

/**
 * Format a cents amount as an IDRX figure: `12,500,000.00 IDRX`.
 * Thousands separator is a comma, decimal point is a dot, always two
 * decimals. The space before the unit is non-breaking so a figure never
 * wraps away from its unit.
 *
 * @param cents - Amount in integer cents (1/100 IDRX).
 * @returns Display string, e.g. `'8,400,000.00\u00A0IDRX'`.
 */
export function formatIDRX(cents: number): string {
  const whole = Math.trunc(cents / 100)
  const frac = Math.abs(cents % 100)
  const grouped = new Intl.NumberFormat('en-US').format(whole)
  return `${grouped}.${String(frac).padStart(2, '0')}\u00A0IDRX`
}

/**
 * Format a basis-point rate as a percent with at most one decimal: `2.5%`, `70%`.
 *
 * @param bps - Rate in basis points (250 = 2.5%).
 */
export function formatPercent(bps: number): string {
  const value = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(bps / 100)
  return `${value}%`
}

/**
 * Flat fee for a principal, rounded half-up to whole cents.
 *
 * @param principalCents - Advance amount in cents.
 * @param bps - Fee rate in basis points; defaults to the product fee.
 * @returns Fee in integer cents, e.g. 5,000,000.00 at 2.5% → 125,000.00.
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
 * Parse what the user typed into cents. Lenient about grouping: both
 * `5,000,000` and `5000000` and `5000000.50` are accepted. Paste is never
 * blocked; bad input returns null so the form can show an inline error.
 *
 * @param raw - Raw text from an input field.
 * @returns Integer cents, or null when the text is not a valid amount.
 */
export function parseIDRXInput(raw: string): number | null {
  const text = raw.replace(/[,\s]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(text)) return null
  const [wholeRaw, fracRaw = ''] = text.split('.')
  const whole = Number(wholeRaw)
  const frac = Number(fracRaw.padEnd(2, '0') || '0')
  return whole * 100 + frac
}
