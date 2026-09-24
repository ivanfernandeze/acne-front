/**
 * The three portals of the system, and what each one contains.
 *
 * Until the restructuring of 05/09/2026 there was ONE portal at `/portal` whose menu was filtered
 * by role. It worked, and it hid a real problem: every screen had to be read twice — once as the
 * dermatologist sees it, once as the technician does — and nobody could point at the system and say
 * what a technician's job actually is. Three routes make the boundary a fact of the URL rather than
 * a runtime condition, which is also what the thesis has to describe.
 *
 * Each portal declares its own sections here, once. The sidebar renders them, the top bar derives
 * the page title from them and the layout guards on them, so a route cannot be labelled one way in
 * the menu and another way in the header, nor be reachable through a bookmark it was excluded from.
 *
 * The API is still the authority — every route carries its own `@Roles` derived from the permission
 * matrix — but a menu that offers a technician the statistics panel only to answer 403 reads as a
 * broken system rather than as a boundary.
 */
import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  FlaskConical,
  ListChecks,
  PenLine,
  Pill,
  ShieldCheck,
  Stethoscope,
  Timer,
  UserCog,
  UserPlus,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const PORTAL_SLUGS = ['admin', 'dermatologo', 'tecnico'] as const;
export type PortalSlug = (typeof PORTAL_SLUGS)[number];

export interface PortalNavItem {
  /** Path INSIDE the portal, always starting with `/`. `/` is the portal's home. */
  path: string;
  label: string;
  icon: LucideIcon;
  /** Shown under the label when the sidebar is expanded. */
  hint?: string;
  /** Objective the section serves; surfaced as a tooltip for the thesis defence. */
  objective?: string;
}

export interface PortalNavGroup {
  /** `null` for the leading item, which needs no heading. */
  title: string | null;
  items: PortalNavItem[];
}

export interface PortalDefinition {
  slug: PortalSlug;
  /** The role that lands here. One portal per role, no overlap. */
  role: string;
  label: string;
  /** One line describing the job, shown on the login screen and on the portal home. */
  purpose: string;
  groups: PortalNavGroup[];
  /** Sub-paths with no menu entry of their own, titled explicitly. */
  extraTitles: Record<string, string>;
}

/** Sections shared by the two portals that work on patients and cases. */
const CLINICAL_ITEMS: PortalNavItem[] = [
  {
    path: '/pacientes',
    label: 'Pacientes',
    icon: Users,
    hint: 'Historia y evolución',
    objective: 'RF-TR-03 · RNF-07',
  },
  {
    path: '/casos',
    label: 'Casos',
    icon: Stethoscope,
    hint: 'Bandeja y diagnóstico',
    objective: 'OE1 · OE2',
  },
];

const SUMMARY_GROUP: PortalNavGroup = {
  title: null,
  items: [{ path: '/', label: 'Resumen', icon: Activity, hint: 'Estado del estudio' }],
};

const COMMON_EXTRA_TITLES: Record<string, string> = {
  '/perfil': 'Mi cuenta',
  '/pacientes/nuevo': 'Nuevo paciente',
  '/casos/nuevo': 'Nuevo caso',
};

