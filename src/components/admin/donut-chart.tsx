'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Slice = { name: string; value: number };

/**
 * Reusable donut for "proportion of total" views (event type mix,
 * filter usage breakdown, etc.). 180 high, responsive width, muted
 * Ma Space palette.
 */
export function DonutChart({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-stone">
        No data in this range.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={46}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 6,
              fontSize: 12,
              color: '#1A1816',
            }}
            itemStyle={{ color: '#3D3833' }}
            formatter={(v) => [(v as number).toLocaleString('en-AU'), '']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontSize: 11,
              color: '#3D3833',
              paddingTop: 8,
              lineHeight: '16px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = [
  '#3D5A7A', // ai
  '#2C4562', // ai-deep
  '#4A6B52', // matsu
  '#A67B3D', // kohaku
  '#8B3A3A', // beni
  '#8A8279', // stone (post-contrast darkened)
  '#6B92B7',
  '#7A5A8A',
  '#5A8A7A',
  '#8A7A5A',
];
