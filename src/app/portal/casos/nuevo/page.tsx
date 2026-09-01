'use client';

import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field, Input, LabelledInput, Select } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { api, type GetResult, type PostResult } from '@/lib/api';
import { useAction, useApi } from '@/lib/use-api';
import { useCatalogs } from '@/lib/use-catalogs';

type Patient = GetResult<'/patients'>[number];
type CaseSummary = PostResult<'/cases'>;

/**
 * Registers a patient and their case in one pass.
 *
 * The consent checkbox is mandatory and unticked by default (RNF-07): a prototype that handles
 * facial photographs of identifiable people cannot treat informed consent as an afterthought, and
 * the patient's name is encrypted before it reaches the database (RF-TR-03).
 */
export default function NuevoCasoPage() {
  const router = useRouter();
  const { data: catalogs } = useCatalogs();
  const fileInput = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('');
  const [fitzpatrick, setFitzpatrick] = useState('');
  const [consent, setConsent] = useState(false);
  const [groundTruth, setGroundTruth] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const existing = useApi<Patient[]>('/patients');
  const [existingPatientId, setExistingPatientId] = useState('');

  const create = useAction(async () => {
    let patientId = existingPatientId;

    if (patientId === '') {
      const patient = await api.post<Patient>('/patients', {
        fullName,
        documentId: documentId === '' ? undefined : documentId,
        birthDate: birthDate === '' ? undefined : birthDate,
        sex: sex === '' ? undefined : sex,
        fitzpatrickPhototype: fitzpatrick === '' ? undefined : fitzpatrick,
        consentAccepted: consent,
      });
      patientId = patient.id;
    }

    const created = await api.post<CaseSummary>('/cases', {
      patientId,
      groundTruthIga: groundTruth === '' ? undefined : groundTruth,
    });

    if (file !== null) {
      const formData = new FormData();
      formData.append('file', file);
      await api.upload(`/images/case/${created.id}`, formData);
    }

    return created;
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const created = await create.run();
    if (created !== null) router.push(`/portal/casos/${created.id}`);
  }

  const usingExisting = existingPatientId !== '';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/portal/casos"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a la bandeja
      </Link>

      <h1 className="font-display text-xl font-bold text-foreground">Nuevo caso clínico</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader
            title="Paciente"
            description="Los datos identificables se cifran con AES-256-GCM antes de almacenarse (RF-TR-03)."
          />
          <CardBody className="space-y-4">
            <Field
              label="Paciente ya registrado"
              hint="Seleccione uno para registrar un caso adicional, o deje vacío para crear uno nuevo."
            >
              <Select
                value={existingPatientId}
                onChange={(event) => setExistingPatientId(event.target.value)}
              >
                <option value="">— Registrar paciente nuevo —</option>
                {(existing.data ?? []).map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientCode}
                  </option>
                ))}
              </Select>
            </Field>

            {!usingExisting ? (
              <>
                <LabelledInput
                  label="Nombre completo"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Se almacena cifrado"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <LabelledInput
                    label="Documento de identidad"
                    value={documentId}
                    onChange={(event) => setDocumentId(event.target.value)}
                  />
                  <LabelledInput
                    label="Fecha de nacimiento"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                  />
                  <Field label="Sexo">
                    <Select value={sex} onChange={(event) => setSex(event.target.value)}>
                      <option value="">Sin especificar</option>
                      {(catalogs?.sexes ?? []).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Fototipo Fitzpatrick"
                    hint="Para la auditoría de equidad por fototipo."
                  >
                    <Select
                      value={fitzpatrick}
                      onChange={(event) => setFitzpatrick(event.target.value)}
                    >
                      <option value="">Sin especificar</option>
                      {(catalogs?.fitzpatrick ?? []).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <label className="flex items-start gap-2 rounded-md border border-border bg-surface-muted px-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    <strong className="text-foreground">Consentimiento informado</strong> — el
                    paciente ha sido informado del propósito académico del estudio, del tratamiento
                    de su imagen facial y de su derecho a retirarse en cualquier momento
                    (Ley N.º 29733, RNF-07).
                  </span>
                </label>
              </>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Caso" />
          <CardBody className="space-y-4">
            <Field
              label="Patrón de consenso IGA (opcional)"
              hint="Etiqueta de referencia del lote. Es lo que hace comparables pretest y postest (RF-OE2-05); sin ella el caso no aporta al cálculo de TPD."
            >
              <Select value={groundTruth} onChange={(event) => setGroundTruth(event.target.value)}>
                <option value="">Sin patrón de consenso</option>
                {(catalogs?.iga.classes ?? []).map((value) => (
                  <option key={value} value={value}>
                    {catalogs?.iga.labels[value] ?? value}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Imagen clínica facial"
              hint="JPEG, PNG o WebP, hasta 15 MB. Se cifra en reposo (RNF-02)."
            >
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
                  <Upload className="h-4 w-4" aria-hidden />
                  Seleccionar imagen
                </Button>
                <span className="truncate text-sm text-muted">
                  {file?.name ?? 'Ningún archivo seleccionado'}
                </span>
              </div>
              <Input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </Field>
          </CardBody>
        </Card>

        {create.error !== null ? (
          <Alert tone="danger" title="No se pudo registrar el caso">
            {create.error.message}
          </Alert>
        ) : null}

        <Button
          type="submit"
          block
          loading={create.pending}
          disabled={!usingExisting && (fullName === '' || !consent)}
        >
          Registrar caso y abrir la ficha
        </Button>
      </form>
    </div>
  );
}
