'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

// A discrete 10-step palette derived from the Ma Space tokens (indigo
// family + complementary warm tones). Keeps charts on-brand even with
// many event types present.
const COLORS = [
  '#3D5A7A', // ai (indigo)
  '#2C4562', // ai-deep
  '#4A6B52', // matsu
  '#A67B3D', // kohaku
  '#8B3A3A', // beni
  '#8A8279', // stone
  '#5A7A8A',
  '#7A5A8A',
  '#8A7A5A',
  '#5A8A7A',
];

export function StackedEventChart({ data, series }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-stone">
        No events in this range.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
            iconType="square"
            iconSize={10}
            wrapperStyle={{
              fontSize: 11,
              color: '#3D3833',
              paddingTop: 12,
              lineHeight: '18px',
            }}
          />
          {series.map((s, i) => (
            <Bar
              key={s}
              dataKey={s}
              stackId="events"
              fill={COLORS[i % COLORS.length]}
              radius={i === series.length - 1 ? [3, 3, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
