import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditional class composition with conflict resolution.
 *
 * Required by the Tailwind-only policy (section 12.3): `clsx` handles the conditionals and
 * `tailwind-merge` resolves collisions, so a variant can override a base class
 * (`cn('px-4', 'px-6')` → `px-6`) without anyone reaching for a stylesheet.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
