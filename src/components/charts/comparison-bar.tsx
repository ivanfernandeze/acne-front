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

import { useTheme } from '@/components/theme-provider';
import { num } from '@/lib/format';

/**
 * Pretest vs postest bar comparison.
 *
 * Recharts is styled through props and inline SVG attributes, so it stays inside the Tailwind-only
 * policy: no stylesheet is involved. The trade-off is that it needs concrete colour strings rather
 * than utility classes, so the palette is restated here as literals from Tailwind's own scale and
 * selected from the resolved theme — otherwise the tooltip would be a white box on a dark page.
 *
 * The condition colours must stay in step with the classes the rest of the portal uses:
 * slate for pretest (sin IA), cyan for postest (con IA).
 */
export interface ComparisonDatum {
  label: string;
  value: number;
  condition: 'pretest' | 'postest';
}

const PALETTE = {
  light: {
    pretest: '#62748e', // slate-500
    postest: '#0e7490', // cyan-700
    grid: '#e2e8f0', // slate-200
    tick: '#62748e', // slate-500
    cursor: '#f1f5f9', // slate-100
    surface: '#ffffff',
    text: '#0f172b', // slate-900
  },
  dark: {
    pretest: '#90a1b9', // slate-400
    postest: '#00b8db', // cyan-500
    grid: '#314158', // slate-700
    tick: '#90a1b9', // slate-400
    cursor: '#1d293d', // slate-800
    surface: '#0f172b', // slate-900
    text: '#f1f5f9', // slate-100
  },
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
  const { resolved } = useTheme();
  const colors = PALETTE[resolved];

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
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
            backgroundColor: colors.surface,
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
