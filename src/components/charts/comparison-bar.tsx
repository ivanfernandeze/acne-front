'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { num } from '@/lib/format';

/**
 * Pretest vs postest bar comparison.
 *

 * Recharts is styled through props and inline SVG attributes, so it stays inside the Tailwind-only
 * policy: no stylesheet is involved. The trade-off is that it needs concrete colour strings rather
 * than utility classes, so the palette is restated here as literals from Tailwind's own scale. Each
 * one carries the class it stands for in a comment, which is the only thing keeping the chart and
 * the surrounding portal from drifting apart.
 *
 * `surface` and `tooltip` are separate on purpose. `surface` is the colour the chart SITS ON, used
 * for the halo that lifts a data point off the background; `tooltip` is a panel that FLOATS ABOVE
 * it. Keeping them as two keys costs nothing and stops a future background change from silently
 * making the tooltip disappear into the card behind it.
 *
 * The condition colours must stay in step with the classes the rest of the portal uses: neutral
 * grey for pretest (sin IA), violet for postest (con IA). The grey is not a leftover — pretest is
 * the condition WITHOUT the tool, and giving it a brand colour would suggest it is a variant of
 * the same thing rather than its absence.
 */
export interface ComparisonDatum {
  label: string;
  value: number;
  condition: 'pretest' | 'postest';
}

const COLORS = {
  pretest: '#737373', // neutral-500
  postest: '#6d28d9', // violet-700
  grid: '#e5e5e5', // neutral-200
  tick: '#737373', // neutral-500
  cursor: '#f5f5f5', // neutral-100
  surface: '#ffffff',
  tooltip: '#ffffff',
  text: '#171717', // neutral-900
} as const;

export function ComparisonBar({
  data,
  unit,
  height = 240,
}: {
  data: ComparisonDatum[];
  unit: string;
  height?: number;
}) {
  const colors = COLORS;

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        Sin datos para comparar.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: colors.tick, fontSize: 12 }}
          axisLine={{ stroke: colors.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: colors.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: colors.cursor }}
          contentStyle={{
            backgroundColor: colors.tooltip,
            border: `1px solid ${colors.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: colors.text,
          }}
          labelStyle={{ color: colors.text, fontWeight: 600 }}
          itemStyle={{ color: colors.text }}
          formatter={(value: number) => [`${num(value, 2)} ${unit}`, 'Valor']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={96}>
          {data.map((datum) => (
            <Cell key={datum.label} fill={colors[datum.condition]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
