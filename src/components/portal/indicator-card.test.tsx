import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IndicatorCard, type IndicatorComparison } from './indicator-card';

type IndicatorValue = NonNullable<IndicatorComparison['pretest']>;

function value(observations: number[], overrides: Partial<IndicatorValue> = {}): IndicatorValue {
  const mean = observations.reduce((acc, v) => acc + v, 0) / observations.length;
  return {
    indicator: 'TRM',
    studyMode: 'pretest',
    value: mean,
    unit: 'min/caso',
    observations,
    descriptive: {
      n: observations.length,
      mean,
      sd: 1,
      min: Math.min(...observations),
      q1: mean,
      median: mean,
      q3: mean,
      max: Math.max(...observations),
    },
    inputHash: 'a'.repeat(64),
    computedAt: '2026-08-31T12:00:00.000Z',
    ...overrides,
  };
}

function build(overrides: Partial<IndicatorComparison> = {}): IndicatorComparison {
  return {
    indicator: 'TRM',
    definition: {
      key: 'TRM',
      objective: 'OE1',
      hypothesis: 'HE1',
      name: 'Tasa de revisión médica',
      formula: 'TRM = (Σ TRᵢ) / n',
      unit: 'min/caso',
      instrument: 'Anexo 4',
      direction: 'lower',
      target: 'Reducción ≥ 30 %',
    },
    pretest: { ...value([8, 9, 10]), value: 8.78 },
    postest: { ...value([6, 6, 6], { studyMode: 'postest' }), value: 6.02 },
    absoluteChange: -2.76,
    relativeChangePct: -31.4,
    targetMet: true,
    alert: null,
    ...overrides,
  };
}

/**
 * The direction rule is the subtle part: for TRM a DROP is the good outcome, for the other three
 * indicators it is a rise. Colouring by the raw sign of the change would paint the headline result
 * of OE1 as a failure.
 */
describe('IndicatorCard', () => {
  it('treats a drop as an improvement for a `lower is better` indicator', () => {
    render(<IndicatorCard data={build()} />);

    const change = screen.getByText('-31,4 %');
    expect(change.className).toContain('text-emerald-700');
  });

  it('treats a drop as a regression for a `higher is better` indicator', () => {
    render(
      <IndicatorCard
        data={build({
          indicator: 'TPD',
          definition: {
            key: 'TPD',
            objective: 'OE2',
            hypothesis: 'HE2',
            name: 'Tasa de precisión diagnóstica',
            formula: 'TPD = (DC / DT) × 100',
            unit: '%',
            instrument: 'Anexo 5',
            direction: 'higher',
            target: 'TPD ≥ 90 %',
          },
          relativeChangePct: -12.5,
          targetMet: false,
          alert: 'La precisión diagnóstica está por debajo de la meta declarada.',
        })}
      />,
    );

    const change = screen.getByText('-12,5 %');
    expect(change.className).toContain('text-red-700');
  });

  it('shows the declared alert when the target is not met', () => {
    render(
      <IndicatorCard
        data={build({ targetMet: false, alert: 'La reducción es del 12 %, bajo la meta de 30 %.' })}
      />,
    );

    expect(screen.getByText(/bajo la meta de 30 %/)).toBeInTheDocument();
    expect(screen.getByText('No cumple')).toBeInTheDocument();
  });

  it('reports missing data instead of showing a misleading zero', () => {
    render(
      <IndicatorCard data={build({ pretest: null, relativeChangePct: null, targetMet: null })} />,
    );

    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
