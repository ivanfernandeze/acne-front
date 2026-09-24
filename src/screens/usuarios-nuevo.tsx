'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { UserForm, type UserFormValues } from '@/components/portal/user-form';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { api, type PostResult } from '@/lib/api';
import { useAction } from '@/lib/use-api';
import { usePortalHref } from '@/lib/use-portal';

type CreatedUser = PostResult<'/users'>;

/**
 * Registers a new member of staff.
 *
 * A dedicated page rather than a dialog, like every other write flow in this portal: the form is
 * linkable, needs no focus trap, and a stray click outside cannot discard what was typed.
 */
export default function NuevoUsuarioPage(): JSX.Element {
  const href = usePortalHref();
  const router = useRouter();

  const create = useAction(async (values: UserFormValues) =>
    api.post<CreatedUser>('/users', {
      fullName: values.fullName,
      email: values.email,
      role: values.role,
      password: values.password,
      specialty: values.specialty === '' ? undefined : values.specialty,
      phone: values.phone === '' ? undefined : values.phone,
    }),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={href('/usuarios')}
        className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a usuarios
      </Link>

      <Card>
        <CardHeader
          title="Nuevo usuario"
          description="La cuenta se crea activa y en modo producción. El rol decide qué puede abrir."
        />
        <CardBody>
          <UserForm
            mode="create"
            submitLabel="Crear cuenta"
            pending={create.pending}
            error={create.error}
            onSubmit={(values) => {
              void create.run(values).then((created) => {
                if (created !== null) router.push(href(`/usuarios/${created.id}`));
              });
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
