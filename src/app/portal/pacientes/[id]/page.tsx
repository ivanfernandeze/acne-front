'use client';

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarDays,
  Minus,
  Stethoscope,
  Timer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { SeverityEvolution, type SeverityPoint } from '@/components/charts/severity-evolution';
import { useSession } from '@/components/session-provider';
import { Badge, StudyModeBadge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, ErrorState, Loading, StudyModeBlocked } from '@/components/ui/feedback';
import { api, type GetResult } from '@/lib/api';
import { cn } from '@/lib/cn';
import { date, dateTime, num, pct } from '@/lib/format';
import { useApi } from '@/lib/use-api';
import { igaLabel, useCatalogs, type Catalogs } from '@/lib/use-catalogs';

type PatientHistory = GetResult<'/patients/{id}/history'>;
type HistoryEntry = PatientHistory['timeline'][number];

const SEVERITY_VARIANT: Record<string, 'neutral' | 'success' | 'primary' | 'warning' | 'danger'> = {
  sin_lesiones: 'success',
  casi_sin_lesiones: 'success',
  leve: 'primary',
  moderado: 'warning',
  severo: 'danger',
};

const TREND_STYLE = {
  mejora: {
    label: 'Mejora',
    icon: TrendingDown,
    tone: 'text-emerald-700 dark:text-emerald-400',
    note: 'La severidad IGA descendió respecto de la primera visita.',
  },
  empeora: {
    label: 'Empeora',
    icon: TrendingUp,
    tone: 'text-red-700 dark:text-red-400',
    note: 'La severidad IGA subió respecto de la primera visita.',
  },
  estable: {
    label: 'Estable',
    icon: Minus,
    tone: 'text-slate-500 dark:text-slate-400',
    note: 'La severidad IGA se mantiene igual que en la primera visita.',
  },
  sin_datos: {
    label: 'Sin evolución',
    icon: Minus,
    tone: 'text-slate-500 dark:text-slate-400',
    note: 'Hacen falta al menos dos visitas diagnosticadas para hablar de evolución.',
  },
} as const;

/**
 * Longitudinal clinical history of one patient.
 *
 * Complements — it does not replace — the case screen. The case screen is where the experiment is
 * run on a single observation; this is the follow-up view: the whole course of the person's acne,
 * visit by visit, with the severity recorded at each one, who signed it, how long the review took
 * and what the model said. The AI column simply is not there in pretest, because the API sends
 * `inference: null` for a requester in that condition (RF-TR-01).
 */
