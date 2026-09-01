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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 dark:bg-slate-950">
      <ServiceWorkerRegistration />
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Centro dermatológico
        </p>
        <h1 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-slate-900 dark:text-slate-100">Seguimiento de acné</h1>
      </header>

      <main className="flex-1 px-5 py-5">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        {DISCLAIMER}
      </footer>
    </div>
  );
}
