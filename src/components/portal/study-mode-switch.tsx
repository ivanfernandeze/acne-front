'use client';

import { useState } from 'react';

import { useSession } from '@/components/session-provider';
import { Badge, StudyModeBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { api, readSession, writeSession, type SessionUser } from '@/lib/api';
import { useAction } from '@/lib/use-api';

/**
 * Switch of the independent variable (RF-TR-01).
 *
 * Moving from pretest to postest IS the intervention X of the design, so it is never a silent
 * toggle: it asks for confirmation, explains what changes, and the backend records it in the
 * audit trail.
 *
 * The new mode only takes effect on a freshly issued token — the API embeds `studyMode` in the
 * JWT — which is deliberate: the condition stays stable for a whole session instead of flipping
 * mid-review and splitting one measurement across two conditions.
 */
export function StudyModeSwitch() {
  const { user, refresh } = useSession();
  const [open, setOpen] = useState(false);

  const { run, pending, error } = useAction(async (target: string) => {
    const updated = await api.patch<SessionUser & { studyMode: string }>('/users/me/study-mode', {
      studyMode: target,
    });

    // Re-issue the token so the new condition reaches StudyModeGuard.
    const session = readSession();
    if (session !== null) {
      const refreshed = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: SessionUser;
      }>('/auth/refresh', { refreshToken: session.refreshToken });
      writeSession({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        user: refreshed.user,
      });
    }
    return updated;
  });

  if (user === null) return null;

  const canSwitch = user.role === 'dermatologo' || user.role === 'residente';
  if (!canSwitch) return <StudyModeBadge mode={user.studyMode} />;

  async function apply(target: string): Promise<void> {
    const result = await run(target);
    if (result !== null) {
      refresh();
      setOpen(false);
      // A full reload guarantees every cached screen re-reads the new condition; a stale case
      // view still showing the AI panel after switching to pretest would be a validity problem,
      // not a cosmetic one.
      window.location.reload();
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-900 dark:focus-visible:ring-sky-400"
        title="Cambiar el modo de estudio"
      >
        <StudyModeBadge mode={user.studyMode} />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg">
          <p className="font-(family-name:--font-poppins) text-sm font-semibold text-slate-900 dark:text-slate-100">Modo de estudio</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Determina la condición experimental bajo la que se registran sus mediciones. Pasar de
            pretest a postest equivale a aplicar la intervención X del diseño y queda registrado en
            la auditoría.
          </p>

          <div className="mt-3 space-y-2">
            {(['pretest', 'postest', 'produccion'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={pending || mode === user.studyMode}
                onClick={() => void apply(mode)}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-default disabled:opacity-60"
              >
                <span className="flex flex-col">
                  <StudyModeBadge mode={mode} />
                  <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {mode === 'pretest'
                      ? 'IIA = 0 · el módulo de IA queda bloqueado (O₁)'
                      : mode === 'postest'
                        ? 'IIA = 1 · se muestra la sugerencia de la CNN (O₂)'
                        : 'Fuera del experimento; no aporta mediciones'}
                  </span>
                </span>
                {mode === user.studyMode ? <Badge variant="success">Actual</Badge> : null}
              </button>
            ))}
          </div>

          {error !== null ? (
            <Alert tone="danger" className="mt-3">
              {error.message}
            </Alert>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            block
            className="mt-3"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cerrar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
