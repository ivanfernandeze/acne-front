'use client';

import { KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { useAction } from '@/lib/use-api';
import { isValid, validatePassword, validatePasswordRepeat } from '@/lib/user-validation';

/**
 * Self-service credential change.
 *
 * Until this existed nobody could change their own password — not the administrator, not anyone.
 * The seeded ones were printed once and an account that lost its password was simply lost, which
 * is exactly what happened while building the prototype.
 *
 * The API answers 400 and never 401 when the current password is wrong, on purpose: the client
 * calls `clearSession()` on any 401, so mistyping here would otherwise cost the whole session.
 */
export function ChangePasswordCard(): JSX.Element {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [done, setDone] = useState(false);

  const change = useAction(async () =>
    api.patch('/users/me/password', { currentPassword: current, newPassword: next }),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setDone(false);

    const found: Record<string, string | null> = {
      current: current === '' ? 'Escriba su contraseña actual.' : null,
      next: validatePassword(next),
      repeat: validatePasswordRepeat(next, repeat),
    };
    setErrors(found);
    if (!isValid(found)) return;

    void change.run().then((result) => {
      if (result === null) return;
      setDone(true);
      setCurrent('');
      setNext('');
      setRepeat('');
    });
  }

  return (
    <Card>
      <CardHeader
        title="Cambiar mi contraseña"
        description="Solo usted puede cambiarla. El administrador únicamente puede restablecerla."
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            label="Contraseña actual"
            required
            value={current}
            error={errors.current ?? null}
            onChange={(event) => setCurrent(event.target.value)}
            autoComplete="current-password"
          />
          <PasswordInput
            label="Contraseña nueva"
            required
            value={next}
            error={errors.next ?? null}
            hint="Mínimo 8 caracteres."
            onChange={(event) => setNext(event.target.value)}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Repita la contraseña nueva"
            required
            value={repeat}
            error={errors.repeat ?? null}
            onChange={(event) => setRepeat(event.target.value)}
            autoComplete="new-password"
          />

          {change.error !== null ? (
            <Alert tone="danger">{change.error.message}</Alert>
          ) : null}
          {done ? (
            <Alert tone="success">
              Contraseña cambiada. Úsela la próxima vez que inicie sesión.
            </Alert>
          ) : null}

          <Button type="submit" loading={change.pending}>
            <KeyRound className="h-4 w-4" aria-hidden />
            Cambiar contraseña
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
