import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-muted text-foreground',
        primary: 'bg-primary-soft text-primary',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        outline: 'border border-border text-muted',
        // Experimental condition: colour-coded identically everywhere so the physician can never
        // mistake which condition a screen belongs to.
        pretest: 'bg-surface-muted text-pretest ring-1 ring-inset ring-pretest/30',
        postest: 'bg-primary-soft text-postest ring-1 ring-inset ring-postest/30',
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
