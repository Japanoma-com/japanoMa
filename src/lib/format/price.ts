/**
 * Canonical price formatting for Japanoma.
 *
 * Rule: AUD is the primary display currency, JPY the secondary. The
 * target audience is Australian; showing A$ first and ¥ as context
 * matches how buyers actually compare.
 *
 * Exchange rate is sourced from the CRA-76 taxonomy workbook
 * (Kaz, Mar 2026: ¥111 = A$1). Update this constant when the rate is
 * next reviewed with Kaz — do NOT scatter approximate conversions
 * through the code.
 */

export const FX_JPY_PER_AUD = 111;

/**
 * Convert a JPY amount to AUD, rounded to whole dollars.
 * Returns 0 for falsy inputs so callers can render "—" safely.
 */
export function jpyToAud(jpy: number | null | undefined): number {
  if (!jpy || !Number.isFinite(jpy)) return 0;
  return Math.round(jpy / FX_JPY_PER_AUD);
}

/**
 * Format an AUD amount as a scannable label ("A$1,100,000"). Uses
 * en-AU locale grouping for familiarity. Negative or zero → "—".
 */
export function formatAud(aud: number | null | undefined): string {
  if (!aud || aud <= 0) return '—';
  return `A$${aud.toLocaleString('en-AU')}`;
}

/**
 * Format a JPY amount in context-friendly units:
 *   ≤ ¥9,999,999   → ¥9,800,000
 *   ≤ ¥99,999,999  → ¥45M
 *   otherwise      → ¥1.2B
 * Keeps big numbers scannable when they sit next to the AUD primary.
 */
export function formatJpy(jpy: number | null | undefined): string {
  if (!jpy || jpy <= 0) return '—';
  if (jpy >= 1_000_000_000) return `¥${(jpy / 1_000_000_000).toFixed(1)}B`;
  if (jpy >= 10_000_000) return `¥${Math.round(jpy / 1_000_000)}M`;
  return `¥${jpy.toLocaleString('en-AU')}`;
}

/**
 * Dual-currency display for a JPY amount.
 *   primary       "A$343K"           compact AUD, headline.
 *   primaryFull   "A$342,703"        full AUD, for precise copy.
 *   secondary     "≈ ¥38M"           JPY equivalent, clearly an approximation.
 *
 * The exchange rate disclosure is intentionally NOT in the per-field
 * secondary — mixing "¥38M · ¥111 = A$1" reads as two unrelated facts.
 * Render `rateFootnote` once per block (e.g. under a section heading)
 * so the rate context is obvious without repeating.
 */
export function formatPriceFromJpy(jpy: number | null | undefined): {
  primary: string;
  primaryFull: string;
  secondary: string;
} {
  if (!jpy || jpy <= 0) return { primary: '—', primaryFull: '—', secondary: '' };
  const aud = jpyToAud(jpy);
  return {
    primary: `A$${abbreviateAud(aud)}`,
    primaryFull: formatAud(aud),
    secondary: `≈ ${formatJpy(jpy)}`,
  };
}

/**
 * Single-sentence disclosure of the current JPY/AUD rate. Render once
 * per pricing block so the reader knows how the AUD figures are
 * derived without cluttering every row.
 */
export const rateFootnote = `Converted at ¥${FX_JPY_PER_AUD} = A$1`;

/**
 * Range variant: "A$9K – A$135K" primary, "¥1M – ¥15M" secondary.
 * Use for budget brackets on the quiz + price_ranges taxonomy display.
 */
export function formatPriceRangeFromJpy(
  minJpy: number | null | undefined,
  maxJpy: number | null | undefined
): { primary: string; secondary: string } {
  const minAud = jpyToAud(minJpy);
  const maxAud = jpyToAud(maxJpy);

  const audRange = (() => {
    if (minAud > 0 && maxAud > 0) return `A$${abbreviateAud(minAud)} – A$${abbreviateAud(maxAud)}`;
    if (maxAud > 0) return `Up to A$${abbreviateAud(maxAud)}`;
    if (minAud > 0) return `A$${abbreviateAud(minAud)}+`;
    return '—';
  })();

  const jpyRange = (() => {
    const lo = formatJpy(minJpy);
    const hi = formatJpy(maxJpy);
    if (lo !== '—' && hi !== '—') return `${lo} – ${hi}`;
    if (hi !== '—') return `Up to ${hi}`;
    if (lo !== '—') return `${lo}+`;
    return '';
  })();

  return { primary: audRange, secondary: jpyRange };
}

/**
 * Compact AUD: 135000 → "135K", 1100000 → "1.1M", 4500000 → "4.5M".
 * Used in the headline + range formatters where brevity matters.
 */
export function abbreviateAud(aud: number): string {
  if (aud >= 1_000_000) return `${(aud / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (aud >= 1_000) return `${Math.round(aud / 1_000)}K`;
  return aud.toLocaleString('en-AU');
}
