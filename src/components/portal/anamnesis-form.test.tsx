import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnamnesisForm } from '@/components/portal/anamnesis-form';
import type { AnamnesisQuestion, Catalogs } from '@/lib/use-catalogs';

/**
 * Every question type of the catalogue renders the control it is meant to render.
 *
 * Regression test for a bug the type checker could not see and that degraded silently. The question
 * types are served by `GET /meta/catalogs`, whose handler returns `Record<string, unknown>` —
 * OpenAPI cannot describe it, so `use-catalogs.ts` declares the union by hand. When the domain
 * translated `single_choice` to `opcion_unica`, that hand-written union kept the old strings and
 * the six choice questions of the intake questionnaire fell through to the free-text branch: the
 * technician got a text box where a list of options belonged, on a clinical questionnaire, with
 * nothing anywhere reporting a problem.
 *
 * The fallthrough is now an explicit warning, and this pins each type to its control.
 */
function catalogsWith(question: AnamnesisQuestion): Catalogs {
  return {
    anamnesis: {
      version: '2.0',
      sectionLabels: { contexto: 'Datos básicos' },
      questions: [question],
    },
  } as unknown as Catalogs;
}

function question(overrides: Partial<AnamnesisQuestion>): AnamnesisQuestion {
  return {
    key: 'pregunta',
    number: 1,
    section: 'contexto',
    text: '¿Pregunta de prueba?',
    type: 'texto',
    scope: 'siempre',
    required: false,
    ...overrides,
  };
}

function renderOne(q: AnamnesisQuestion): void {
  render(
    <AnamnesisForm
      catalogs={catalogsWith(q)}
      sex="masculino"
      ageYears={30}
      answers={{}}
      onChange={() => {}}
    />,
  );
}

describe('AnamnesisForm', () => {
  it('booleano rinde Sí / No', () => {
    renderOne(question({ key: 'fumador', type: 'booleano' }));
    expect(screen.getByRole('radio', { name: 'Sí' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'No' })).toBeInTheDocument();
  });

  it('opcion_unica rinde un radio por opción', () => {
    renderOne(
      question({ key: 'tiempo', type: 'opcion_unica', options: ['1 a 6 meses', 'más de 1 año'] }),
    );
    expect(screen.getByRole('radio', { name: '1 a 6 meses' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'más de 1 año' })).toBeInTheDocument();
  });

  it('opcion_multiple rinde una casilla por opción', () => {
    renderOne(question({ key: 'sintomas', type: 'opcion_multiple', options: ['pican', 'arden'] }));
    // `CheckboxGroup` son botones de alternancia (`aria-pressed`), no casillas nativas; la
    // aserción va sobre ese atributo, que es lo que distingue una opción marcable de un botón.
    expect(screen.getByRole('button', { name: 'pican' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'arden' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('numero rinde un campo numérico', () => {
    renderOne(question({ key: 'peso_kg', type: 'numero', unit: 'kg' }));
    expect(screen.getByLabelText('¿Pregunta de prueba?')).toHaveAttribute('type', 'number');
  });

  it('texto rinde un área de texto', () => {
    renderOne(question({ key: 'productos', type: 'texto' }));
    expect(screen.getByLabelText('¿Pregunta de prueba?').tagName).toBe('TEXTAREA');
  });

  it('un tipo desconocido avisa en vez de degradar a texto libre', () => {
    // Exactamente lo que ocurrió: el servidor manda un tipo que esta pantalla no reconoce.
    renderOne(question({ key: 'raro', type: 'single_choice' as AnamnesisQuestion['type'] }));
    expect(screen.getByText(/no sabe cómo mostrar/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('AnamnesisForm without a catalogue', () => {
  it('says the questionnaire is empty instead of rendering nothing', () => {
    const empty = { anamnesis: { questions: [] } } as unknown as Catalogs;
    render(
      <AnamnesisForm
        catalogs={empty}
        sex="masculino"
        ageYears={30}
        answers={{ tiempo_evolucion: { value: '1 a 6 meses' } }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/no tiene preguntas disponibles/)).toBeInTheDocument();
    expect(screen.getByText(/respuestas precargadas se conservan/)).toBeInTheDocument();
  });
});
