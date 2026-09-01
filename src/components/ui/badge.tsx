import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
        primary: 'bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-400',
        success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
        danger: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
        outline: 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400',
        // Experimental condition: colour-coded identically everywhere so the physician can never
        // mistake which condition a screen belongs to.
        pretest: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-400/30 dark:ring-slate-500/30',
        postest: 'bg-sky-50 dark:bg-sky-950 text-cyan-700 dark:text-cyan-400 ring-1 ring-inset ring-cyan-600/30 dark:ring-cyan-400/30',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Badge for a study mode, so the mapping mode → colour exists in exactly one place. */
export function StudyModeBadge({ mode, className }: { mode: string; className?: string }) {
  const labels: Record<string, string> = {
    pretest: 'Pretest · sin IA',
    postest: 'Postest · con IA',
    produccion: 'Producción',
  };
  const variant = mode === 'pretest' ? 'pretest' : mode === 'postest' ? 'postest' : 'outline';
  return (
    <Badge variant={variant} className={className}>
      {labels[mode] ?? mode}
    </Badge>
  );
}
