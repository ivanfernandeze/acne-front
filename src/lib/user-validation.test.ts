import { describe, expect, it } from 'vitest';

import {
  isValid,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordRepeat,
  validateRole,
} from './user-validation';

/**
 * These are the first per-field messages in the portal — the `error` prop of `Field` existed from
 * day one and no page had ever passed it. They must say the same thing the API says, so a
 * client-side rejection and a server-side one do not read like two different systems.
 */
describe('validateEmail', () => {
  it('accepts an address the API would accept', () => {
    expect(validateEmail('dermatologo@centro.pe')).toBeNull();
    expect(validateEmail('  dermatologo@centro.pe  ')).toBeNull();
  });

  it.each(['', '   ', 'sin-arroba', 'dos@@arrobas.pe', 'sin@dominio'])(
    'rejects %j',
    (value) => {
      expect(validateEmail(value)).not.toBeNull();
    },
  );

  it('uses the same wording as the API', () => {
    expect(validateEmail('roto')).toBe('El correo electrónico no es válido.');
  });
});

describe('validateFullName', () => {
  it('mirrors the @Length(3, 160) of the DTO', () => {
    expect(validateFullName('Ana')).toBeNull();
    expect(validateFullName('An')).not.toBeNull();
    expect(validateFullName('x'.repeat(161))).not.toBeNull();
  });

  it('does not count surrounding whitespace as characters', () => {
    expect(validateFullName('  A  ')).not.toBeNull();
  });
});

describe('validatePassword', () => {
  it('mirrors the @MinLength(8) of the DTO', () => {
    expect(validatePassword('12345678')).toBeNull();
    expect(validatePassword('1234567')).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('does not trim: a space is a legitimate character in a password', () => {
    expect(validatePassword('  a  b  ')).toBeNull();
  });
});

describe('validatePasswordRepeat', () => {
  it('exists only to catch a typo in the first field', () => {
    expect(validatePasswordRepeat('ClaveSegura1', 'ClaveSegura1')).toBeNull();
    expect(validatePasswordRepeat('ClaveSegura1', 'ClaveSegura2')).toBe(
      'Las dos contraseñas no coinciden.',
    );
    expect(validatePasswordRepeat('ClaveSegura1', '')).toBe('Repita la contraseña.');
  });
});

describe('validateRole', () => {
  it('checks against the roles the API served, not a list written here', () => {
    expect(validateRole('dermatologo', ['admin', 'dermatologo'])).toBeNull();
    expect(validateRole('tecnico', ['admin', 'dermatologo'])).not.toBeNull();
    expect(validateRole('', ['dermatologo'])).toBe('Elija un rol.');
  });
});

describe('isValid', () => {
  it('is true only when every field came back clean', () => {
    expect(isValid({ a: null, b: null })).toBe(true);
    expect(isValid({ a: null, b: 'roto' })).toBe(false);
    expect(isValid({})).toBe(true);
  });
});
