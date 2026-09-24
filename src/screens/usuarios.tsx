'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { UserTable } from '@/components/portal/user-table';
import { buttonVariants } from '@/components/ui/button-variants';
import { usePortalHref } from '@/lib/use-portal';

/**
 * Maintainer for every account in the study, the intake desk included.
 *
 * `GET`, `POST` and `PATCH /users` existed from the first day of the project and were called from
 * nowhere in the portal — the same way the medical staff's own consent endpoint had no screen until
 * `/portal/perfil` was built. This is where they finally become reachable.
 */
export default function UsuariosPage(): JSX.Element {
  const href = usePortalHref();
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Usuarios</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Todo el personal del estudio: quien diagnostica, quien recibe al paciente, quien
            analiza y quien administra (RF-TR-02).
          </p>
        </div>
        <Link href={href('/usuarios/nuevo')} className={buttonVariants({ variant: 'primary' })}>
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo usuario
        </Link>
      </header>

      <UserTable />
    </div>
  );
}
