#!/usr/bin/env node
/**
 * Enforces the Tailwind-only policy.
 *
 * `src/app/globals.css` may contain exactly one line and nothing else: the Tailwind import. No
 * theme block, no CSS variables, no selectors — every colour, spacing and font decision lives in
 * utility classes inside the JSX, using Tailwind's own palette.
 *
 * It used to allow a second line, `@custom-variant dark`, which bound the `dark:` variant to a
 * class so a manual Light / Dark / System switch could override the OS media query. The interface
 * is light-only since 05/09/2026, so both the variant and the switch are gone.
 *
 * A convention that is not enforced is a convention that decays, so this runs in CI.
 *
 *   node scripts/check-no-custom-css.mjs        (pnpm lint:css)
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN_DIRS = ['src', 'public', 'app'];
const IGNORED_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', '.git']);

const ALLOWED_STYLESHEET = join('src', 'app', 'globals.css');
const ALLOWED_LINES = ['@import "tailwindcss";'];
/** Concordancia de número en los mensajes: «su línea permitida» / «sus 2 líneas permitidas». */
const LINE_COUNT =
  ALLOWED_LINES.length === 1 ? 'su única línea permitida' : `sus ${ALLOWED_LINES.length} líneas permitidas`;
const STYLE_EXTENSIONS = /\.(css|scss|sass|less)$/i;

const errors = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (STYLE_EXTENSIONS.test(entry)) inspect(full);
  }
}

function inspect(absolutePath) {
  const relativePath = relative(ROOT, absolutePath);

  if (relativePath !== ALLOWED_STYLESHEET) {
    errors.push(
      `${relativePath}: hoja de estilos no permitida. El único archivo CSS admitido es ` +
        `${ALLOWED_STYLESHEET.split(sep).join('/')}. Convierta el patrón en un componente React ` +
        `con clases de utilidad Tailwind.`,
    );
    return;
  }

  const lines = readFileSync(absolutePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  const matches =
    lines.length === ALLOWED_LINES.length &&
    lines.every((line, index) => line === ALLOWED_LINES[index]);

  if (!matches) {
    errors.push(
      `${relativePath}: debe contener exactamente estas ${ALLOWED_LINES.length} líneas y nada ` +
        `más:\n      ${ALLOWED_LINES.join('\n      ')}\n    Se encontraron ` +
        `${lines.length} línea(s) con contenido. Sin variables de tema, sin bloques \`@theme\`, ` +
        `sin selectores: el tema son las clases de utilidad de Tailwind escritas en los ` +
        `componentes.`,
    );
  }
}

for (const dir of SCAN_DIRS) walk(join(ROOT, dir));

if (errors.length > 0) {
  console.error('\n✖ Violaciones de la política Tailwind-only:\n');
  for (const error of errors) console.error(`  · ${error}`);
  console.error(
    '\nLa política es una regla dura: los estilos se escriben como clases de utilidad Tailwind\n' +
      'en los componentes, y los patrones repetidos se abstraen como componentes React\n' +
      '(<Button variant="primary">, <Card>), nunca como CSS.\n',
  );
  process.exit(1);
}

console.log(
  `✓ Política Tailwind-only respetada: ${ALLOWED_STYLESHEET.split(sep).join('/')} contiene solo ` +
    `${LINE_COUNT} y no existe ningún otro CSS.`,
);
