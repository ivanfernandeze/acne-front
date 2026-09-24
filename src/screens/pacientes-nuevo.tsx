'use client';

import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PatientFields, type PatientFieldValues } from '@/components/portal/patient-fields';
import { useSession } from '@/components/session-provider';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { api, type PostResult } from '@/lib/api';
import { useAction } from '@/lib/use-api';
import { useCatalogs } from '@/lib/use-catalogs';
import { validateFullName } from '@/lib/user-validation';
import { usePortalHref } from '@/lib/use-portal';

type CreatedPatient = PostResult<'/patients'>;

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
 * Registers a patient on its own, without opening a case.
 *
 * Until now the only door into `POST /patients` was the patient block of the case intake, so
 * admitting someone who is not being seen today — a pre-registration, a person who came in only to
 * sign the consent — meant opening a case nobody was going to review. Registering a person and
 * opening a visit are two different acts, and now they are two different screens.
 */
export default function NuevoPacientePage(): JSX.Element {
  const href = usePortalHref();
  const router = useRouter();
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();

  const [values, setValues] = useState<PatientFieldValues>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const intakeRoles = catalogs?.roles.groups.intake ?? [];
  const mayRegister = user !== null && intakeRoles.includes(user.role);
  const mayEditIdentity = (catalogs?.roles.groups.identity ?? []).includes(user?.role ?? '');

  const create = useAction(async () =>
    api.post<CreatedPatient>('/patients', {
      fullName: values.fullName,
      documentId: values.documentId === '' ? undefined : values.documentId,
      phone: values.phone === '' ? undefined : values.phone,
      email: values.email === '' ? undefined : values.email,
      birthDate: values.birthDate === '' ? undefined : values.birthDate,
      sex: values.sex === '' ? undefined : values.sex,
      fitzpatrickPhototype: values.fitzpatrick === '' ? undefined : values.fitzpatrick,
      consentAccepted: consent,
    }),
  );

  // Waits for the catalogue: deciding on an empty role list would flash the refusal at everyone,
  // including the roles that are allowed in.
  if (catalogs !== null && !mayRegister) {
    return (
      <Alert tone="warning" title="Su rol no registra pacientes">
        El alta la realiza la mesa de admisión: técnico, dermatólogo o administrador.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={href('/pacientes')}
        className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al registro de pacientes
      </Link>

      <Card>
        <CardHeader
          title="Nuevo paciente"
          description="Solo da de alta a la persona. El caso de una visita se abre aparte, cuando corresponda."
        />
        <CardBody className="space-y-4">
          <PatientFields
            values={values}
            onChange={setValues}
            identityEditable
            documentEditable={mayEditIdentity}
            nameError={nameError}
          />

          <Checkbox
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            label={
              <>
                El paciente otorgó su consentimiento informado para el uso de sus imágenes con fines
                de investigación académica.{' '}
                <span className="text-neutral-500">
                  Obligatorio (RNF-07, Ley N.º 29733).
                </span>
              </>
            }
          />

          {create.error !== null ? (
            <Alert tone="danger" title="No se pudo registrar al paciente">
              {create.error.message}
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              loading={create.pending}
              disabled={!consent}
              onClick={() => {
                const problem = validateFullName(values.fullName);
                setNameError(problem);
                if (problem !== null) return;
                void create.run().then((created) => {
                  if (created !== null) router.push(href(`/pacientes/${created.id}`));
                });
              }}
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Registrar paciente
            </Button>
            <Link
              href={href('/casos/nuevo')}
              className={buttonVariants({ variant: 'ghost' })}
            >
              Registrar y abrir un caso a la vez
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            El código <code>PAC-2026-XXXX</code> lo asigna el sistema. La identidad se cifra con
            AES-256-GCM y solo la ve el profesional tratante (RF-TR-03).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
