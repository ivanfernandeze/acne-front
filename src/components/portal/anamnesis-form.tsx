'use client';

import { AlertTriangle, History } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { CheckboxGroup, Input, RadioGroup, Textarea } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { date } from '@/lib/format';
import {
  anamnesisQuestionsFor,
  type AnamnesisAnswer,
  type AnamnesisQuestion,
  type Catalogs,
} from '@/lib/use-catalogs';

export type AnamnesisAnswers = Record<string, AnamnesisAnswer>;

/**
 * Acne intake questionnaire.
 *
 * The 21 questions are RENDERED, never written here: the wording comes from `GET /meta/catalogs`,
 * exactly like the Likert of Anexo 6, so the clinic's instrument exists in one place. This
 * component only decides how a question of each type is shown.
 *
 * Nothing here is required. An unanswered question is clinically different from a "no" — the
 * patient may simply not know — and with 21 questions per case, making them mandatory would turn
 * the intake into the bottleneck for reaching the census of 30.
 */
export function AnamnesisForm({
  catalogs,
  sex,
  ageYears,
  answers,
  onChange,
  prefill,
  onApplyPrefill,
  disabled,
}: {
  catalogs: Catalogs | null;
  sex: string | null;
  ageYears: number | null;
  answers: AnamnesisAnswers;
  onChange: (answers: AnamnesisAnswers) => void;
  prefill?: { caseCode: string; visitedAt: string } | null;
  onApplyPrefill?: () => void;
  disabled?: boolean;
}) {
  const questions = useMemo(
    () => anamnesisQuestionsFor(catalogs, sex, ageYears),
    [catalogs, sex, ageYears],
  );

  const sections = useMemo(() => {
    const grouped = new Map<string, AnamnesisQuestion[]>();
    for (const question of questions) {
      grouped.set(question.section, [...(grouped.get(question.section) ?? []), question]);
    }
    return [...grouped.entries()];
  }, [questions]);

  const answered = questions.filter((question) => isAnswered(answers[question.key])).length;
  const pregnancy = answers['embarazo_menopausia']?.value === 'embarazo actual';

  const set = (key: string, patch: Partial<AnamnesisAnswer>): void => {
    const current = answers[key] ?? { value: null };
    onChange({ ...answers, [key]: { ...current, ...patch } });
  };

  return (
    <div className="space-y-5">
      {prefill !== null && prefill !== undefined && onApplyPrefill !== undefined ? (
        <Alert tone="info" title="Este paciente ya tiene una anamnesis anterior">
          <p>
            Registrada en la visita {prefill.caseCode} del {date(prefill.visitedAt)}. Puede
            precargarla y actualizar solo lo que haya cambiado.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={onApplyPrefill}>
            <History className="h-4 w-4" aria-hidden />
            Precargar respuestas anteriores
          </Button>
        </Alert>
      ) : null}

      {pregnancy ? (
        <Alert tone="danger" title="Embarazo declarado">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Los retinoides orales son teratógenos. Este aviso queda visible en la ficha del caso; la
            decisión terapéutica es del profesional.
          </p>
        </Alert>
      ) : null}

      {questions.length === 0 ? (
        <Alert tone="warning" title="El cuestionario no tiene preguntas disponibles">
          El catálogo de anamnesis llegó vacío. Un administrador puede revisarlo en «Preguntas»; las
          respuestas precargadas se conservan y se mostrarán en cuanto el catálogo esté disponible.
        </Alert>
      ) : null}

      {sections.map(([section, sectionQuestions]) => (
        <Card key={section}>
          <CardHeader
            title={catalogs?.anamnesis.sectionLabels[section] ?? section}
            action={
              section === 'hormonal' ? (
                <Badge variant="outline">solo mujeres desde 18 años</Badge>
              ) : null
            }
          />
          <CardBody className="space-y-5">
            {sectionQuestions.map((question) => (
              <QuestionField
                key={question.key}
                question={question}
                answer={answers[question.key] ?? { value: null }}
                onValue={(value) => set(question.key, { value })}
                onDetail={(detail) => set(question.key, { detail })}
                disabled={disabled}
              />
            ))}
          </CardBody>
        </Card>
      ))}

      <p className="text-sm text-neutral-500">
        {answered} de {questions.length} preguntas respondidas. Ninguna es obligatoria: dejar una en
        blanco significa «no se preguntó o no lo sabe», que no es lo mismo que responder «no».
      </p>
    </div>
  );
}

