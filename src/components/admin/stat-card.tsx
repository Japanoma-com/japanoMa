/**
 * KPI tile used across admin views. Optional `trend` prop renders a
 * tiny inline sparkline so the card shows both the headline number and
 * its momentum at a glance — no Recharts dependency, just a hand-rolled
 * SVG path to keep the bundle small.
 */

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  /** Optional daily series — last N data points for the tiny trend line. */
  trend?: number[];
  /** Optional accent for the trend line + delta; defaults to indigo. */
  accent?: string;
};

export function StatCard({ label, value, sub, trend, accent = '#3D5A7A' }: StatCardProps) {
  return (
    <div className="bg-shoji border border-border rounded-lg p-ma-6">
      <div className="flex items-start justify-between gap-ma-3 mb-ma-2">
        <p className="label-overline text-stone">{label}</p>
        {trend && trend.length > 1 && <Sparkline data={trend} color={accent} />}
      </div>
      <p className="text-4xl font-editorial text-sumi tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('en-AU') : value}
      </p>
      {sub && <p className="text-xs text-stone mt-ma-2">{sub}</p>}
    </div>
  );
}

/**
 * Tiny SVG sparkline. 72×20 canvas. Data is sampled linearly along x,
 * normalized to 0..1 on y. Renders nothing if every value is identical
 * (flat line would be meaningless).
 */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  if (max === min) return null;

  const width = 72;
  const height = 20;
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
