'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Point = { day: string; total: number };

export function EventTrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-stone">
        No events in this range yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aiFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3D5A7A" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3D5A7A" stopOpacity={0} />
            </linearGradient>
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
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3D5A7A"
            strokeWidth={2}
            fill="url(#aiFade)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