export const PORTALS: Readonly<Record<PortalSlug, PortalDefinition>> = {
  /**
   * The maintainer's portal. Reads the evidence, never produces it.
   *
   * It has patients and cases because somebody has to be able to fix a mistyped record out of
   * hours, but it has no journey and no questionnaire: those are measurements of the professional
   * under study, and an administrator filling them in would be fabricating data.
   */
  admin: {
    slug: 'admin',
    role: 'admin',
    label: 'Administración',
    purpose: 'Mantiene el sistema y lee la evidencia del estudio.',
    groups: [
      SUMMARY_GROUP,
      { title: 'Clínico', items: CLINICAL_ITEMS },
      {
        title: 'Análisis',
        items: [
          {
            path: '/indicadores',
            label: 'Indicadores',
            icon: BarChart3,
            hint: 'TRM · TPD · TSP · TCAD',
            objective: 'OE1–OE4',
          },
          {
            path: '/estadistica',
            label: 'Estadística',
            icon: FlaskConical,
            hint: 'Contraste de hipótesis',
            objective: 'OG · HE₁–HE₄',
          },
          {
            path: '/anexos',
            label: 'Anexos',
            icon: ClipboardList,
            hint: 'Fichas 4, 5 y 7',
            objective: 'OE1 · OE2 · OE4',
          },
        ],
      },
      {
        // El alta por rol va aparte de «Usuarios», y no es una duplicación: «Usuarios» es la
        // lista completa a la que se entra a BUSCAR a alguien, y estas dos son las pantallas a
        // las que se entra a DAR DE ALTA. Un formulario que ya sabe qué rol crea no necesita
        // preguntarlo, y es la pregunta que más se equivoca.
        title: 'Personal',
        items: [
          {
            path: '/dermatologos',
            label: 'Dermatólogos',
            icon: UserRoundPlus,
            hint: 'Alta del especialista',
            objective: 'RF-TR-02',
          },
          {
            path: '/tecnicos',
            label: 'Técnicos',
            icon: UserPlus,
            hint: 'Alta del mostrador',
            objective: 'RF-TR-02',
          },
        ],
      },
      {
        title: 'Sistema',
        items: [
          {
            path: '/usuarios',
            label: 'Usuarios',
            icon: UserCog,
            hint: 'Todo el personal del estudio',
            objective: 'RF-TR-02',
          },
          {
            path: '/auditoria',
            label: 'Auditoría',
            icon: ShieldCheck,
            hint: 'Cobertura e IIA',
            objective: 'RNF-04 · RF-TR-04',
          },
        ],
      },
    ],
    extraTitles: { ...COMMON_EXTRA_TITLES, '/usuarios/nuevo': 'Nuevo usuario' },
  },

  /**
   * The portal of the professional the study measures.
   *
   * It carries the journey and the questionnaire — the two instruments only they can fill — and it
   * reads the indicators, because a professional who cannot see their own numbers cannot judge
   * whether the tool is helping. Running the contrasts belongs to the administrator: the subject of
   * a measurement should not be the one who freezes its immutable log.
   */
  dermatologo: {
    slug: 'dermatologo',
    role: 'dermatologo',
    label: 'Consulta',
    purpose: 'Diagnostica, revisa casos y registra su jornada.',
    groups: [
      SUMMARY_GROUP,
      {
        title: 'Clínico',
        items: [
          ...CLINICAL_ITEMS,
          {
            path: '/jornada',
            label: 'Jornada',
            icon: Timer,
            hint: 'Apertura y cierre',
            objective: 'OE4',
          },
        ],
      },
      {
        // El material de trabajo del especialista: lo que necesita tener a punto ANTES de atender.
        // Va en su portal y no en el del administrador porque es él quien conoce las pautas que
        // receta y la redacción con que se pregunta en su consulta.
        title: 'Consulta',
        items: [
          {
            path: '/almacen',
            label: 'Almacén',
            icon: Pill,
            hint: 'Vademécum e indicaciones',
          },
          {
            path: '/preguntas',
            label: 'Preguntas',
            icon: ListChecks,
            hint: 'Cuestionario de ingreso',
          },
          {
            path: '/firma',
            label: 'Firma',
            icon: PenLine,
            hint: 'La que se imprime en la receta',
          },
          {
            // Quien decide que hace falta otra persona en admisión es el médico, no el
            // informático. Obligarle a pedir la cuenta al administrador es el trámite que en la
            // práctica se salta compartiendo credenciales, y una credencial compartida rompe la
            // trazabilidad de la que vive RNF-02: el asiento diría quién tecleó, no quién estaba.
            // El alcance lo pone el servidor: solo puede crear cuentas de `tecnico`.
            path: '/tecnicos',
            label: 'Técnicos',
            icon: UserPlus,
            hint: 'Alta del mostrador',
            objective: 'RF-TR-02',
          },
        ],
      },
      {
        // Lo único del estudio que le corresponde: responder el instrumento que lo mide. Los
        // indicadores, los contrastes y los anexos son lectura del administrador — el profesional
        // es el SUJETO de la medición, y darle sus propias cifras mientras la produce invita a que
        // el número influya en el trabajo que ese mismo número está midiendo.
        title: 'Estudio',
        items: [
          {
            path: '/encuesta',
            label: 'Encuesta',
            icon: FileText,
            hint: 'Likert del Anexo 6',
            objective: 'OE3',
          },
        ],
      },
    ],
    extraTitles: COMMON_EXTRA_TITLES,
  },

  /**
   * The intake desk. Deliberately the smallest portal in the system.
   *
   * No indicators, no contrasts, no questionnaire and no diagnosis: the technician takes no part in
   * producing or reading the thesis evidence, and every section absent here is a section that
   * cannot be opened by accident on a shared machine at the front desk.
   */
  tecnico: {
    slug: 'tecnico',
    role: 'tecnico',
    label: 'Admisión',
    purpose: 'Registra al paciente, abre el caso y toma la anamnesis y las fotografías.',
    groups: [
      SUMMARY_GROUP,
      {
        title: 'Ingreso',
        items: [
          ...CLINICAL_ITEMS,
          {
            // El mostrador también registra jornada: su NCR cuenta pacientes ADMITIDOS, no casos
            // diagnosticados. Las dos cifras comparten columna pero no se mezclan en el contraste
            // —`pairedTcad` filtra por rol— porque OE4 mide capacidad de atención diagnóstica.
            path: '/jornada',
            label: 'Jornada',
            icon: Timer,
            hint: 'Apertura y cierre',
            objective: 'OE4',
          },
        ],
      },
      {
        // El técnico OPERA el sistema tanto como el especialista, de modo que su satisfacción es
        // parte de lo que mide OE3. Es la única sección del estudio que le corresponde: responde
        // el instrumento, no lee sus resultados.
        title: 'Estudio',
        items: [
          {
            path: '/encuesta',
            label: 'Encuesta',
            icon: FileText,
            hint: 'Likert del Anexo 6',
            objective: 'OE3',
          },
        ],
      },
    ],
    extraTitles: COMMON_EXTRA_TITLES,
  },
};

