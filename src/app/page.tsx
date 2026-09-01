import Link from 'next/link';
import { Activity, Camera, Stethoscope } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button-variants';
import { DISCLAIMER } from '@/lib/constants';

/**
 * Landing page: the two experiences the specification puts in this single frontend
 * (Sección 4) — the dermatologist's portal at `/portal/**` and the patient's PWA at `/app/**`.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <Activity className="h-4 w-4" aria-hidden />
          Universidad Nacional de Trujillo · Ingeniería de Sistemas · 2026
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Diagnóstico asistido de acné con inteligencia artificial
        </h1>
        <p className="text-sm text-muted">
          Prototipo funcional de la tesis «Agilización del proceso de diagnóstico de acné mediante
          inteligencia artificial en un centro especializado en dermatología».
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal"
          className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary"
        >
          <Stethoscope className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 font-display text-base font-semibold text-foreground">
            Portal del dermatólogo
          </h2>
          <p className="mt-1 text-sm text-muted">
            Bandeja de casos, diagnóstico cronometrado, indicadores, análisis estadístico y
            reportes.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
            Entrar →
          </span>
        </Link>

        <Link
          href="/app"
          className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent"
        >
          <Camera className="h-6 w-6 text-accent" aria-hidden />
          <h2 className="mt-3 font-display text-base font-semibold text-foreground">
            App del paciente
          </h2>
          <p className="mt-1 text-sm text-muted">
            Captura de imagen facial con guía de encuadre, envío al centro e historial personal.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:underline">
            Abrir →
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/login" className={buttonVariants({ variant: 'primary' })}>
          Iniciar sesión
        </Link>
        <a
          href="http://localhost:3001/docs"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          Documentación de la API
        </a>
      </div>

      <footer className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-xs text-foreground">
        <strong className="font-semibold">Aviso:</strong> {DISCLAIMER}
      </footer>
    </main>
  );
}
