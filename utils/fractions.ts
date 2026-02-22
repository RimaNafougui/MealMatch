/**
 * Converts a decimal number to a human-readable fraction string.
 * e.g. 0.5 → "½", 0.333... → "⅓", 1.5 → "1 ½"
 */

// Common vulgar fraction unicode characters
const VULGAR_FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [7 / 8, "⅞"],
];

const EPSILON = 0.01;

function closestVulgarFraction(decimal: number): string | null {
  for (const [value, symbol] of VULGAR_FRACTIONS) {
    if (Math.abs(decimal - value) < EPSILON) {
      return symbol;
    }
  }
  return null;
}

/**
 * Formats a numeric amount as a readable fraction string.
 * Whole numbers are returned as-is (e.g. 2 → "2").
 * Decimals are converted to unicode fractions where possible.
 * Mixed numbers are returned as "whole fraction" (e.g. 1.5 → "1 ½").
 */
export function formatAmount(amount: number): string {
  if (!amount && amount !== 0) return "";

  const whole = Math.floor(amount);
  const decimal = amount - whole;

  // Pure whole number
  if (Math.abs(decimal) < EPSILON) {
    return String(whole);
  }

  const fracSymbol = closestVulgarFraction(decimal);

  if (fracSymbol) {
    return whole > 0 ? `${whole} ${fracSymbol}` : fracSymbol;
  }

  // Fallback: try to express as a simple fraction using GCD
  const gcdResult = toSimpleFraction(decimal);
  if (gcdResult) {
    return whole > 0 ? `${whole} ${gcdResult}` : gcdResult;
  }

  // Last resort: round to 2 decimal places
  return whole > 0
    ? `${whole} ${decimal.toFixed(2).replace(/^0\./, ".")}`
    : amount.toFixed(2);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  return b < 0.001 ? a : gcd(b, a % b);
}

function toSimpleFraction(decimal: number): string | null {
  // Multiply by a denominator up to 16 to find a clean fraction
  for (const denom of [2, 3, 4, 5, 6, 8, 10, 12, 16]) {
    const numer = Math.round(decimal * denom);
    if (Math.abs(numer / denom - decimal) < EPSILON) {
      const g = Math.round(gcd(numer, denom));
      return `${numer / g}/${denom / g}`;
    }
  }
  return null;
}
