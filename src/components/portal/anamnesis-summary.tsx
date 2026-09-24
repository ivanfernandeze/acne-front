'use client';

import { AlertTriangle, ClipboardList } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, Loading } from '@/components/ui/feedback';
import type { GetResult } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { useCatalogs, type AnamnesisAnswer } from '@/lib/use-catalogs';
import { usePortalHref } from '@/lib/use-portal';

type Anamnesis = GetResult<'/cases/{caseId}/anamnesis'>;

/**
 * The intake history, read-only, on the case file.
 *
 * Shown identically in pretest and postest and never gated by `aiVisible`. If it appeared only
 * alongside the model's suggestion, the paired contrast of HE₁ and HE₂ would be comparing
 * "anamnesis + IA" against "nothing" and would no longer isolate the intervention.
 *
 * Only answered questions are listed: a wall of 21 rows mostly reading "—" is harder to scan during
 * a consultation than the six things the patient actually said.
 */
export function AnamnesisSummary({ caseId }: { caseId: string }) {
  const href = usePortalHref();
  const { data: catalogs } = useCatalogs();
  const anamnesis = useApi<Anamnesis>(`/cases/${caseId}/anamnesis`);

  // The whole catalogue, not the branch that applies to this patient: what is shown is driven by
  // what was ANSWERED, so a record taken under an older branching rule still reads correctly.
  const questions = catalogs?.anamnesis.questions ?? [];
  const answers = (anamnesis.data?.answers ?? {}) as Record<string, AnamnesisAnswer>;
  const answered = questions.filter((question) => isAnswered(answers[question.key]));

  return (
    <Card>
      <CardHeader
        title="Anamnesis del ingreso"
        description="Historia tomada antes de las fotografías, fuera de la ventana cronometrada."
        action={
          anamnesis.data === null ? null : (
            <Badge variant={anamnesis.data.complete ? 'success' : 'outline'}>
              {anamnesis.data.answeredCount} de {anamnesis.data.applicableCount}
            </Badge>
          )
        }
      />
      <CardBody className="space-y-3">
        {anamnesis.loading && anamnesis.data === null ? (
          <Loading label="Cargando la anamnesis…" />
        ) : anamnesis.error !== null ? (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <ClipboardList className="h-4 w-4" aria-hidden />
            {anamnesis.error.status === 404
              ? 'Este caso se registró sin anamnesis.'
              : anamnesis.error.message}
          </p>
        ) : anamnesis.data === null ? null : (
          <>
            {anamnesis.data.pregnancyFlag ? (
              <Alert tone="danger" title="Embarazo declarado">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Los retinoides orales son teratógenos. Aviso informativo; la decisión terapéutica
                  es del profesional (RNF-06).
                </p>
              </Alert>
            ) : null}

            {answered.length === 0 ? (
              <p className="text-sm text-neutral-500">
                La anamnesis está registrada pero sin respuestas.
              </p>
            ) : (
              <dl className="space-y-2.5">
                {answered.map((question) => {
                  const answer = answers[question.key];
                  return (
                    <div key={question.key}>
                      <dt className="text-xs text-neutral-500">
                        {question.text}
                      </dt>
                      <dd className="text-sm text-neutral-900">
                        {formatValue(answer?.value)}
                        {typeof answer?.detail === 'string' && answer.detail.trim() !== '' ? (
                          <span className="block text-sm text-neutral-500">
                            {answer.detail}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            <p className="border-t border-neutral-200 pt-2 text-xs text-neutral-500">
              Cuestionario versión {anamnesis.data.version} ·{' '}
              <Link
                href={href(`/casos/${caseId}`)}
                className="text-purple-900 hover:underline"
              >
                se registra en el alta del caso
              </Link>
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function formatValue(value: AnamnesisAnswer['value'] | undefined): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function isAnswered(answer: AnamnesisAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer.value)) return answer.value.length > 0;
  if (answer.value !== null && answer.value !== undefined && answer.value !== '') return true;
  return typeof answer.detail === 'string' && answer.detail.trim() !== '';
}
