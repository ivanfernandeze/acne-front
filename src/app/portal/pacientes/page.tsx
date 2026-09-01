'use client';

import { ChevronRight, Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useSession } from '@/components/session-provider';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/field';
import { EmptyState, ErrorState, Loading } from '@/components/ui/feedback';
import { Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui/table';
import type { GetResult } from '@/lib/api';
import { date } from '@/lib/format';
import { useApi, useDebouncedValue } from '@/lib/use-api';
import { igaLabel, useCatalogs } from '@/lib/use-catalogs';

type PatientSummary = GetResult<'/patients'>[number];

/** Colour by severity, so a tray of patients can be triaged at a glance. */
const SEVERITY_VARIANT: Record<string, 'neutral' | 'success' | 'primary' | 'warning' | 'danger'> = {
  sin_lesiones: 'success',
  casi_sin_lesiones: 'success',
  leve: 'primary',
  moderado: 'warning',
  severo: 'danger',
};

/**
 * Patient registry.
 *
 * The case tray answers "what is left to review" for the experiment; this answers "who is this
 * person and how have they been doing", which is the question a follow-up consultation starts
 * from. The name is shown only to `dermatologo` and `residente` — for every other role the API
 * returns `fullName: null` and the row falls back to the anonymised code (RF-TR-03).
 */
export default function PacientesPage() {
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();

  const [search, setSearch] = useState('');
  const [includeWithdrawn, setIncludeWithdrawn] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim());

  const patients = useApi<PatientSummary[]>('/patients', {
    search: debouncedSearch === '' ? undefined : debouncedSearch,
    includeWithdrawn: includeWithdrawn ? 'true' : undefined,
  });

  const rows = patients.data ?? [];
  const withFollowUp = rows.filter((patient) => patient.caseCount > 1).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-poppins) text-xl font-bold text-slate-900 dark:text-slate-100">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registro clínico con el seguimiento de cada persona a lo largo de sus visitas.
          </p>
        </div>
        <Link href="/portal/casos/nuevo" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo caso
        </Link>
      </header>

      <Card>
        <CardHeader
          title="Búsqueda"
          description={
            user?.role === 'dermatologo' || user?.role === 'residente'
              ? 'Puede buscar por nombre o por código. Cada consulta del listado con identidad queda registrada en la auditoría.'
              : 'Su rol no accede a la identidad de los pacientes, así que la búsqueda opera sobre el código anonimizado.'
          }
          action={
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4" aria-hidden />
              {rows.length} paciente{rows.length === 1 ? '' : 's'}
              {withFollowUp > 0 ? ` · ${withFollowUp} con seguimiento` : ''}
            </span>
          }
        />
        <CardBody className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o por código…"
              className="pl-9"
              aria-label="Buscar paciente"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeWithdrawn}
              onChange={(event) => setIncludeWithdrawn(event.target.checked)}
              className="h-4 w-4 rounded border-slate-200 dark:border-slate-700 text-sky-900 dark:text-sky-400 focus:ring-sky-900 dark:focus:ring-sky-400"
            />
            Incluir pacientes retirados del estudio
          </label>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {/* Only blank the area on the FIRST load, so typing does not flash the list empty. */}
          {patients.loading && patients.data === null ? (
            <Loading label="Cargando pacientes…" />
          ) : patients.error !== null ? (
            <div className="p-5">
              <ErrorState message={patients.error.message} onRetry={patients.reload} />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No hay pacientes que coincidan"
              description="Registre un caso nuevo o ajuste la búsqueda."
            />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Paciente</Th>
                  <Th>Edad</Th>
                  <Th>Sexo</Th>
                  <Th>Fototipo</Th>
                  <Th numeric>Visitas</Th>
                  <Th>Última visita</Th>
                  <Th>Severidad actual</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((patient) => (
                  <Tr key={patient.id}>
                    <Td>
                      {patient.fullName !== null ? (
                        <>
                          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                            {patient.fullName}
                          </span>
                          <span className="block font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {patient.patientCode}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
                          {patient.patientCode}
                        </span>
                      )}
                      {patient.withdrawnAt !== null ? (
                        <Badge variant="outline" className="mt-1">
                          retirado
                        </Badge>
                      ) : null}
                    </Td>
                    <Td className="text-sm">
                      {patient.ageYears === null ? '—' : `${patient.ageYears} años`}
                    </Td>
                    <Td className="text-sm capitalize">{patient.sex ?? '—'}</Td>
                    <Td className="text-sm">{patient.fitzpatrickPhototype ?? '—'}</Td>
                    <Td numeric>
                      {patient.caseCount}
                      {patient.caseCount > 1 ? (
                        <span className="ml-1 text-xs text-emerald-700 dark:text-emerald-400">
                          seguimiento
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-sm text-slate-500 dark:text-slate-400">
                      {date(patient.lastVisitAt)}
                    </Td>
                    <Td>
                      {patient.lastSeverity === null ? (
                        <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                      ) : (
                        <Badge variant={SEVERITY_VARIANT[patient.lastSeverity] ?? 'neutral'}>
                          {igaLabel(catalogs, patient.lastSeverity)}
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <Link
                        href={`/portal/pacientes/${patient.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-sky-900 dark:text-sky-400 hover:underline"
                      >
                        Historia
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
