import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

// --- Alert -------------------------------------------------------------------

const ALERT_STYLES = {
  info: { box: 'border-primary/30 bg-primary-soft text-foreground', icon: Info, tint: 'text-primary' },
  success: { box: 'border-success/30 bg-success-soft text-foreground', icon: CheckCircle2, tint: 'text-success' },
  warning: { box: 'border-warning/40 bg-warning-soft text-foreground', icon: AlertTriangle, tint: 'text-warning' },
  danger: { box: 'border-danger/40 bg-danger-soft text-foreground', icon: XCircle, tint: 'text-danger' },
} as const;

export type AlertTone = keyof typeof ALERT_STYLES;

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const style = ALERT_STYLES[tone];
  const Icon = style.icon;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-md border px-4 py-3 text-sm', style.box, className)}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.tint)} aria-hidden />
      <div className="min-w-0 space-y-1">
        {title !== undefined ? <p className="font-semibold">{title}</p> : null}
        {children !== undefined ? <div className="text-muted">{children}</div> : null}
      </div>
    </div>
  );
}

// --- Loading / empty / error --------------------------------------------------

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <p className="font-display text-sm font-semibold text-foreground">{title}</p>
      {description !== undefined ? (
        <p className="max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action !== undefined ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert tone="danger" title="No se pudo cargar la información">
      <p>{message}</p>
      {onRetry !== undefined ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-danger underline underline-offset-4"
        >
          Reintentar
        </button>
      ) : null}
    </Alert>
  );
}

/**
 * Panel shown when `StudyModeGuard` rejects an AI route.
 *
 * Presented as expected behaviour of the experimental design, not as a failure: in pretest the
 * physician is SUPPOSED to be unable to see the model's suggestion (RF-TR-01).
 */
export function StudyModeBlocked({ children }: { children?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-pretest/30 bg-surface-muted px-4 py-4 text-sm">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-pretest" aria-hidden />
      <div className="space-y-1.5">
        <p className="font-display font-semibold text-foreground">
          Módulo de IA bloqueado — modo pretest (IIA = 0)
        </p>
        <p className="text-muted">
          En la observación O₁ del diseño preexperimental el diagnóstico debe emitirse sin
          asistencia de la inteligencia artificial. El bloqueo se aplica en el servidor, no solo en
          esta pantalla, para que ninguna llamada rezagada pueda contaminar la medición.
        </p>
        {children}
        <p className="text-xs text-muted">
          Requerimiento RF-TR-01 · La IA se habilita al aplicar la intervención X y pasar a postest.
        </p>
      </div>
    </div>
  );
}
