'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { BrandMark } from '@/components/brand/brand-mark';
import { ClinicIllustration } from '@/components/brand/clinic-illustration';
import { useSession } from '@/components/session-provider';
import { Button } from '@/components/ui/button';
import { LabelledInput, PasswordInput } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { login } from '@/lib/api';
import { THESIS_INSTITUTION, THESIS_SCHOOL, THESIS_TITLE } from '@/lib/constants';
import { portalForRole, portalHref } from '@/lib/portals';
import { useAction } from '@/lib/use-api';

/**
 * Sign-in, split in half: the form on the left, the illustrated panel on the right.
 *
 * The panel is `hidden lg:block`. Below that breakpoint the form takes the full width, which is what
 * matters on the phone a technician actually signs in from at the reception desk.
 */
export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { run, pending, error } = useAction(login);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const session = await run(email.trim(), password);
    if (session !== null) {
      setSession(session);
      // Each role has exactly one portal, so there is nothing to choose: sending everyone to a
      // shared landing page and letting it bounce them would put a redirect between the login and
      // the first screen of every session, for no decision anyone has to make.
      const portal = portalForRole(session.user.role);
      router.push(portal === null ? '/' : portalHref(portal.slug));
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* --- Form ---------------------------------------------------------- */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-9" />
            <span className="text-sm font-bold text-neutral-900">
              Acné UNT
            </span>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-neutral-900">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Acceso para el personal del estudio.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              <LabelledInput
                label="Correo electrónico"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="dermatologo@centro.pe"
              />
              <PasswordInput
                label="Contraseña"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error !== null ? (
                <Alert tone="danger" title="No se pudo iniciar sesión">
                  {error.message}
                </Alert>
              ) : null}

              <Button type="submit" block loading={pending}>
                Entrar
              </Button>
            </form>

            {/* The institutional line lives here too, because on a phone the panel is not rendered
                and this would otherwise be a login form belonging to nothing in particular. */}
            <p className="mt-8 text-xs text-neutral-500 lg:hidden">
              {THESIS_INSTITUTION} · {THESIS_SCHOOL}
            </p>
          </div>
        </div>
      </div>

      {/* --- Illustrated panel ---------------------------------------------- */}
      <aside className="relative hidden overflow-hidden lg:block">
        <ClinicIllustration className="absolute inset-0" />

        {/* Scrim: the caption sits over the drawing, and the drawing is busiest where the text is. */}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/85 via-neutral-950/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300">
            Prototipo funcional de tesis
          </p>
          <p className="mt-3 text-xl font-semibold leading-snug text-white">
            {THESIS_TITLE}
          </p>
          <p className="mt-4 text-sm text-neutral-300">
            {THESIS_INSTITUTION} · {THESIS_SCHOOL}
          </p>
        </div>
      </aside>
    </div>
  );
}
