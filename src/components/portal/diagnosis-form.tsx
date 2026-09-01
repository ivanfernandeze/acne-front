'use client';

import { Stethoscope } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useAction } from '@/lib/use-api';
import { useCatalogs } from '@/lib/use-catalogs';

/**
 * Definitive diagnosis of the specialist.
 *
 * Submitting closes the whole measurement in one server-side transaction: it stamps `t₁` (OE1),
 * freezes the agreement against the consensus label (OE2) and counts the case towards NCR of the
 * open journey (OE4).
 *
 * When the AI suggestion is visible, the form does NOT preselect it. Pre-filling the physician's
 * answer with the model's would turn "assisted diagnosis" into "confirmation of the model", and
 * the agreement rate OE2 measures would stop meaning anything.
 */
export function DiagnosisForm({
  caseId,
  aiSuggestion,
  onSubmitted,
}: {
  caseId: string;
  aiSuggestion: string | null;
  onSubmitted: () => void;
}) {
  const { data: catalogs } = useCatalogs();
  const [igaClass, setIgaClass] = useState('');
  const [gagsScore, setGagsScore] = useState('');
  const [notes, setNotes] = useState('');

  const { run, pending, error } = useAction(async () =>
    api.post(`/diagnoses/case/${caseId}`, {
      igaClass,
      gagsScore: gagsScore === '' ? undefined : Number(gagsScore),
      notes: notes === '' ? undefined : notes,
      ...(aiSuggestion !== null ? { aiSuggestionAccepted: igaClass === aiSuggestion } : {}),
    }),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (igaClass === '') return;
    const result = await run();
    if (result !== null) onSubmitted();
  }

  const classes = catalogs?.iga.classes ?? [];

  return (
    <Card>
      <CardHeader
        title="Diagnóstico del especialista"
        description="Su juicio es el diagnóstico clínicamente vinculante."
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Clase IGA"
            required
            hint="Investigator's Global Assessment: escala ordinal de cinco niveles."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {classes.map((value) => {
                const selected = igaClass === value;
                const isAiSuggestion = aiSuggestion === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIgaClass(value)}
                    aria-pressed={selected}
                    className={cn(
                      'flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'border-sky-900 dark:border-sky-400 bg-sky-50 dark:bg-sky-950 font-medium text-sky-900 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-sky-900/50 dark:hover:border-sky-400/50 hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <span>{catalogs?.iga.labels[value] ?? value}</span>
                    {isAiSuggestion ? (
                      <span className="ml-2 rounded-full bg-cyan-700/15 dark:bg-cyan-400/15 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:text-cyan-400">
                        sugerida por IA
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Puntaje GAGS (opcional)"
            hint="Escala secundaria Global Acne Grading System, de 0 a 44."
          >
            <Input
              type="number"
              min={0}
              max={44}
              value={gagsScore}
              onChange={(event) => setGagsScore(event.target.value)}
              placeholder="Ej. 24"
            />
          </Field>

          <Field label="Observaciones (opcional)">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Hallazgos relevantes, calidad de la imagen, dudas diagnósticas…"
            />
          </Field>

          {error !== null ? (
            <Alert tone="danger" title="No se pudo registrar el diagnóstico">
              {error.message}
            </Alert>
          ) : null}

          <Button type="submit" block loading={pending} disabled={igaClass === ''}>
            <Stethoscope className="h-4 w-4" aria-hidden />
            Emitir diagnóstico definitivo
          </Button>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Al enviar se cierra el cronómetro de la revisión y la medición queda registrada como
            evidencia del estudio.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
