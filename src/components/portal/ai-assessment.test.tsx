import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AiAssessment } from './ai-assessment';

const full = {
  summary:
    'El paciente presenta un cuadro de acné vulgar con predominio de lesiones inflamatorias.',
  lesionTypes: ['comedones cerrados', 'pápulas'],
  affectedZones: ['mentón', 'perioral'],
  severityRationale:
    'Se clasifica como moderado por las numerosas pápulas inflamatorias en varias zonas.',
  differentials: ['rosácea papulopustulosa'],
  considerations: ['Valorar un régimen que aborde comedones y lesiones inflamatorias.'],
  anamnesisFlags: ['Refiere posibilidad de embarazo'],
};

describe('AiAssessment', () => {
  it('shows the reading, its grounds and what the history flags', () => {
    render(<AiAssessment assessment={full} />);

    expect(screen.getByText(/predominio de lesiones inflamatorias/)).toBeInTheDocument();
    expect(screen.getByText(/numerosas pápulas inflamatorias/)).toBeInTheDocument();
    expect(screen.getByText('comedones cerrados')).toBeInTheDocument();
    expect(screen.getByText('mentón')).toBeInTheDocument();
    expect(screen.getByText('rosácea papulopustulosa')).toBeInTheDocument();
    expect(screen.getByText(/Refiere posibilidad de embarazo/)).toBeInTheDocument();
  });

  it('renders the reading even when every optional block is empty', () => {
    // A clean face has no lesions to list, no zones to name and nothing to flag. The narrative is
    // the one part that always exists, and it must not disappear along with the empty sections.
    render(
      <AiAssessment
        assessment={{
          summary: 'Piel sin lesiones activas de acné.',
          lesionTypes: [],
          affectedZones: [],
          severityRationale: '',
          differentials: [],
          considerations: [],
          anamnesisFlags: [],
        }}
      />,
    );

    expect(screen.getByText('Piel sin lesiones activas de acné.')).toBeInTheDocument();
    expect(screen.queryByText(/Por qué esta clase/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lo que aporta la anamnesis/)).not.toBeInTheDocument();
  });

  it('separates the anamnesis flags from the rest', () => {
    // They are the only block that can carry something the physician must not miss — a possible
    // pregnancy against isotretinoin, an allergy, a drug already in use — so they get their own
    // warning-toned region instead of being folded into the prose.
    render(<AiAssessment assessment={full} />);

    const flags = screen.getByText(/Lo que aporta la anamnesis/);
    expect(flags).toBeInTheDocument();
    expect(flags.closest('div')).toContainElement(
      screen.getByText('Refiere posibilidad de embarazo'),
    );
  });
});
