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
 * Recharts is styled entirely through props and inline SVG attributes, so it stays inside the
 * Tailwind-only policy: no stylesheet is involved.
 */
export interface ComparisonDatum {
  label: string;
  value: number;
  condition: 'pretest' | 'postest';
}

/**
 * Recharts needs concrete colour strings, not utility classes, so the palette is restated here as
 * literals taken from Tailwind's own scale. They must stay in step with the classes the rest of
 * the portal uses for each condition: slate-500 for pretest (sin IA), cyan-700 for postest (con IA).
 */
const SLATE_500 = '#62748e';
const SLATE_200 = '#e2e8f0';
const CYAN_700 = '#0e7490';
const SLATE_900 = '#0f172b';
const SLATE_100 = '#f1f5f9';

const COLORS: Record<ComparisonDatum['condition'], string> = {
  pretest: SLATE_500,
  postest: CYAN_700,
};

export function ComparisonBar({
  data,
  unit,
  height = 240,
}: {
  data: ComparisonDatum[];
  unit: string;
  height?: number;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Sin datos para comparar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={SLATE_200} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: SLATE_500, fontSize: 12 }}
          axisLine={{ stroke: SLATE_200 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: SLATE_500, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: SLATE_100 }}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: `1px solid ${SLATE_200}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: SLATE_900, fontWeight: 600 }}
          formatter={(value: number) => [`${num(value, 2)} ${unit}`, 'Valor']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={96}>
          {data.map((datum) => (
            <Cell key={datum.label} fill={COLORS[datum.condition]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
