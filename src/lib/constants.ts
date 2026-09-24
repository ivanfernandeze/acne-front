/**
 * Fallback copies of two strings the portal may need before the API answers.
 *
 * The AUTHORITATIVE copy of both lives in `acne-api/src/common/domain/` and reaches this app
 * through `GET /meta/catalogs` (see `useCatalogs`). These constants exist only so a first paint —
 * or an offline PWA shell — never renders a clinical screen without its regulatory notice. Every
 * surface that has the catalogs loaded must prefer the served value.
 */

export const DISCLAIMER =
  'Herramienta de apoyo diagnóstico con fines de investigación académica. No sustituye el juicio ' +
  'clínico del profesional médico. Prototipo académico UNT — no certificado como dispositivo ' +
  'médico. Diagnóstico preliminar sujeto a validación por el especialista.';

export const THESIS_TITLE =
  'Agilización del proceso de diagnóstico de acné mediante inteligencia artificial en un centro ' +
  'especializado en dermatología';

/**
 * Authors and advisor of the thesis, for the landing page.
 *
 * Duplicated from `THESIS_METADATA` in the API on purpose: the landing is the first thing anyone
 * loads and it must render with the backend down. Every screen that already has the catalogues
 * prefers the served copy.
 */
export const THESIS_AUTHORS = ['Díaz Sifuentes, Sergio Helí', 'Fernández Esquerre, Iván Jeremí'];
export const THESIS_ADVISOR = 'Ing. Mendoza Rivera, Ricardo Darío';
export const THESIS_INSTITUTION = 'Universidad Nacional de Trujillo';
export const THESIS_SCHOOL = 'Escuela de Ingeniería de Sistemas · 2026';

/**
 * The four indicators, for the landing page only.
 *
 * Same caveat as above: `GET /meta/catalogs` carries the authoritative definitions with their exact
 * targets, and every screen inside the portal reads them from there. This short form exists so the
 * public page can explain what the study measures without a network call.
 */
export const LANDING_INDICATORS = [
  {
    key: 'TRM',
    objective: 'OE1',
    name: 'Tiempo de revisión médica',
    formula: 'TRM = (Σ TRᵢ) / n',
    unit: 'min/caso',
    target: 'Reducción ≥ 30 %',
  },
  {
    key: 'TPD',
    objective: 'OE2',
    name: 'Precisión del diagnóstico preliminar',
    formula: 'TPD = (DC / DT) × 100',
    unit: '%',
    target: 'TPD ≥ 90 %',
  },
  {
    key: 'TSP',
    objective: 'OE3',
    name: 'Satisfacción del personal médico',
    formula: 'TSP = (Σ PO / PT) × 100',
    unit: '%',
    target: 'TSP ≥ 80 %',
  },
  {
    key: 'TCAD',
    objective: 'OE4',
    name: 'Capacidad de atención diagnóstica',
    formula: 'TCAD = NCR / TJ',
    unit: 'casos/h',
    target: 'Incremento significativo',
  },
] as const;