function QuestionField({
  question,
  answer,
  onValue,
  onDetail,
  disabled,
}: {
  question: AnamnesisQuestion;
  answer: AnamnesisAnswer;
  onValue: (value: AnamnesisAnswer['value']) => void;
  onDetail: (detail: string) => void;
  disabled?: boolean;
}) {
  const options = (question.options ?? []).map((value) => ({ value, label: value }));
  // The follow-up only makes sense once the question it hangs off has been answered affirmatively.
  const showDetail =
    question.detail !== undefined && answer.value !== null && answer.value !== false;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-neutral-900">
        <span className="mr-1.5 text-neutral-500">{question.number}.</span>
        {question.text}
      </p>

      {question.type === 'booleano' ? (
        <RadioGroup
          name={question.key}
          value={answer.value === null ? null : answer.value === true ? 'sí' : 'no'}
          options={[
            { value: 'sí', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
          onChange={(value) => onValue(value === null ? null : value === 'sí')}
          disabled={disabled}
        />
      ) : question.type === 'opcion_unica' ? (
        <RadioGroup
          name={question.key}
          value={typeof answer.value === 'string' ? answer.value : null}
          options={options}
          onChange={onValue}
          disabled={disabled}
        />
      ) : question.type === 'opcion_multiple' ? (
        <CheckboxGroup
          name={question.key}
          values={Array.isArray(answer.value) ? answer.value : []}
          options={options}
          onChange={(values) => onValue(values.length === 0 ? null : values)}
          disabled={disabled}
        />
      ) : question.type === 'numero' ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            className="w-32"
            value={typeof answer.value === 'number' ? String(answer.value) : ''}
            onChange={(event) =>
              onValue(event.target.value === '' ? null : Number(event.target.value))
            }
            disabled={disabled}
            aria-label={question.text}
          />
          {question.unit !== undefined ? (
            <span className="text-sm text-neutral-500">{question.unit}</span>
          ) : null}
        </div>
      ) : question.type === 'texto' ? (
        <Textarea
          value={typeof answer.value === 'string' ? answer.value : ''}
          onChange={(event) => onValue(event.target.value === '' ? null : event.target.value)}
          disabled={disabled}
          aria-label={question.text}
          maxLength={500}
        />
      ) : (
        /*
         * Un tipo que el formulario no conoce, dicho en voz alta.
         *
         * Antes esta rama era el `<Textarea>` de arriba, de modo que un catálogo servido con
         * tipos que el portal no reconocía degradaba en silencio: las seis preguntas de elección
         * pasaron a renderizar una caja de texto libre cuando el dominio tradujo
         * `single_choice` a `opcion_unica`, y nada lo señaló. Un control equivocado sobre una
         * pregunta clínica es peor que un aviso feo.
         */
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          El portal no sabe cómo mostrar una pregunta de tipo <code>{question.type}</code>. Avise al
          administrador: el catálogo del servidor y esta pantalla no coinciden.
        </p>
      )}

      {showDetail ? (
        <Textarea
          placeholder={question.detail}
          value={answer.detail ?? ''}
          onChange={(event) => onDetail(event.target.value)}
          disabled={disabled}
          aria-label={question.detail}
          maxLength={500}
        />
      ) : null}

      {question.hint !== undefined ? (
        <p className="text-xs text-neutral-500">{question.hint}</p>
      ) : null}
    </div>
  );
}

function isAnswered(answer: AnamnesisAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer.value)) return answer.value.length > 0;
  if (answer.value !== null && answer.value !== undefined && answer.value !== '') return true;
  return typeof answer.detail === 'string' && answer.detail.trim() !== '';
}
