/**
 * Runnable check for the money path — the one place where a wrong number
 * would surface to users. Run with: `npm test` (plain node, no framework).
 * The checks below mirror the fixed demo figures from the design brief §5.
 */
import { feeFor, formatIDRX, parseIDRXInput, repayFor } from './money.ts'

/** Compare and throw a labeled error on mismatch — keeps the file dependency-free. */
function check(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

// formatIDRX: grouping, two decimals, non-breaking space before the unit.
check('format 8.4M', formatIDRX(840_000_000), '8,400,000.00\u00A0IDRX')
check('format zero', formatIDRX(0), '0.00\u00A0IDRX')
check('format one cent', formatIDRX(1), '0.01\u00A0IDRX')

// Fee: 5,000,000.00 at 2.5% → 125,000.00, and repay is principal + fee exactly.
check('fee 2.5%', feeFor(500_000_000), 12_500_000)
check('repay exact', repayFor(500_000_000), 512_500_000)

// Half-up rounding: 10.02 at 25% → 2.505 cents → rounds up to 3 cents.
check('fee half-up', feeFor(1002, 2_500), 251)

// Input parsing: grouping separators, decimals, and rejection of bad input.
check('parse grouped', parseIDRXInput('5,000,000'), 500_000_000)
check('parse decimal', parseIDRXInput('5000000.5'), 500_000_050)
check('parse plain', parseIDRXInput('100000'), 10_000_000)
check('reject 3 decimals', parseIDRXInput('12.345'), null)
check('reject letters', parseIDRXInput('abc'), null)
check('reject empty', parseIDRXInput(''), null)

console.log('money path: all checks passed')