export default function PacienteHistoriaPage() {
  const params = useParams<{ id: string }>();
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();
  const [openCase, setOpenCase] = useState<string | null>(null);

  const history = useApi<PatientHistory>(`/patients/${params.id}/history`, {
    includeSynthetic: 'true',
  });

  if (history.loading && history.data === null) return <Loading label="Cargando historia…" />;
  if (history.error !== null) {
    return <ErrorState message={history.error.message} onRetry={history.reload} />;
  }
  if (history.data === null) return null;

  const { patient, summary, timeline } = history.data;
  const trend = TREND_STYLE[summary.trend as keyof typeof TREND_STYLE] ?? TREND_STYLE.sin_datos;
  const TrendIcon = trend.icon;

  const points: SeverityPoint[] = timeline
    .filter((entry): entry is HistoryEntry & { severity: string } => entry.severity !== null)
    .map((entry) => ({
      at: entry.createdAt,
      rank: catalogs?.iga.ordinal[entry.severity] ?? 0,
      label: igaLabel(catalogs, entry.severity),
      caseCode: entry.caseCode,
    }));

  return (
    <div className="space-y-5">
      <header>
        <Link
          href="/portal/pacientes"
          className="flex w-fit items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al registro de pacientes
        </Link>
        <h1 className="mt-1 font-(family-name:--font-poppins) text-xl font-bold text-slate-900 dark:text-slate-100">
          {patient.fullName ?? patient.patientCode}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-mono text-xs">{patient.patientCode}</span>
          <span aria-hidden>·</span>
          <span>{patient.ageYears === null ? 'Edad no registrada' : `${patient.ageYears} años`}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{patient.sex ?? 'sexo no registrado'}</span>
          <span aria-hidden>·</span>
          <span>Fototipo {patient.fitzpatrickPhototype ?? '—'}</span>
          {patient.withdrawnAt !== null ? <Badge variant="outline">retirado del estudio</Badge> : null}
        </p>
      </header>

      {patient.fullName === null ? (
        <Alert tone="info" title="Historia en modo anonimizado">
          Su rol no accede a la identidad del paciente, de modo que la historia se muestra
          referenciada por el código <code>{patient.patientCode}</code> (RF-TR-03).
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CalendarDays}
          label="Visitas registradas"
          value={String(summary.totalCases)}
          hint={
            summary.firstVisitAt === null
              ? 'Sin visitas'
              : `Desde ${date(summary.firstVisitAt)} · ${summary.closedCases} cerradas`
          }
        />
        <SummaryCard
          icon={Stethoscope}
          label="Severidad actual"
          value={igaLabel(catalogs, summary.lastSeverity)}
          hint={
            summary.firstSeverity === null
              ? 'Sin diagnóstico emitido'
              : `Al inicio: ${igaLabel(catalogs, summary.firstSeverity)}`
          }
        />
        <SummaryCard
          icon={TrendIcon}
          label="Evolución"
          value={trend.label}
          valueClassName={trend.tone}
          hint={
            summary.severityDelta === null
              ? trend.note
              : `${summary.severityDelta > 0 ? '+' : ''}${summary.severityDelta} escalón${
                  Math.abs(summary.severityDelta) === 1 ? '' : 'es'
                } IGA · ${trend.note}`
          }
        />
        <SummaryCard
          icon={Timer}
          label="Tiempo medio de revisión"
          value={summary.averageReviewMinutes === null ? '—' : `${num(summary.averageReviewMinutes)} min`}
          hint={`${summary.totalReviews} revisión${summary.totalReviews === 1 ? '' : 'es'} cronometrada${
            summary.totalReviews === 1 ? '' : 's'
          } (TRᵢ, Anexo 4)`}
        />
      </div>

      <Card>
        <CardHeader
          title="Curva de evolución IGA"
          description="Severidad clínica registrada por el especialista en cada visita. La escala es ordinal: la línea muestra la dirección y los escalones recorridos, no una distancia numérica."
        />
        <CardBody>
          <SeverityEvolution data={points} rankLabels={rankLabels(catalogs)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Cronología de visitas"
          description="Cada visita es un caso clínico con su fotografía, su diagnóstico y su tiempo de revisión."
        />
        <CardBody className="space-y-3">
          {timeline.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Este paciente todavía no tiene casos registrados.
            </p>
          ) : (
            timeline.map((entry, index) => (
              <VisitRow
                key={entry.caseId}
                entry={entry}
                index={index}
                previous={index === 0 ? null : timeline[index - 1] ?? null}
                catalogs={catalogs}
                aiVisible={user?.studyMode !== 'pretest'}
                expanded={openCase === entry.caseId}
                onToggle={() => setOpenCase((current) => (current === entry.caseId ? null : entry.caseId))}
              />
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/** Ordinal rank → clinical label, for the chart's Y axis. */
function rankLabels(catalogs: Catalogs | null): Record<number, string> {
  const labels: Record<number, string> = {};
  for (const [igaClass, rank] of Object.entries(catalogs?.iga.ordinal ?? {})) {
    labels[rank] = catalogs?.iga.labels[igaClass] ?? igaClass.replace(/_/g, ' ');
  }
  return labels;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  valueClassName,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardBody className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </p>
        <p
          className={cn(
            'font-(family-name:--font-poppins) text-xl font-bold text-slate-900 dark:text-slate-100',
            valueClassName,
          )}
        >
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      </CardBody>
    </Card>
  );
}

/**
 * One visit in the timeline.
 *
 * Collapsed it shows what a physician scans for — when, what grade, and whether it moved since the
 * previous visit; expanded it shows the photograph, every diagnosis signed on the case, the
 * chronometry of both conditions and the model's suggestion.
 */
function VisitRow({
  entry,
  index,
  previous,
  catalogs,
  aiVisible,
  expanded,
  onToggle,
}: {
  entry: HistoryEntry;
  index: number;
  previous: HistoryEntry | null;
  catalogs: Catalogs | null;
  aiVisible: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ordinal = catalogs?.iga.ordinal ?? {};
  const step =
    entry.severity === null || previous?.severity == null
      ? null
      : (ordinal[entry.severity] ?? 0) - (ordinal[previous.severity] ?? 0);

  const clinicalImage = entry.images.find((image) => !image.isHeatmap);

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100">
          {index + 1}
        </span>
        <span className="min-w-40">
          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            {date(entry.createdAt)}
          </span>
          <span className="block font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {entry.caseCode}
          </span>
        </span>

        {entry.severity === null ? (
          <Badge variant="outline">sin diagnóstico</Badge>
        ) : (
          <Badge variant={SEVERITY_VARIANT[entry.severity] ?? 'neutral'}>
            {igaLabel(catalogs, entry.severity)}
          </Badge>
        )}

        {step === null || step === 0 ? null : (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              step < 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400',
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            {step < 0 ? 'bajó' : 'subió'} {Math.abs(step)} escalón{Math.abs(step) === 1 ? '' : 'es'}
          </span>
        )}

        {entry.isSynthetic ? <Badge variant="outline">sintético</Badge> : null}

        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {expanded ? 'Ocultar detalle' : 'Ver detalle'}
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-4 border-t border-slate-200 dark:border-slate-700 p-4 lg:grid-cols-[minmax(0,240px)_1fr]">
          <div>
            {clinicalImage === undefined ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Sin imagen registrada.</p>
            ) : (
              /* Signed URL with a 15-minute TTL, served decrypted by the API (RNF-02). */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={api.url(clinicalImage.url.replace(/^\/api/, ''))}
                alt={`Fotografía clínica del caso ${entry.caseCode}`}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-contain"
              />
            )}
            <Link
              href={`/portal/casos/${entry.caseId}`}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-sky-900 dark:text-sky-400 hover:underline"
            >
              Abrir la ficha del caso
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="space-y-4 text-sm">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Diagnósticos emitidos
              </h3>
              <div className="mt-2 space-y-2">
                {entry.diagnoses.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">
                    Todavía no se ha emitido ningún diagnóstico en esta visita.
                  </p>
                ) : (
                  entry.diagnoses.map((diagnosis) => (
                    <div
                      key={diagnosis.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2"
                    >
                      <StudyModeBadge mode={diagnosis.studyMode} />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {igaLabel(catalogs, diagnosis.igaClass)}
                      </span>
                      {diagnosis.gagsScore !== null ? (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          GAGS {diagnosis.gagsScore}
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {diagnosis.professional} · {dateTime(diagnosis.createdAt)}
                      </span>
                      {diagnosis.notes !== null && diagnosis.notes !== '' ? (
                        <p className="w-full text-xs text-slate-500 dark:text-slate-400">
                          {diagnosis.notes}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tiempos de revisión
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.timings.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">Sin cronometrías registradas.</p>
                ) : (
                  entry.timings.map((timing) => (
                    <div
                      key={`${timing.studyMode}-${timing.t0}`}
                      className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2"
                    >
                      <StudyModeBadge mode={timing.studyMode} />
                      <span className="tabular-nums text-slate-900 dark:text-slate-100">
                        {timing.reviewMinutes === null ? '—' : `${num(timing.reviewMinutes)} min`}
                      </span>
                      {!timing.valid ? <Badge variant="warning">descartada</Badge> : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Brain className="h-3.5 w-3.5" aria-hidden />
                Sugerencia de la IA
              </h3>
              <div className="mt-2">
                {/* `inference: null` has two very different meanings, and conflating them would
                    misreport the experiment: in pretest the API withholds the block by design
                    (RF-TR-01); in postest it means the case simply has no inference yet. */}
                {entry.inference === null ? (
                  aiVisible ? (
                    <p className="text-slate-500 dark:text-slate-400">
                      Esta visita no tiene ninguna inferencia registrada.
                    </p>
                  ) : (
                    <StudyModeBlocked />
                  )
                ) : (
                  <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-cyan-700 dark:text-cyan-400">
                        {igaLabel(catalogs, entry.inference.igaClass)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Confianza{' '}
                        {entry.inference.confidence === null
                          ? '—'
                          : pct(entry.inference.confidence * 100)}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {entry.inference.modelVersion}
                      </span>
                    </div>
                    {entry.inference.modelBackend === 'stub' ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Backend de demostración: la sugerencia no proviene de una CNN entrenada y no
                        puede citarse como resultado de la tesis.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </section>

            {entry.groundTruthIga !== null ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patrón de consenso del lote:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {igaLabel(catalogs, entry.groundTruthIga)}
                </strong>{' '}
                — es el referente común que hace comparables pretest y postest (RF-OE2-05).
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
