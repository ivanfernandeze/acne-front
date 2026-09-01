'use client';

import { AlertTriangle, ArrowRight, FileDown } from 'lucide-react';
import Link from 'next/link';

import { useSession } from '@/components/session-provider';
import { IndicatorCard } from '@/components/portal/indicator-card';
import { Badge, StudyModeBadge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, Loading } from '@/components/ui/feedback';
import { api, type GetResult } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { useCatalogs } from '@/lib/use-catalogs';

type Dashboard = GetResult<'/indicators/dashboard'>;
type Coverage = GetResult<'/audit/thesis-coverage'>;
type SurveyStatus = GetResult<'/surveys/status'>;

const REPORTS = [
  { key: 'indicadores', file: 'REPORTE-INDICADORES', label: 'Indicadores', objective: 'OE1–OE4' },
  {
    key: 'contraste-hipotesis',
    file: 'REPORTE-CONTRASTE-HIPOTESIS',
    label: 'Contraste de hipótesis',
    objective: 'OG · HE₁–HE₄',
  },
  { key: 'usabilidad', file: 'REPORTE-USABILIDAD', label: 'Usabilidad', objective: 'OE3' },
  {
    key: 'evaluacion-modelo',
    file: 'REPORTE-EVALUACION-MODELO',
    label: 'Evaluación del modelo',
    objective: 'OE2',
  },
] as const;

export default function PortalHomePage() {
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();

  const dashboard = useApi<Dashboard>('/indicators/dashboard', { includeSynthetic: true });
  const coverage = useApi<Coverage>('/audit/thesis-coverage');
  const survey = useApi<SurveyStatus>('/surveys/status');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900 dark:text-slate-100">
            Hola, {user?.fullName ?? ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Diseño preexperimental pretest–postest de un solo grupo · G: O₁ → X → O₂ · censo de 30
            casos.
          </p>
        </div>
        {user !== null ? <StudyModeBadge mode={user.studyMode} /> : null}
      </header>

      {survey.data?.due === true ? (
        <Alert tone="info" title="Le corresponde responder el cuestionario de satisfacción">
          Ha completado {survey.data.postestCasesCompleted} casos en postest, el umbral configurado
          es {survey.data.triggerThreshold}. El instrumento del Anexo 6 se aplica una única vez por
          profesional.
          <Link
            href="/portal/encuesta"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-sky-900 dark:text-sky-400 hover:underline"
          >
            Responder ahora <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Alert>
      ) : null}

      {(coverage.data?.blockers ?? []).length > 0 ? (
        <Alert tone="warning" title="La cobertura de objetivos no está completa">
          <ul className="list-disc space-y-1 pl-4">
            {(coverage.data?.blockers ?? []).map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-base font-semibold text-slate-900 dark:text-slate-100">
          Indicadores de la variable dependiente
        </h2>
        {dashboard.loading ? (
          <Loading />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(dashboard.data?.indicators ?? []).map((indicator) => (
              <IndicatorCard key={indicator.indicator} data={indicator} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Cobertura de objetivos (RNF-04)"
            description="La cobertura se calcula, no se declara."
            action={
              <Badge
                variant={
                  (coverage.data?.coveragePct ?? 0) === 100
                    ? 'success'
                    : (coverage.data?.coveragePct ?? 0) >= 50
                      ? 'warning'
                      : 'danger'
                }
              >
                {coverage.data?.coveragePct ?? 0} %
              </Badge>
            }
          />
          <CardBody className="space-y-2">
            {(coverage.data?.entries ?? []).map((entry) => (
              <div
                key={entry.objective}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{entry.objective}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {entry.indicator ?? '—'}
                </span>
                <Badge
                  variant={
                    entry.status === 'covered'
                      ? 'success'
                      : entry.status === 'partial'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {entry.status}
                </Badge>
              </div>
            ))}
            <Link
              href="/portal/auditoria"
              className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-sky-900 dark:text-sky-400 hover:underline"
            >
              Ver panel de auditoría <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Entregables de la tesis"
            description="Los cuatro reportes de la Sección 11, generados por el sistema."
          />
          <CardBody className="space-y-2">
            {REPORTS.map((report) => (
              <button
                key={report.key}
                type="button"
                onClick={() =>
                  void api.download(
                    `/reports/${report.key}/pdf?includeSynthetic=true`,
                    `${report.file}.pdf`,
                  )
                }
                className="flex w-full items-center gap-3 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-sm transition-colors hover:border-sky-900 dark:hover:border-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileDown className="h-4 w-4 shrink-0 text-sky-900 dark:text-sky-400" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900 dark:text-slate-100">{report.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{report.objective}</span>
                </span>
              </button>
            ))}
            <p className="flex items-start gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              La primera generación puede tardar: el servidor arranca Chromium para renderizar el
              PDF.
            </p>
          </CardBody>
        </Card>
      </div>

      {catalogs !== null ? (
        <p className="rounded-md border border-red-500/30 dark:border-red-400/30 bg-red-50 dark:bg-red-950 px-4 py-3 text-xs text-slate-900 dark:text-slate-100">
          <strong className="font-semibold">Aviso:</strong> {catalogs.disclaimer}
        </p>
      ) : null}

      <Link href="/portal/casos" className={buttonVariants({ variant: 'primary' })}>
        Ir a la bandeja de casos
      </Link>
    </div>
  );
}
