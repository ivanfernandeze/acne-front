#!/usr/bin/env node
/**
 * Enforces the Tailwind-only rule of section 12.3 of the specification.
 *
 * The rule, verbatim: every style is a Tailwind utility written in the JSX; `app/globals.css`
 * contains ONLY the three `@tailwind` directives and the theme variables in `:root` and `.dark`;
 * no other `.css` / `.scss` / `.module.css` may exist, and no selector, rule, `@apply` or
 * `@layer components` with custom classes is allowed anywhere.
 *
 * A convention that is not enforced is a convention that decays. This script is what makes the
 * rule real, and it is wired into CI.
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

  validateGlobals(relativePath, readFileSync(absolutePath, 'utf8'));
}

/**
 * `globals.css` is parsed line by line rather than with a CSS parser: the file is deliberately
 * tiny and its permitted shape is exactly "three directives plus two variable blocks", so a line
 * scanner states the rule more directly than a parse tree would.
 */
function validateGlobals(relativePath, source) {
  const allowedSelectors = new Set([':root', '.dark', ':root, .dark', '.dark, :root']);
  const lines = source.split(/\r?\n/);

  let depth = 0;
  let currentSelector = null;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.replace(/\/\*.*?\*\//g, '').trim();
    if (line === '' || line.startsWith('/*') || line.startsWith('*')) return;

    const at = (message) => errors.push(`${relativePath}:${lineNumber}: ${message}`);

    if (/@apply\b/.test(line)) {
      at('`@apply` está prohibido. Extraiga el patrón a un componente React reutilizable.');
      return;
    }
    if (/@layer\s+components\b/.test(line)) {
      at('`@layer components` con clases propias está prohibido.');
      return;
    }
    if (/@(import|font-face|keyframes|supports|container)\b/.test(line)) {
      at(
        'Solo se admiten las tres directivas `@tailwind`. Las fuentes se cargan con `next/font` ' +
          'y las animaciones se declaran en `tailwind.config.ts`.',
      );
      return;
    }

    if (depth === 0 && /^@tailwind\s+(base|components|utilities)\s*;$/.test(line)) return;

    if (line.includes('{')) {
      if (depth === 0) {
        currentSelector = line.slice(0, line.indexOf('{')).trim();
        if (!allowedSelectors.has(currentSelector)) {
          at(
            `selector "${currentSelector}" no permitido. En globals.css solo pueden declararse ` +
              'las variables del tema en `:root` y `.dark`.',
          );
        }
      } else {
        at('bloques anidados no permitidos.');
      }
      depth += (line.match(/\{/g) ?? []).length;
      depth -= (line.match(/\}/g) ?? []).length;
      return;
    }

    if (line.includes('}')) {
      depth -= (line.match(/\}/g) ?? []).length;
      if (depth <= 0) {
        depth = 0;
        currentSelector = null;
      }
      return;
    }

    if (depth > 0) {
      // Inside :root / .dark only CSS custom properties are admissible.
      if (!/^--[a-z0-9-]+\s*:/i.test(line)) {
        at(
          `"${line}" no es una variable de tema. Dentro de ${currentSelector ?? 'el bloque'} solo ` +
            'se admiten propiedades personalizadas `--nombre: valor;`.',
        );
      }
      return;
    }

    at(`"${line}" no está permitido fuera de las directivas @tailwind y los bloques de tema.`);
  });
}

for (const dir of SCAN_DIRS) walk(join(ROOT, dir));

if (errors.length > 0) {
  console.error('\n✖ Violaciones de la política Tailwind-only (Sección 12.3):\n');
  for (const error of errors) console.error(`  · ${error}`);
  console.error(
    '\nLa política es una regla dura: los estilos se escriben como clases de utilidad Tailwind\n' +
      'en los componentes, y los patrones repetidos se abstraen como componentes React\n' +
      '(<Button variant="primary">, <Card>), nunca como clases CSS.\n',
  );
  process.exit(1);
}

console.log('✓ Política Tailwind-only respetada: sin CSS personalizado fuera de globals.css.');
