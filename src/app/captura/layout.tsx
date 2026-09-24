import type { ReactNode } from 'react';


export const metadata = {
  title: 'Enviar fotografías · Acné UNT',
  description: 'Envío de fotografías clínicas desde el teléfono mediante código QR.',
};

/**
 * Layout of the mobile capture panel.
 *
 * Outside `/portal` because there is no session — the phone is authorised by the QR token alone —
 * and outside `/app` so it stays out of the patient PWA's service-worker scope: caching a page
 * whose whole purpose is a single short-lived upload window would only serve a stale one.
 */
export default function CapturaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-bold text-neutral-900">
              Acné UNT
            </p>
            <p className="text-xs text-neutral-500">Envío de fotografías</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">{children}</main>

    </div>
  );
}
