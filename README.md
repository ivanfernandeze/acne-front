# acne-web

Portal del dermatólogo y PWA del paciente del prototipo de diagnóstico asistido de acné con
inteligencia artificial — **Tesis UNT 2026**.

Next.js 14 (App Router) · TypeScript estricto · Tailwind CSS v4 · Recharts

---

## Contexto

Soporta la tesis **«Agilización del proceso de diagnóstico de acné mediante inteligencia
artificial en un centro especializado en dermatología»** (Universidad Nacional de Trujillo, 2026).

Un solo frontend sirve **dos experiencias por routing**, tal como establece la Sección 4 del
documento maestro:

| Ruta | Experiencia |
|---|---|
| `/portal/**` | Portal del dermatólogo: casos, diagnóstico, indicadores, estadística, anexos, auditoría |
| `/app/**` | PWA del paciente: captura guiada de imagen e historial |

> **Aviso:** Herramienta de apoyo diagnóstico con fines de investigación académica. No sustituye el
> juicio clínico del profesional médico. Prototipo académico UNT — no certificado como dispositivo
> médico.

---

## Levantamiento en menos de 10 minutos

Requiere **Node 20+**, **pnpm** y `acne-api` levantado en el puerto 3001.

```bash
pnpm install
cp .env.example .env.local          # NEXT_PUBLIC_API_URL=http://localhost:3001/api

pnpm generate:api-types             # genera el cliente tipado desde el OpenAPI de acne-api
pnpm dev                            # http://localhost:3000
```

Entre en <http://localhost:3000/login> con una de las cuentas que imprimió
`pnpm seed:admin` en `acne-api`.

---

## Dos reglas que gobiernan este proyecto

### 1. Tailwind-only, verificado por CI

Regla dura, **más estricta que la Sección 12.3** del documento maestro: aquel admite las tres
directivas `@tailwind` más las variables del tema en `:root`/`.dark`; en este proyecto
`globals.css` no lleva nada de eso.

