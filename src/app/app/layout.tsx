import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration';

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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50">
      <ServiceWorkerRegistration />
      <header className="flex items-start justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Centro dermatológico
          </p>
          <h1 className="text-lg font-bold text-neutral-900">
            Seguimiento de acné
          </h1>
        </div>
      </header>

      <main className="flex-1 px-5 py-5">{children}</main>

    </div>
  );
}
