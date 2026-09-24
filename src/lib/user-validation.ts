/**
 * Field-level validation for the maintainer forms.
 *
 * Pure functions returning the message to show, or `null` when the value is fine. No form library:
 * the portal has never used one, and these are testable without rendering anything.
 *
 * They mirror the `class-validator` rules of `CreateUserDto` and `UpdateUserDto`. The server stays
 * the authority — nothing here can be trusted — but a form that only tells you what is wrong after
 * a round trip, one field at a time, is the reason nobody fills these screens in correctly.
 *
 * The messages are the Spanish the API itself answers with, so a client-side rejection and a
 * server-side one read the same.
 */

/** Same shape the API's `@IsEmail` accepts, kept deliberately loose. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (email === '') return 'Escriba el correo electrónico.';
  if (!EMAIL.test(email)) return 'El correo electrónico no es válido.';
  if (email.length > 180) return 'El correo no puede superar los 180 caracteres.';
  return null;
}

export function validateFullName(value: string): string | null {
  const name = value.trim();
  if (name === '') return 'Escriba el nombre completo.';
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (name.length > 160) return 'El nombre no puede superar los 160 caracteres.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (value === '') return 'Escriba una contraseña.';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  return null;
}

/** The second field of a password change, which only exists to catch a typo in the first. */
export function validatePasswordRepeat(password: string, repeat: string): string | null {
  if (repeat === '') return 'Repita la contraseña.';
  if (password !== repeat) return 'Las dos contraseñas no coinciden.';
  return null;
}

export function validateRole(value: string, allowed: readonly string[]): string | null {
  if (value === '') return 'Elija un rol.';
  if (!allowed.includes(value)) return 'Ese rol no existe.';
  return null;
}

/** True when every entry is `null`, i.e. the form may be submitted. */
export function isValid(errors: Record<string, string | null>): boolean {
  return Object.values(errors).every((error) => error === null);
}
