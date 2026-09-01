'use client';

import { Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { LabelledInput } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { useSession } from '@/components/session-provider';
import { login } from '@/lib/api';
import { DISCLAIMER } from '@/lib/constants';
import { useAction } from '@/lib/use-api';

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
      router.push('/portal');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2 text-center">
        <Activity className="mx-auto h-8 w-8 text-sky-900 dark:text-sky-400" aria-hidden />
        <h1 className="font-(family-name:--font-poppins) text-xl font-bold text-slate-900 dark:text-slate-100">
          Diagnóstico asistido de acné
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Universidad Nacional de Trujillo · Prototipo de investigación 2026
        </p>
      </div>

      <Card>
        <CardHeader title="Iniciar sesión" description="Acceso para el personal del estudio." />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <LabelledInput
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="dermatologo@centro.pe"
            />
            <LabelledInput
              label="Contraseña"
              type="password"
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
        </CardBody>
      </Card>

      <p className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {DISCLAIMER}
      </p>
    </main>
  );
}
