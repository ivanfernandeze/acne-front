'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field, LabelledInput, PasswordInput, Select } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import type { ApiError } from '@/lib/api';
import { useCatalogs } from '@/lib/use-catalogs';
import {
  isValid,
  validateEmail,
  validateFullName,
  validatePassword,
  validateRole,
} from '@/lib/user-validation';

export interface UserFormValues {
  fullName: string;
  email: string;
  role: string;
  specialty: string;
  phone: string;
  /** Only collected when creating; an existing account changes its password elsewhere. */
  password?: string;
}

/**
 * Create or correct a staff account.
 *
 * There is deliberately NO study-mode control here, in either mode. Moving a professional from
 * pretest to postest is applying the intervention X of the pre-experimental design (RF-TR-01): it
 * has to be that person's own act, through their own screen, with its own audit entry. An
 * administrator flipping the condition of someone who does not know it changed would contaminate
 * the very measurement OE1 takes. The API enforces the same thing by omitting the field from
 * `UpdateUserDto`; this component is where a reader of the UI can see the rule.
 */
export function UserForm({
  mode,
  initial,
  roleScope,
  lockRole = false,
  lockRoleHint,
  pending = false,
  error = null,
  submitLabel,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<UserFormValues>;
  roleScope?: readonly string[];
  /** True when editing one's own account, or when the section already fixes the role. */
  lockRole?: boolean;
  /** Por qué está fijo el rol. Sin esto, una sección de altas mostraría el aviso equivocado. */
  lockRoleHint?: string;
  pending?: boolean;
  error?: ApiError | null;
  submitLabel: string;
  onSubmit: (values: UserFormValues) => void;
}): JSX.Element {
  const { data: catalogs } = useCatalogs();

  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const roleValues = roleScope ?? catalogs?.roles.values ?? [];

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    // Validated on submit rather than on every keystroke: telling someone their email is invalid
    // while they are still typing the first letter is noise, not help.
    const found: Record<string, string | null> = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      role: validateRole(role, roleValues),
      password: mode === 'create' ? validatePassword(password) : null,
    };
    setErrors(found);
    if (!isValid(found)) return;

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      specialty: specialty.trim(),
      phone: phone.trim(),
      ...(mode === 'create' ? { password } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <LabelledInput
        label="Nombre completo"
        required
        value={fullName}
        error={errors.fullName ?? null}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
      />

      <LabelledInput
        label="Correo electrónico"
        required
        type="email"
        value={email}
        error={errors.email ?? null}
        hint="Es el usuario con el que inicia sesión."
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />

      <Field
        label="Rol"
        required
        error={errors.role ?? null}
        hint={lockRoleHint ?? roleHint(lockRole)}
      >
        <Select
          value={role}
          disabled={lockRole}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="">Elija un rol…</option>
          {roleValues.map((value) => (
            <option key={value} value={value}>
              {catalogs?.roles.labels[value] ?? value}
            </option>
          ))}
        </Select>
      </Field>

      <LabelledInput
        label="Especialidad"
        value={specialty}
        hint="Opcional. Se muestra en la ficha del profesional."
        onChange={(event) => setSpecialty(event.target.value)}
      />

      <LabelledInput
        label="Teléfono"
        type="tel"
        value={phone}
        hint="Para localizar a la persona. Se guarda cifrado, igual que el del paciente."
        onChange={(event) => setPhone(event.target.value)}
        autoComplete="tel"
      />

      {mode === 'create' ? (
        <PasswordInput
          label="Contraseña inicial"
          value={password}
          error={errors.password ?? null}
          hint="Mínimo 8 caracteres. La persona podrá cambiarla desde «Mi cuenta»."
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      ) : null}

      {error !== null ? (
        <Alert tone="danger" title="No se pudo guardar">
          {error.message}
        </Alert>
      ) : null}

      <Button type="submit" block loading={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

function roleHint(lockRole: boolean): string {
  return lockRole
    ? 'No puede cambiar su propio rol. Pídaselo a otro administrador.'
    : 'Un cambio de rol se aplica cuando la persona renueva su sesión.';
}
