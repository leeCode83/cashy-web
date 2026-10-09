/**
 * Runnable check for the money path — the one place where a wrong number
 * would surface to users. Run with: `npm test` (plain node, no framework).
 * The checks below mirror the fixed demo figures from the design brief §5,
 * using the Indonesian number convention (dots for thousands, comma for
 * decimals) that displays and inputs share.
 */
import { feeFor, formatIDRX, formatIDRXInputText, parseIDRXInput, repayFor } from './money.ts'

/** Compare and throw a labeled error on mismatch — keeps the file dependency-free. */
function check(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

// formatIDRX: dot grouping, comma decimals, non-breaking space before the unit.
check('format 8.4M', formatIDRX(840_000_000), '8.400.000,00\u00A0IDRX')
check('format zero', formatIDRX(0), '0,00\u00A0IDRX')
check('format one cent', formatIDRX(1), '0,01\u00A0IDRX')

// Fee: 5.000.000,00 at 2,5% → 125.000,00, and repay is principal + fee exactly.
check('fee 2,5%', feeFor(500_000_000), 12_500_000)
check('repay exact', repayFor(500_000_000), 512_500_000)

// Half-up rounding: 10,02 at 25% → 2,505 cents → rounds up to 3 cents.
check('fee half-up', feeFor(1002, 2_500), 251)

// Input parsing: the Indonesian shape first, pasted habits tolerated.
check('parse plain', parseIDRXInput('5000000'), 500_000_000)
check('parse dotted', parseIDRXInput('5.000.000'), 500_000_000)
check('parse comma decimal', parseIDRXInput('1.000.000,25'), 100_000_025)
check('parse trailing comma', parseIDRXInput('5,'), 500)
check('parse en-us paste', parseIDRXInput('5,000,000'), 500_000_000)
check('parse en-us decimal paste', parseIDRXInput('5000000.5'), 500_000_050)
check('parse mixed paste', parseIDRXInput('1,234.56'), 123_456)
check('parse minimum', parseIDRXInput('100000'), 10_000_000)
check('reject letters', parseIDRXInput('abc'), null)
check('reject empty', parseIDRXInput(''), null)
check('reject separators only', parseIDRXInput('.,,'), null)

// Live input formatting: what the field shows after each keystroke.
check('format typing plain', formatIDRXInputText('5000000'), '5.000.000')
check('format typing decimal', formatIDRXInputText('5000000,5'), '5.000.000,5')
check('format keeps trailing comma', formatIDRXInputText('5000000,'), '5.000.000,')
check('format caps decimals', formatIDRXInputText('1000,259'), '1.000,25')
check('format caps decimals on millions', formatIDRXInputText('1.000.000,259'), '1.000.000,25')
check('format en-us paste', formatIDRXInputText('5,000,000.00'), '5.000.000,00')
check('format en-us grouped paste', formatIDRXInputText('5,000,000'), '5.000.000')
check('format empty', formatIDRXInputText(''), '')

console.log('money path: all checks passed')
