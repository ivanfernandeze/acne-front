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
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Activity className="h-4 w-4" aria-hidden />
          Universidad Nacional de Trujillo · Ingeniería de Sistemas · 2026
        </p>
        <h1 className="font-(family-name:--font-poppins) text-3xl font-bold text-slate-900 dark:text-slate-100">
          Diagnóstico asistido de acné con inteligencia artificial
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Prototipo funcional de la tesis «Agilización del proceso de diagnóstico de acné mediante
          inteligencia artificial en un centro especializado en dermatología».
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal"
          className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 transition-colors hover:border-sky-900 dark:hover:border-sky-400"
        >
          <Stethoscope className="h-6 w-6 text-sky-900 dark:text-sky-400" aria-hidden />
          <h2 className="mt-3 font-(family-name:--font-poppins) text-base font-semibold text-slate-900 dark:text-slate-100">
            Portal del dermatólogo
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Bandeja de casos, diagnóstico cronometrado, indicadores, análisis estadístico y
            reportes.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-sky-900 dark:text-sky-400 group-hover:underline">
            Entrar →
          </span>
        </Link>

        <Link
          href="/app"
          className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 transition-colors hover:border-cyan-700 dark:hover:border-cyan-400"
        >
          <Camera className="h-6 w-6 text-cyan-700 dark:text-cyan-400" aria-hidden />
          <h2 className="mt-3 font-(family-name:--font-poppins) text-base font-semibold text-slate-900 dark:text-slate-100">
            App del paciente
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Captura de imagen facial con guía de encuadre, envío al centro e historial personal.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-cyan-700 dark:text-cyan-400 group-hover:underline">
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

      <footer className="rounded-md border border-red-500/30 dark:border-red-400/30 bg-red-50 dark:bg-red-950 px-4 py-3 text-xs text-slate-900 dark:text-slate-100">
        <strong className="font-semibold">Aviso:</strong> {DISCLAIMER}
      </footer>
    </main>
  );
}
