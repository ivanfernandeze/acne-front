'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '@/components/theme-provider';
import { date } from '@/lib/format';

/**
 * IGA evolution of one patient across visits.
 *
 * IGA is an ORDINAL scale, so the vertical axis carries the rank (0 = sin lesiones … 4 = severo)
 * and the ticks are relabelled with the clinical class. Plotting the rank rather than an invented
 * numeric score keeps the drawing honest: the line shows the direction and the number of steps,
 * which is all an ordinal scale supports, and never suggests that the distance between "leve" and
 * "moderado" equals the distance between "moderado" and "severo".
 *
 * The axis is NOT inverted: severity climbs, so a descending line reads as improvement — the same
 * way the treatment response is read in a clinical chart.
 *
 * Like the rest of the charts, Recharts is styled through props, so no stylesheet is involved and
 * the Tailwind-only policy holds; the palette is restated as literals from Tailwind's own scale.
 */
export interface SeverityPoint {
  /** ISO date of the visit. */
  at: string;
  /** Ordinal rank of the IGA class recorded at the visit. */
  rank: number;
  /** Clinical label, shown in the tooltip. */
  label: string;
  caseCode: string;
}

const PALETTE = {
  light: {
    line: '#0e7490', // cyan-700
    dot: '#0f172b', // slate-900
    grid: '#e2e8f0', // slate-200
    tick: '#62748e', // slate-500
    surface: '#ffffff',
    text: '#0f172b', // slate-900
  },
  dark: {
    line: '#00b8db', // cyan-500
    dot: '#f1f5f9', // slate-100
    grid: '#314158', // slate-700
    tick: '#90a1b9', // slate-400
    surface: '#0f172b', // slate-900
    text: '#f1f5f9', // slate-100
  },
} as const;

export function SeverityEvolution({
  data,
  /** Ordinal rank → clinical label, taken from `GET /meta/catalogs`. */
  rankLabels,
  height = 260,
}: {
  data: SeverityPoint[];
  rankLabels: Record<number, string>;
  height?: number;
}) {
  const { resolved } = useTheme();
  const colors = PALETTE[resolved];

  if (data.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Se necesitan al menos dos visitas con diagnóstico para trazar la evolución.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="at"
          tickFormatter={(value: string) => date(value)}
          tick={{ fill: colors.tick, fontSize: 11 }}
          axisLine={{ stroke: colors.grid }}
          tickLine={false}
        />
        <YAxis
          dataKey="rank"
          type="number"
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tickFormatter={(value: number) => rankLabels[value] ?? String(value)}
          tick={{ fill: colors.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: colors.text,
          }}
          labelStyle={{ color: colors.text, fontWeight: 600 }}
          itemStyle={{ color: colors.text }}
          labelFormatter={(value: string) => date(value)}
          formatter={(_value: number, _name: string, entry: { payload?: SeverityPoint }) => [
            `${entry.payload?.label ?? '—'} · ${entry.payload?.caseCode ?? ''}`,
            'Severidad IGA',
          ]}
        />
        <Line
          type="monotone"
          dataKey="rank"
          stroke={colors.line}
          strokeWidth={2.5}
          dot={{ r: 4, fill: colors.line, stroke: colors.surface, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: colors.dot }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