```css
/* src/app/globals.css — el archivo completo */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

La segunda línea no es decoración: Tailwind v4 compila `dark:` como
`@media (prefers-color-scheme: dark)` y JavaScript no puede sobrescribir una media query. Atar la
variante a una clase es lo único que permite ofrecer un conmutador manual Claro / Oscuro / Sistema.

- **No hay tema propio ni variables CSS.** Los componentes usan la paleta que trae Tailwind
  (`bg-white`, `text-slate-900`, `bg-sky-900`, `dark:bg-slate-900`…). No existe
  `tailwind.config.ts`: Tailwind v4 detecta el contenido por su cuenta.
- **No hay ningún otro archivo de estilos.** Prohibidos `.css`/`.scss`/`.module.css` adicionales,
  `@apply`, `@layer components`, `@theme`, `@font-face` y cualquier selector.
- Los patrones repetidos se abstraen como componentes React (`<Button variant="primary">`,
  `<Card>`), nunca como clases CSS, usando `class-variance-authority`.
- Composición con `cn()` = `clsx` + `tailwind-merge`. Iconos de `lucide-react`. Fuentes Inter y
  Poppins vía `next/font`, aplicadas como valor arbitrario —
  `font-[family-name:var(--font-poppins)]` — para no necesitar configuración.
- **Color de la condición experimental:** `slate` para pretest (sin IA) y `cyan` para postest (con
  IA), de forma consistente en todo el portal. El profesional nunca debe dudar de bajo qué
  condición está registrando.

```bash
pnpm lint:css
```

`scripts/check-no-custom-css.mjs` exige que `globals.css` contenga **exactamente** esas dos líneas
y nada más, y que no exista ningún otro CSS. Falla con un mensaje concreto y está conectado al CI.

### Modo claro / oscuro

Conmutador de tres estados en la barra superior: **Claro · Oscuro · Sistema**. `system` es un
estado real, no un sinónimo del tema actual del sistema operativo: si el usuario lo elige, el
portal sigue al SO aunque este cambie a mitad de sesión; si elige claro u oscuro, no.

- La elección se guarda en `localStorage`.
- Un script en línea en `<head>` aplica el tema **antes del primer pintado**, para que quien use
  oscuro no vea un destello blanco al cargar.
- Se fija también `color-scheme` en el elemento raíz, de modo que barras de desplazamiento y
  controles nativos acompañen al tema.
- Los gráficos de Recharts leen el tema resuelto y cambian su paleta: sin eso, el tooltip sería
  una caja blanca sobre una página oscura.

### 2. Cero tipos escritos a mano

```bash
pnpm generate:api-types
```

`openapi-typescript` genera `src/types/api-schema.d.ts` desde el documento OpenAPI de `acne-api`.
Las páginas derivan sus tipos de ahí:

```ts
type Dashboard = GetResult<'/indicators/dashboard'>;
type CaseSummary = GetResult<'/cases'>[number];
```

Si el backend cambia un campo, `pnpm typecheck` falla aquí. El archivo generado **se versiona**,
de modo que el CI compila sin necesidad de levantar la API.

Lo que OpenAPI no puede generar son los **valores**: las etiquetas en español, los 8 ítems Likert
verbatim, las fórmulas y metas de los indicadores. Eso llega por `GET /meta/catalogs`
(`useCatalogs`), así que el cuestionario validado existe una sola vez en todo el sistema.

---

## Estructura de navegación

Barra lateral fija y colapsable, con las secciones agrupadas por cómo se trabaja realmente el
estudio:

| Grupo | Secciones | Objetivo |
|---|---|---|
| — | Resumen | Estado general |
| **Clínico** | Casos · Jornada | OE1 · OE2 · OE4 |
| **Análisis** | Indicadores · Estadística | OE1–OE4 · OG |
| **Instrumentos** | Anexos · Encuesta | OE1 · OE2 · OE3 · OE4 |
| **Sistema** | Auditoría | RNF-04 · RF-TR-04 |

- Colapsa a un carril de iconos; la preferencia se recuerda. Los iconos conservan su `title`,
  porque un carril sin forma de recuperar el significado es una trampa para un usuario ocasional
  — que es exactamente lo que es un jurado de tesis.
- En móvil se abre como cajón, siempre expandido.
- La barra superior queda con lo que debe verse en toda pantalla: dónde estás, **bajo qué
  condición experimental estás registrando**, el tema y quién eres.

`src/components/portal/navigation.ts` es la definición única: el sider la renderiza y la barra
superior deriva de ella el título, así que una ruta no puede quedar etiquetada de una forma en el
menú y de otra en la cabecera.

## Decisiones de interfaz que protegen el experimento

- **El cronómetro es invisible.** Abrir un caso hace `POST /cases/:id/open`, que sella `t₀` en el
  servidor; enviar el diagnóstico sella `t₁`. No hay contador en pantalla: verlo correr cambiaría
  el ritmo del profesional y sesgaría justamente la medición que OE1 intenta capturar.
- **En pretest no hay rastro de la IA.** Ni panel, ni marcador de posición, ni sección «oculta»:
  se muestra `<StudyModeBlocked />`, que explica que el bloqueo es parte del diseño y que se
  aplica en el servidor. Si el usuario fuerza la ruta, la API responde 403 (RF-TR-01).
- **El formulario no preselecciona la sugerencia de la IA.** Rellenar la respuesta del médico con
  la del modelo convertiría el «diagnóstico asistido» en una confirmación, y la tasa de
  concordancia que mide OE2 dejaría de significar algo.
- **Los datos sintéticos se marcan siempre.** Cuando el tablero incluye los 30 casos de
  demostración lo dice en un aviso; nunca se presentan como evidencia de la tesis.
- **Las flechas de variación se juzgan por la dirección del indicador.** En TRM una bajada es
  buena; en TPD, TSP y TCAD lo bueno es subir. Colorear por el signo del cambio pintaría de rojo
  el resultado principal de OE1.
- **Las imágenes no pasan por `next/image`.** El optimizador cachearía fotogramas descifrados
  fuera de la ruta auditada, que es justo lo que prohíbe el cifrado en reposo de RNF-02.

---

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx            Fuentes, metadatos y SessionProvider
│  ├─ page.tsx              Portada con las dos experiencias
│  ├─ login/                Autenticación
│  ├─ portal/               Portal del dermatólogo
│  │  ├─ casos/[id]/        Ficha de caso: pretest y postest
│  │  ├─ indicadores/       TRM · TPD · TSP · TCAD + boxplots + matriz de confusión
│  │  ├─ estadistica/       HE₁–HE₄ y H₁ en un clic
│  │  ├─ anexos/            Anexos 4, 5 y 7 digitalizados
│  │  ├─ encuesta/          Anexo 6 (Likert)
│  │  ├─ jornada/           Apertura y cierre de jornada (TCAD)
│  │  └─ auditoria/         Cobertura de objetivos e IIA
│  └─ app/                  PWA del paciente
├─ components/
│  ├─ ui/                   Button, Card, Badge, Field, Table, feedback
│  ├─ charts/               Boxplot SVG propio, matriz de confusión, barras
│  └─ portal/               Componentes específicos del portal
├─ lib/                     Cliente tipado, hooks, formato, catálogos
└─ types/api-schema.d.ts    GENERADO — no editar a mano
```

El **boxplot está escrito a mano en SVG** porque Recharts no trae uno nativo y porque es el único
gráfico del estudio que debe leerse con precisión: bigotes de Tukey (1,5 × RIC), mediana marcada y
valores atípicos como puntos individuales (RF-OE4-04).

---

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 3000 |
| `pnpm build` / `pnpm start` | Compilar y servir |
| `pnpm lint` / `pnpm lint:css` | ESLint y política Tailwind-only |
| `pnpm typecheck` | TypeScript estricto con `noUncheckedIndexedAccess` |
| `pnpm test` | Vitest + Testing Library |
| `pnpm generate:api-types` | Regenera el cliente desde el OpenAPI de la API |

---

## Arquitectura

| Proyecto | Rol | Puerto |
|---|---|---|
| **`acne-web`** (este) | Portal y PWA | 3000 |
| [`acne-api`](../acne-api) | Orquestación clínica, indicadores y estadística | 3001 |
| [`acne-ai-engine`](../acne-ai-engine) | Inferencia CNN, Grad-CAM y SciPy | 8000 |

## Trazabilidad

Toda tanda de cambios actualiza [`../acne-infra/TRACEABILITY.md`](../acne-infra/TRACEABILITY.md) y
este `CHANGELOG.md`.
