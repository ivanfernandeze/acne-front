import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration';
import { DISCLAIMER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'App del paciente',
  description: 'Captura de imagen facial e historial de sus casos.',
};

/**
 * Patient-facing experience (`/app/**`).
 *
 * Kept visually distinct from the clinical portal on purpose: the two audiences must never be
 * confused about which application they are looking at, and a patient should not see anything
 * resembling the experimental controls.
 */
export default function PatientAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <ServiceWorkerRegistration />
      <header className="border-b border-border bg-surface px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Centro dermatológico
        </p>
        <h1 className="font-display text-lg font-bold text-foreground">Seguimiento de acné</h1>
      </header>

      <main className="flex-1 px-5 py-5">{children}</main>

      <footer className="border-t border-border bg-surface px-5 py-3 text-[11px] leading-relaxed text-muted">
        {DISCLAIMER}
      </footer>
    </div>
  );
}
