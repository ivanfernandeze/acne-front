'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, Loading } from '@/components/ui/feedback';
import { Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui/table';
import type { GetResult } from '@/lib/api';
import { dateTime, num, pct } from '@/lib/format';
import { useApi } from '@/lib/use-api';

type Coverage = GetResult<'/audit/thesis-coverage'>;
type IiaCheck = GetResult<'/audit/iia-check'>;

/** Covers: RNF-04 (`/audit/thesis-coverage`) and RF-TR-04 (`/audit/iia-check`). */
export default function AuditoriaPage() {
  const coverage = useApi<Coverage>('/audit/thesis-coverage');
  const iia = useApi<IiaCheck>('/audit/iia-check');

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-slate-900 dark:text-slate-100">Auditoría de la tesis</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Matriz de cobertura de objetivos y verificación de la variable independiente.
        </p>
      </header>

      <Card className={iia.data?.operational === true ? 'border-emerald-600/50 dark:border-emerald-400/50' : 'border-amber-500/50 dark:border-amber-400/50'}>
        <CardHeader
          title="Verificación de la variable independiente (IIA)"
          description="Instrumento que valida IIA = 1: la ficha técnica de operatividad del modelo."
          action={
            iia.data === null ? null : iia.data.operational ? (
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3" aria-hidden /> IIA = 1
              </Badge>
            ) : (
              <Badge variant="warning">
                <ShieldAlert className="h-3 w-3" aria-hidden /> IIA = 0
              </Badge>
            )
          }
        />
        <CardBody className="space-y-4">
          {iia.loading ? (
            <Loading />
          ) : iia.data === null ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No se pudo contactar al motor de IA.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Backend" value={iia.data.modelBackend} />
                <Metric label="Versión del modelo" value={iia.data.version} />
                <Metric label="Inferencias (24 h)" value={String(iia.data.inferences24h)} />
                <Metric label="Tasa de error (24 h)" value={pct(iia.data.errorRate24h * 100)} />
                <Metric
                  label="Latencia mediana (motor)"
                  value={
                    iia.data.engineLatencyMedian24hMs === null
                      ? '—'
                      : `${num(iia.data.engineLatencyMedian24hMs, 0)} ms`
                  }
                />
                <Metric
                  label="Latencia p95 (extremo a extremo)"
                  value={
                    iia.data.orchestratorLatencyP95_24hMs === null
                      ? '—'
                      : `${num(iia.data.orchestratorLatencyP95_24hMs, 0)} ms`
                  }
                />
                <Metric label="Semilla" value={String(iia.data.seed)} />
                <Metric
                  label="RNF-01 (p95 ≤ 8000 ms)"
                  value={
                    iia.data.meetsRnf01 === null
                      ? 'sin datos'
                      : iia.data.meetsRnf01
                        ? 'cumple'
                        : 'no cumple'
                  }
                />
              </div>

              {iia.data.weightsChecksum !== null ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Checksum de pesos: <code>{iia.data.weightsChecksum.slice(0, 24)}…</code>
                </p>
              ) : null}

              {iia.data.warnings.length > 0 ? (
                <Alert tone="warning" title="Advertencias del checklist">
                  <ul className="list-disc space-y-1 pl-4">
                    {iia.data.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              ) : null}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verificado el {dateTime(iia.data.checkedAt)}.
              </p>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Matriz de cobertura de objetivos (RNF-04)"
          description="La cobertura se calcula a partir del estado real del sistema, no se declara a mano."
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
        <CardBody className="space-y-4">
          {coverage.loading ? (
            <Loading />
          ) : coverage.data === null ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Sin datos.</p>
          ) : (
            <>
              {coverage.data.blockers.length > 0 ? (
                <Alert tone="warning" title="Bloqueantes">
                  <ul className="list-disc space-y-1 pl-4">
                    {coverage.data.blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                </Alert>
              ) : (
                <Alert tone="success" title="Sin bloqueantes">
                  Todos los objetivos tienen su evidencia disponible.
                </Alert>
              )}

              <Table>
                <Thead>
                  <Tr>
                    <Th>Objetivo</Th>
                    <Th>Indicador</Th>
                    <Th>Fórmula</Th>
                    <Th>Meta</Th>
                    <Th>Estado</Th>
                    <Th>Módulos</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {coverage.data.entries.map((entry) => (
                    <Tr key={entry.objective}>
                      <Td>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{entry.objective}</span>
                        <p className="mt-0.5 max-w-xs text-xs text-slate-500 dark:text-slate-400">{entry.description}</p>
                      </Td>
                      <Td className="text-sm">{entry.indicator ?? '—'}</Td>
                      <Td className="font-mono text-xs">{entry.formula ?? '—'}</Td>
                      <Td className="max-w-40 text-xs text-slate-500 dark:text-slate-400">{entry.target ?? '—'}</Td>
                      <Td>
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
                      </Td>
                      <Td>
                        <div className="flex max-w-64 flex-wrap gap-1">
                          {entry.modules.map((module) => (
                            <code
                              key={module}
                              className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400"
                            >
                              {module}
                            </code>
                          ))}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Documento de trazabilidad: <code>{coverage.data.traceabilityDocument}</code> ·
                generado el {dateTime(coverage.data.generatedAt)}.
              </p>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
