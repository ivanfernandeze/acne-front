import { ArrowRight, Camera, Stethoscope } from 'lucide-react';
import Link from 'next/link';

import { ApiDocsLink } from '@/components/brand/api-docs-link';
import { BrandMark } from '@/components/brand/brand-mark';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  LANDING_INDICATORS,
  THESIS_ADVISOR,
  THESIS_AUTHORS,
  THESIS_INSTITUTION,
  THESIS_SCHOOL,
  THESIS_TITLE,
} from '@/lib/constants';

/**
 * Landing page: the two experiences the specification puts in this single frontend (Sección 4) —
 * the three staff portals — `/admin`, `/dermatologo`, `/tecnico` — and the patient PWA at
 * `/app/**`.
 *
 * Deliberately makes NO network call. It is the first screen anyone loads, including an examiner
 * opening the repository cold, and it has to render with the API down. Everything it shows comes
 * from `lib/constants`; every screen behind the login reads the authoritative copies from
 * `GET /meta/catalogs` instead.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark className="h-11 w-11" />
            <div>
              <p className="text-sm font-bold text-neutral-900">
                Acné UNT
              </p>
              <p className="text-xs text-neutral-500">
                {THESIS_INSTITUTION} · {THESIS_SCHOOL}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-12 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-700">
            Prototipo funcional de tesis
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            Diagnóstico asistido de acné con inteligencia artificial
          </h1>
          <p className="mt-4 text-base text-neutral-500">
            {THESIS_TITLE}.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-neutral-500">
            El sistema no es un registro clínico más: existe para producir evidencia medible. Cada
            caso se revisa dos veces —una sin asistencia y otra con ella— y es su propio control, de
            modo que la diferencia entre ambas mediciones es atribuible a la intervención.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ variant: 'primary' })}>
              Iniciar sesión
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <ApiDocsLink />
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {/* Un solo destino para el personal: el login manda a cada rol a su portal. Ofrecer
              aqui los tres seria pedirle a quien llega que sepa como se llama su propio puesto. */}
          <EntryCard
            href="/login"
            icon={<Stethoscope className="h-6 w-6" aria-hidden />}
            title="Portal del personal"
            description="Administración, consulta dermatológica y admisión. Cada cuenta entra a su propio portal según su rol."
            cta="Iniciar sesión"
            accent="brand"
          />
          <EntryCard
            href="/app"
            icon={<Camera className="h-6 w-6" aria-hidden />}
            title="App del paciente"
            description="Captura de imagen facial con guía de encuadre, envío al centro mediante código QR e historial personal."
            cta="Abrir la app"
            accent="data"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Lo que mide el estudio
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_INDICATORS.map((indicator) => (
              <div
                key={indicator.key}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <p className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-neutral-900">
                    {indicator.key}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {indicator.objective}
                  </span>
                </p>
                <p className="mt-1 text-sm text-neutral-900">{indicator.name}</p>
                <p className="mt-2 font-mono text-[11px] text-neutral-500">
                  {indicator.formula} <span className="not-italic">[{indicator.unit}]</span>
                </p>
                <p className="mt-1 text-xs text-violet-700">{indicator.target}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
          <p>
            <span className="text-neutral-900">Autores:</span>{' '}
            {THESIS_AUTHORS.join(' · ')}
          </p>
          <p className="mt-1">
            <span className="text-neutral-900">Asesor:</span> {THESIS_ADVISOR}
          </p>
          <p className="mt-3">
            {THESIS_INSTITUTION} — {THESIS_SCHOOL}
          </p>
        </footer>
      </div>
    </main>
  );
}

function EntryCard({
  href,
  icon,
  title,
  description,
  cta,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  accent: 'brand' | 'data';
}) {
  // The two accents are the same pair the portal uses everywhere else: purple for the staff's own
  // surfaces, violet for anything the AI or the patient touches.
  const tone =
    accent === 'brand'
      ? 'text-purple-900 hover:border-purple-900'
      : 'text-violet-700 hover:border-violet-700';

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-lg border border-neutral-200 bg-white p-6 transition-colors ${tone}`}
    >
      {icon}
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-neutral-500">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium group-hover:underline">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
