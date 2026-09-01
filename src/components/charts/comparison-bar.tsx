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

const COLORS: Record<ComparisonDatum['condition'], string> = {
  pretest: 'hsl(var(--pretest))',
  postest: 'hsl(var(--postest))',
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
    return <p className="py-10 text-center text-sm text-muted">Sin datos para comparar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--surface-muted))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
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
