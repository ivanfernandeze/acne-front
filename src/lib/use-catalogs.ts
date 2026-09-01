'use client';

import { useApi } from '@/lib/use-api';

/**
 * Domain catalogues served by `GET /meta/catalogs`.
 *
 * This is how the frontend gets the VALUES that OpenAPI generation cannot provide: the Spanish
 * labels, the verbatim Likert wording, the indicator formulas and targets, the disclaimer. The
 * portal renders these strings and never rewrites them — the questionnaire in particular was
 * validated as written, so a paraphrase in the UI would invalidate the instrument.
 */
export interface Catalogs {
  thesis: {
    title: string;
    university: string;
    faculty: string;
    school: string;
    authors: string[];
    advisor: string;
    researchLine: string;
    year: number;
  };
  disclaimer: string;
  references: string[];
  iga: {
    classes: string[];
    labels: Record<string, string>;
    ordinal: Record<string, number>;
  };
  gags: { grades: string[]; labels: Record<string, string> };
  fitzpatrick: string[];
  sexes: string[];
  studyModes: { values: string[]; labels: Record<string, string> };
  caseStatuses: { values: string[]; labels: Record<string, string> };
  workShifts: { values: string[]; labels: Record<string, string> };
  roles: { values: string[]; labels: Record<string, string> };
  indicators: {
    keys: string[];
    definitions: Record<
      string,
      {
        key: string;
        objective: string;
        hypothesis: string;
        name: string;
        formula: string;
        unit: string;
        instrument: string;
        direction: 'lower' | 'higher';
        target: string;
      }
    >;
    targets: Record<string, number>;
  };
  hypotheses: {
    keys: string[];
    statements: Record<string, string>;
    nullStatements: Record<string, string>;
    indicator: Record<string, string>;
    alternative: Record<string, string>;
    general: { h1: string; h0: string };
    testLabels: Record<string, string>;
  };
  survey: {
    items: { number: number; text: string }[];
    scale: Record<string, string>;
    totalPoints: number;
  };
}

export function useCatalogs() {
  return useApi<Catalogs>('/meta/catalogs');
}

/** IGA label lookup with a readable fallback while the catalogues are loading. */
export function igaLabel(catalogs: Catalogs | null, igaClass: string | null | undefined): string {
  if (igaClass === null || igaClass === undefined) return '—';
  return catalogs?.iga.labels[igaClass] ?? igaClass.replace(/_/g, ' ');
}
