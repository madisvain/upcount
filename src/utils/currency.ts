/**
 * Convert cents to currency units (e.g., dollars)
 * @param cents - Amount in cents (smallest currency unit)
 * @param precision - Number of decimal places (default: 2)
 * @returns Amount in currency units
 */
export function centsToUnits(cents: number, precision: number = 2): number {
  return cents / Math.pow(10, precision);
}

/**
 * Convert currency units to cents
 * @param units - Amount in currency units (e.g., dollars)
 * @param precision - Number of decimal places (default: 2)
 * @returns Amount in cents (smallest currency unit)
 */
export function unitsToCents(units: number, precision: number = 2): number {
  return Math.round(units * Math.pow(10, precision));
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (e.g., 'USD')
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCents(cents: number, currency: string, locale: string): string {
  const units = centsToUnits(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(units);
}