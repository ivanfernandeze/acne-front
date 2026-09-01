# Changelog — acne-web

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado con [SemVer](https://semver.org/lang/es/).

## [0.1.0] — 2026-08-31

### Added

- **Portal del dermatólogo** (`/portal/**`): resumen con indicadores y entregables, bandeja de
  casos con filtro por condición, ficha de caso con cronómetro invisible y bloqueo de IA en
  pretest, panel de indicadores con boxplots y matriz de confusión, análisis estadístico de un
  clic, Anexos 4/5/7 digitalizados, cuestionario Likert, panel de jornada y panel de auditoría.
- **PWA del paciente** (`/app/**`): captura guiada con `getUserMedia`, guía de encuadre en SVG,
  manifest y service worker que cachea solo el *shell* — nunca imágenes clínicas ni respuestas de
  la API.
- **Cliente tipado desde OpenAPI**: `pnpm generate:api-types` genera `src/types/api-schema.d.ts`
  desde el documento de `acne-api`. Ningún tipo de respuesta se escribe a mano.
- **Política Tailwind-only verificada**: `scripts/check-no-custom-css.mjs` (`pnpm lint:css`) exige
  que `src/app/globals.css` contenga exactamente `@import "tailwindcss";` y nada más, y que no
  exista ningún otro archivo de estilos. Conectado al CI.
- **Componentes propios** al estilo shadcn/ui con `class-variance-authority`, `clsx` y
  `tailwind-merge`; iconos de `lucide-react`; fuentes Inter/Poppins vía `next/font`.
- **Boxplot en SVG** escrito a mano (Recharts no tiene uno nativo) con convención de Tukey.
- Pruebas con Vitest + Testing Library sobre los componentes críticos.

### Fixed

- **Separador decimal.** El formato numérico usaba el locale `es-PE`, que en CLDR emplea el punto
  decimal. La tesis y los reportes PDF usan la coma, de modo que el tablero mostraba «8.78» donde
  el reporte imprimía «8,78» — una invitación a errores de transcripción en el capítulo de
  resultados. El locale se fija ahora a la convención del documento, no a la del país.

### Added

- **Registro de pacientes e historia clínica longitudinal** (`/portal/pacientes` y
  `/portal/pacientes/[id]`), bajo el grupo Clínico. El listado muestra nombre, edad, fototipo,
  número de visitas, última visita y severidad actual, con búsqueda por nombre o código; la
  historia añade tarjetas de resumen, la **curva de evolución IGA** y la cronología de visitas,
  cada una desplegable con su fotografía, sus diagnósticos firmados, los tiempos de revisión de
  ambas condiciones y la sugerencia del modelo.
  Complementa la bandeja de casos en lugar de duplicarla: la bandeja está organizada en torno al
  experimento, esta responde lo que se pregunta en un control clínico.
- **`SeverityEvolution`** (`components/charts/severity-evolution.tsx`): línea de la severidad IGA
  por visita. IGA es una escala **ordinal**, así que el eje traza el rango (0 sin lesiones … 4
  severo) con las etiquetas clínicas en los ticks; el dibujo muestra dirección y escalones, y
  nunca sugiere que la distancia entre «leve» y «moderado» equivalga a la de «moderado» y
  «severo». El eje no se invierte: la severidad sube, de modo que una línea que baja se lee como
  mejoría.
- **Barra lateral colapsable** con las secciones agrupadas (Clínico · Análisis · Instrumentos ·
  Sistema), carril de iconos en escritorio y cajón en móvil. La preferencia de colapso persiste.
- **Barra superior** reducida a lo esencial: título de la página, insignia de la condición
  experimental, conmutador de tema y usuario. La insignia vive aquí a propósito: es el único
  estado que cambia lo que el profesional puede ver, y esconderlo en un menú permitiría
  diagnosticar sin advertir a qué observación se está contribuyendo.
- **Tema claro / oscuro / sistema** con conmutador de tres estados, persistencia en
  `localStorage` y script en línea que evita el destello blanco al cargar. Disponible también en
  la PWA del paciente.
- `src/components/portal/navigation.ts` como definición única de la navegación: el sider y el
  título de la barra superior salen de la misma fuente.

### Changed

- **Migración a Tailwind CSS v4 sin tema propio.** `globals.css` se reduce a
  `@import "tailwindcss";`, se elimina `tailwind.config.ts` y se retiran `autoprefixer` y
  `tailwindcss-animate`. Los 31 archivos de interfaz pasan de tokens semánticos
  (`bg-surface`, `text-muted`, `bg-primary`, `text-pretest`…) a la paleta de fábrica de Tailwind,
  conservando el modo oscuro en cada clase (`bg-white dark:bg-slate-900`). Es una desviación
  **más estricta** que la Sección 12.3 del documento maestro, que sí admitía variables de tema en
  `:root`/`.dark`.
- Los colores de Recharts y de la matriz de confusión, que necesitan cadenas y no clases, pasan de
  `hsl(var(--token))` a literales de la escala de Tailwind declarados junto al componente.

### Notes

- `buttonVariants` vive en `components/ui/button-variants.ts`, un módulo **sin** `'use client'`.
  Los componentes de servidor lo invocan para dar aspecto de botón a un `<Link>`; exportarlo desde
  el archivo del componente cliente entregaría al servidor una referencia de cliente en lugar de
  la función y el prerenderizado fallaría con «(0 , l.d) is not a function».