export const PORTAL_LIST: readonly PortalDefinition[] = PORTAL_SLUGS.map((slug) => PORTALS[slug]);

export function isPortalSlug(value: unknown): value is PortalSlug {
  return typeof value === 'string' && (PORTAL_SLUGS as readonly string[]).includes(value);
}

/** Where a role lands after logging in. `null` for a role no portal claims. */
export function portalForRole(role: string | null | undefined): PortalDefinition | null {
  return PORTAL_LIST.find((portal) => portal.role === role) ?? null;
}

/** The portal a pathname belongs to, or `null` outside the portals (login, PWA, capture). */
export function portalFromPathname(pathname: string): PortalDefinition | null {
  const slug = pathname.split('/')[1];
  return isPortalSlug(slug) ? PORTALS[slug] : null;
}

/** Absolute href for a path inside a portal. `portalHref('admin', '/casos')` → `/admin/casos`. */
export function portalHref(slug: PortalSlug, path = '/'): string {
  return path === '/' ? `/${slug}` : `/${slug}${path}`;
}

const ALL_ITEMS = (portal: PortalDefinition): PortalNavItem[] =>
  portal.groups.flatMap((group) => group.items);

/**
 * Whether the portal declares this section at all.
 *
 * Screens shared by the three portals ask this instead of testing the role: the home page shows the
 * indicator cards only where `/indicadores` exists, so a section removed from a portal disappears
 * from every screen that links into it without a second list to keep in step.
 */
export function hasSection(portal: PortalDefinition, path: string): boolean {
  return ALL_ITEMS(portal).some((item) => item.path === path);
}

/** True when the item is the section the pathname is currently in. */
export function isActive(portal: PortalDefinition, item: PortalNavItem, pathname: string): boolean {
  const href = portalHref(portal.slug, item.path);
  // The home item would otherwise match every child route of the portal.
  return item.path === '/' ? pathname === href : pathname.startsWith(href);
}

/**
 * Whether this portal owns the route.
 *
 * Longest match wins, so `/admin/usuarios` is judged by the Usuarios entry and not by the home
 * entry. A path under no section at all is only allowed when it is a declared extra title — which
 * is how `/admin/usuarios/nuevo` stays reachable while `/tecnico/estadistica` does not.
 */
export function mayOpen(portal: PortalDefinition, pathname: string): boolean {
  const inside = pathname === portalHref(portal.slug) || pathname.startsWith(`/${portal.slug}/`);
  if (!inside) return false;

  const rest = pathname.slice(`/${portal.slug}`.length) || '/';
  if (portal.extraTitles[rest] !== undefined) return true;

  return ALL_ITEMS(portal).some((item) => isActive(portal, item, pathname));
}

/** Title of the current page, for the top bar. */
export function pageTitleFor(portal: PortalDefinition, pathname: string): string {
  const rest = pathname.slice(`/${portal.slug}`.length) || '/';
  const extra = portal.extraTitles[rest];
  if (extra !== undefined) return extra;

  const match = ALL_ITEMS(portal)
    .filter((item) => isActive(portal, item, pathname))
    // Longest path wins, so `/casos` beats the portal home.
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.label ?? portal.label;
}
