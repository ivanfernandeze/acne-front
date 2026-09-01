import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Timer,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single definition of the portal's navigation.
 *
 * The sidebar renders it and the top bar derives the page title from it, so a route can never end
 * up labelled one way in the menu and another way in the header.
 *
 * The grouping mirrors how the study is actually worked: what the physician does with a patient,
 * what the researcher reads afterwards, the paper instruments, and the audit surface.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** `/portal` would otherwise match every child route. */
  exact?: boolean;
  /** Shown under the label when the sidebar is expanded. */
  hint?: string;
  /** Objective the section serves; surfaced as a tooltip for the thesis defence. */
  objective?: string;
}

export interface NavGroup {
  /** `null` for the leading item, which needs no heading. */
  title: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    title: null,
    items: [
      {
        href: '/portal',
        label: 'Resumen',
        icon: Activity,
        exact: true,
        hint: 'Estado del estudio',
      },
    ],
  },
  {
    title: 'Clínico',
    items: [
      {
        href: '/portal/casos',
        label: 'Casos',
        icon: Stethoscope,
        hint: 'Bandeja y diagnóstico',
        objective: 'OE1 · OE2',
      },
      {
        href: '/portal/jornada',
        label: 'Jornada',
        icon: Timer,
        hint: 'Apertura y cierre',
        objective: 'OE4',
      },
    ],
  },
  {
    title: 'Análisis',
    items: [
      {
        href: '/portal/indicadores',
        label: 'Indicadores',
        icon: BarChart3,
        hint: 'TRM · TPD · TSP · TCAD',
        objective: 'OE1–OE4',
      },
      {
        href: '/portal/estadistica',
        label: 'Estadística',
        icon: FlaskConical,
        hint: 'Contraste de hipótesis',
        objective: 'OG · HE₁–HE₄',
      },
    ],
  },
  {
    title: 'Instrumentos',
    items: [
      {
        href: '/portal/anexos',
        label: 'Anexos',
        icon: ClipboardList,
        hint: 'Fichas 4, 5 y 7',
        objective: 'OE1 · OE2 · OE4',
      },
      {
        href: '/portal/encuesta',
        label: 'Encuesta',
        icon: FileText,
        hint: 'Likert del Anexo 6',
        objective: 'OE3',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        href: '/portal/auditoria',
        label: 'Auditoría',
        icon: ShieldCheck,
        hint: 'Cobertura e IIA',
        objective: 'RNF-04 · RF-TR-04',
      },
    ],
  },
];

const ALL_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact === true ? pathname === item.href : pathname.startsWith(item.href);
}

/** Titles for routes that have no menu entry of their own. */
const EXTRA_TITLES: Record<string, string> = {
  '/portal/casos/nuevo': 'Nuevo caso',
};

export function pageTitleFor(pathname: string): string {
  if (EXTRA_TITLES[pathname] !== undefined) return EXTRA_TITLES[pathname];

  // A case detail route (/portal/casos/<uuid>) is titled by its section, not by the id.
  const match = [...ALL_ITEMS]
    .filter((item) => isActive(item, pathname))
    // Longest href wins, so `/portal/casos` beats `/portal`.
    .sort((a, b) => b.href.length - a.href.length)[0];

  return match?.label ?? 'Portal';
}
