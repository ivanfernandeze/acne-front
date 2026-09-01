# acne-web

Portal del dermatólogo y PWA del paciente del prototipo de diagnóstico asistido de acné con
inteligencia artificial — **Tesis UNT 2026**.

Next.js 14 (App Router) · TypeScript estricto · Tailwind CSS · Recharts

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

La Sección 12.3 lo plantea como regla dura, y aquí se **comprueba**, no se confía:

- Los estilos son clases de utilidad Tailwind escritas en el JSX.
- `src/app/globals.css` contiene **solo** las tres directivas `@tailwind` y las variables del tema
  en `:root` y `.dark`. Nada más.
- Prohibido cualquier otro `.css`/`.scss`/`.module.css`, y prohibidos `@apply`, `@layer
  components` con clases propias, `@import` y `@font-face`.
- Los patrones repetidos se abstraen como componentes React (`<Button variant="primary">`,
  `<Card>`), nunca como clases CSS, usando `class-variance-authority`.
- Composición con `cn()` = `clsx` + `tailwind-merge`. Iconos de `lucide-react`. Fuentes Inter y
  Poppins vía `next/font` (self-hosted, sin llamadas a Google desde una pantalla de paciente).

```bash
pnpm lint:css
```

`scripts/check-no-custom-css.mjs` recorre `src/` y `public/` y falla con un mensaje concreto ante
cualquier violación. Está conectado al CI.

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
