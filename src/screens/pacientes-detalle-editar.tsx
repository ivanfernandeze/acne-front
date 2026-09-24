'use client';

import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PatientFields, type PatientFieldValues } from '@/components/portal/patient-fields';
import { useSession } from '@/components/session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, ErrorState, Loading } from '@/components/ui/feedback';
import { api, type GetResult, type PatchResult } from '@/lib/api';
import { useApi, useAction } from '@/lib/use-api';
import { useCatalogs } from '@/lib/use-catalogs';
import { usePortalHref } from '@/lib/use-portal';

type Patient = GetResult<'/patients/{id}'>;
type Identity = GetResult<'/patients/{id}/identity'>;
type UpdatedPatient = PatchResult<'/patients/{id}'>;

const EMPTY: PatientFieldValues = {
  fullName: '',
  documentId: '',
  phone: '',
  email: '',
  birthDate: '',
  sex: '',
  fitzpatrick: '',
};

/**
 * Corrects a patient record that already exists.
 *
 * Until this screen there was no way to fix a mistyped name or add a phototype that was skipped at
 * intake — and the phototype feeds the equity audit of section 8.2, so the wrong value is not
 * cosmetic.
 *
 * Which fields appear depends on the role, mirroring the server rather than duplicating its rules:
 * `catalogs.roles.groups` says who may see an identity, and the API refuses the write anyway.
 */
export default function EditarPacientePage(): JSX.Element {
  const href = usePortalHref();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();
  const patientId = params.id;

  const patient = useApi<Patient>(`/patients/${patientId}`);

  const identityRoles = catalogs?.roles.groups.identity ?? [];
  const documentRoles = catalogs?.roles.groups.diagnosing ?? [];
  const mayEditIdentity = user !== null && identityRoles.includes(user.role);
  const mayEditDocument = user !== null && documentRoles.includes(user.role);

  // Fetched only when the role may edit it. Opening this form triggers an audited identity read
  // (`patient.identity.read`), which is why the screen says so out loud.
  const identity = useApi<Identity>(mayEditDocument ? `/patients/${patientId}/identity` : null);

  const [values, setValues] = useState<PatientFieldValues>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (patient.data === null || loaded) return;
    if (mayEditDocument && identity.data === null && identity.error === null) return;

    setValues({
      fullName: identity.data?.fullName ?? patient.data.fullName ?? '',
      documentId: identity.data?.documentId ?? '',
      phone: identity.data?.phone ?? '',
      email: identity.data?.email ?? '',
      birthDate: patient.data.birthDate ?? '',
      sex: patient.data.sex ?? '',
      fitzpatrick: patient.data.fitzpatrickPhototype ?? '',
    });
    setLoaded(true);
  }, [patient.data, identity.data, identity.error, mayEditDocument, loaded]);

  const save = useAction(async () =>
    api.patch<UpdatedPatient>(`/patients/${patientId}`, {
      // Only the fields this role may write are sent at all. The server refuses the rest, but a
      // request that asks for something it knows will be refused is a bug waiting to be reported.
      ...(mayEditIdentity && values.fullName !== '' ? { fullName: values.fullName } : {}),
      ...(mayEditDocument && values.documentId !== '' ? { documentId: values.documentId } : {}),
      // El contacto sigue al nombre: quien puede leerlo puede corregirlo.
      ...(mayEditIdentity && values.phone !== '' ? { phone: values.phone } : {}),
      ...(mayEditIdentity && values.email !== '' ? { email: values.email } : {}),
      ...(values.birthDate === '' ? {} : { birthDate: values.birthDate }),
      ...(values.sex === '' ? {} : { sex: values.sex }),
      ...(values.fitzpatrick === '' ? {} : { fitzpatrickPhototype: values.fitzpatrick }),
    }),
  );

  if (patient.loading && patient.data === null) return <Loading label="Abriendo la ficha…" />;
  if (patient.error !== null) {
    return <ErrorState message={patient.error.message} onRetry={patient.reload} />;
  }
  if (patient.data === null) return <></>;

  const withdrawn = patient.data.withdrawnAt !== null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={href(`/pacientes/${patientId}`)}
        className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a la historia
      </Link>

      <Card>
        <CardHeader
          title="Corregir ficha del paciente"
          description={`Registro ${patient.data.patientCode}. El código no se cambia nunca: es lo que ancla toda su serie de casos.`}
        />
        <CardBody className="space-y-4">
          {withdrawn ? (
            <Alert tone="warning" title="El paciente está retirado del estudio">
              Su ficha no puede corregirse mientras siga retirado. Reincorpórelo desde su historia
              si el retiro se registró por error.
            </Alert>
          ) : null}

          {!mayEditIdentity ? (
            <Alert tone="info" title="Su rol no accede a la identidad del paciente">
              <p>
                Puede corregir los datos clínicos —fecha de nacimiento, sexo y fototipo— pero no el
                nombre ni el documento, que RF-TR-03 reserva al profesional tratante.
              </p>
            </Alert>
          ) : null}

          {mayEditDocument ? (
            <p className="flex items-start gap-2 text-xs text-neutral-500">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Abrir este formulario descifra la identidad del paciente y queda registrado en la
              traza de auditoría (RNF-02).
            </p>
          ) : null}

          <PatientFields
            values={values}
            onChange={setValues}
            identityEditable={mayEditIdentity}
            documentEditable={mayEditDocument}
            nameRequired={false}
          />

          {save.error !== null ? (
            <Alert tone="danger" title="No se pudo guardar">
              {save.error.message}
            </Alert>
          ) : null}

          <Button
            block
            loading={save.pending}
            disabled={withdrawn}
            onClick={() => {
              void save.run().then((updated) => {
                if (updated !== null) router.push(href(`/pacientes/${patientId}`));
              });
            }}
          >
            Guardar correcciones
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
