'use client';

import { Check, Copy, KeyRound, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { UserForm, type UserFormValues } from '@/components/portal/user-form';
import { UserTable, type StaffMember } from '@/components/portal/user-table';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ConfirmAction } from '@/components/ui/confirm';
import { Alert } from '@/components/ui/feedback';
import { api, type PostResult } from '@/lib/api';
import { useAction } from '@/lib/use-api';

type CreatedUser = PostResult<'/users'>;
type TemporaryPassword = PostResult<'/users/{id}/password-reset'>;

/**
 * El alta y el mantenimiento de UN rol concreto, en una sola pantalla.
 *
 * Tres secciones la usan —técnicos en el portal del especialista, dermatólogos y técnicos en el
 * del administrador— y comparten componente porque son el mismo trabajo sobre roles distintos: un
 * arreglo en el formulario o en la tabla llega a las tres a la vez.
 *
 * El formulario va ARRIBA y la lista debajo, al revés que en «Usuarios». Ahí se entra a buscar a
 * alguien; aquí se entra a dar de alta, y la lista existe sobre todo para comprobar que la cuenta
 * quedó creada y para devolverle el acceso a quien perdió su clave.
 *
 * El rol viene fijado por la sección y no se elige: el servidor lo comprueba igual —quien solo
 * tiene `gestionar_tecnicos` no puede crear otra cosa, diga lo que diga el formulario— pero un
 * desplegable con una única opción es una pregunta cuya respuesta ya está decidida.
 */
export function StaffRoleSection({
  role,
  title,
  description,
  formTitle,
  formDescription,
  listTitle,
  roleLockHint,
  linkToDetail = false,
}: {
  role: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  listTitle: string;
  roleLockHint: string;
  /** Solo el administrador tiene ficha de usuario a la que enlazar. */
  linkToDetail?: boolean;
}): JSX.Element {
  /*
   * `formKey` reinicia el formulario tras un alta y `reloadKey` relee la tabla.
   *
   * Son dos porque son dos cosas: limpiar lo tecleado y volver a pedir la lista. Reutilizar uno
   * solo obligaba a recrear la tabla entera en cada tecleo del formulario.
   */
  const [formKey, setFormKey] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [created, setCreated] = useState<CreatedUser | null>(null);
  const [temporary, setTemporary] = useState<{ name: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const create = useAction(async (values: UserFormValues) =>
    api.post<CreatedUser>('/users', {
      fullName: values.fullName,
      email: values.email,
      role,
      password: values.password,
      specialty: values.specialty === '' ? undefined : values.specialty,
      phone: values.phone === '' ? undefined : values.phone,
    }),
  );

  const reset = useAction(async (member: StaffMember) => {
    const issued = await api.post<TemporaryPassword>(`/users/${member.id}/password-reset`);
    setTemporary({ name: member.fullName, password: issued.password });
    setCopied(false);
    return issued;
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </header>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-neutral-500" aria-hidden />
              {formTitle}
            </span>
          }
          description={formDescription}
        />
        <CardBody className="space-y-4">
          {created !== null ? (
            // Persistente, nunca un aviso que se desvanece: quien acaba de crear una cuenta
            // necesita poder releer el correo con que la creó para dictarlo.
            <Alert tone="success" title="Cuenta creada">
              <strong>{created.fullName}</strong> ya puede entrar con{' '}
              <code className="rounded bg-white/60 px-1 py-0.5 font-mono text-xs">
                {created.email}
              </code>{' '}
              y la contraseña que acaba de escribir.
            </Alert>
          ) : null}

          <UserForm
            key={formKey}
            mode="create"
            initial={{ role }}
            roleScope={[role]}
            lockRole
            lockRoleHint={roleLockHint}
            submitLabel="Crear la cuenta"
            pending={create.pending}
            error={create.error}
            onSubmit={(values) => {
              void create.run(values).then((result) => {
                if (result === null) return;
                setCreated(result);
                setFormKey((value) => value + 1);
                setReloadKey((value) => value + 1);
              });
            }}
          />
        </CardBody>
      </Card>

      {temporary !== null ? (
        <Alert tone="success" title={`Contraseña nueva de ${temporary.name}`}>
          <p className="mb-2">
            Se muestra <strong>una sola vez</strong>. Anótela antes de salir de esta pantalla.
          </p>
          <span className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-white px-2 py-1 font-mono text-sm text-neutral-900">
              {temporary.password}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard
                  .writeText(temporary.password)
                  .then(() => setCopied(true));
              }}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? 'Copiada' : 'Copiar'}
            </Button>
          </span>
        </Alert>
      ) : null}

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {listTitle}
        </h2>
        <UserTable
          roleScope={[role]}
          hideRoleFilter
          linkToDetail={linkToDetail}
          reloadKey={reloadKey}
          rowAction={(member) => (
            <ConfirmAction
              label="Contraseña"
              icon={<KeyRound className="h-4 w-4" aria-hidden />}
              tone="warning"
              title="Se generará una contraseña nueva"
              confirmLabel="Generar"
              pending={reset.pending}
              error={reset.error?.message ?? null}
              description={
                <>
                  La contraseña actual de <strong>{member.fullName}</strong> dejará de funcionar de
                  inmediato y la nueva se mostrará <strong>una sola vez</strong>.
                  <br />
                  No cierra las sesiones abiertas: quien ya tenga un token de refresco seguirá
                  entrando hasta que caduque.
                </>
              }
              onConfirm={() => void reset.run(member)}
            />
          )}
        />
      </section>
    </div>
  );
}
