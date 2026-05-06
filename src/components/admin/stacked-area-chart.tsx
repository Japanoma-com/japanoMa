'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

type Props = {
  data: Array<Record<string, string | number>>;
  series: string[];
};

const COLORS = [
  '#3D5A7A', // ai
  '#4A6B52', // matsu
  '#A67B3D', // kohaku
  '#8B3A3A', // beni
  '#5A7A8A',
  '#7A5A8A',
  '#8A7A5A',
  '#5A8A7A',
];

/**
 * Longitudinal stacked-area chart. Used for demand-over-time views
 * where the interesting question is "how did these top N areas (or
 * categories) grow relative to each other day by day".
 */
export function StackedAreaChart({ data, series }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-stone">
        No data in this range.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient
                id={`area-grad-${i}`}
                key={s}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={COLORS[i % COLORS.length]}
                  stopOpacity={0.6}
                />
                <stop
                  offset="100%"
                  stopColor={COLORS[i % COLORS.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(s: string) => s.slice(5)}
            stroke="#8A8279"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8A8279"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 6,
              fontSize: 12,
              color: '#1A1816',
            }}
            itemStyle={{ color: '#3D3833' }}
            labelStyle={{ color: '#1A1816' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              color: '#3D3833',
              paddingTop: 12,
              lineHeight: '18px',
            }}
          />
          {series.map((s, i) => (
            <Area
              key={s}
              type="monotone"
              dataKey={s}
              stackId="demand"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              fill={`url(#area-grad-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
