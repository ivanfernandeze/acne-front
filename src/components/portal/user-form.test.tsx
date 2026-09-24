import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserForm } from './user-form';

/**
 * `useCatalogs` fetches over the network and there is no MSW in this project, so the roles are
 * stubbed. Everything else is the real component.
 */
vi.mock('@/lib/use-catalogs', () => ({
  useCatalogs: () => ({
    data: {
      roles: {
        values: ['admin', 'dermatologo', 'tecnico'],
        labels: {
          dermatologo: 'Dermatólogo',
          residente: 'Residente',
          admin: 'Administrador',
          evaluador_estadistico: 'Evaluador estadístico',
          tecnico: 'Técnico/a',
        },
        groups: { diagnosing: ['dermatologo'] },
      },
    },
    loading: false,
    error: null,
    reload: () => undefined,
  }),
}));

describe('UserForm', () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('offers no way to change the study mode, in either mode', () => {
    // The rule fixed in the component tree, not only in the DTO. Moving a professional to postest
    // is applying the intervention X of the pre-experimental design (RF-TR-01) and must be their
    // own act; an administrator doing it to someone who does not know would contaminate OE1.
    const { unmount } = render(
      <UserForm mode="create" submitLabel="Crear" onSubmit={onSubmit} />,
    );
    expect(screen.queryByLabelText(/modo de estudio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/postest/i)).not.toBeInTheDocument();
    unmount();

    render(
      <UserForm
        mode="edit"
        submitLabel="Guardar"
        initial={{ fullName: 'Ana Torres', email: 'ana@centro.pe', role: 'dermatologo' }}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByLabelText(/modo de estudio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pretest/i)).not.toBeInTheDocument();
  });

  it('reports an invalid email on its own field and does not submit', async () => {
    const user = userEvent.setup();
    render(<UserForm mode="create" submitLabel="Crear" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Torres Vega');
    await user.type(screen.getByLabelText(/correo/i), 'no-es-un-correo');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'dermatologo');
    await user.type(screen.getByLabelText(/contraseña/i), 'ClaveSegura1');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(screen.getByText('El correo electrónico no es válido.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('asks for a password when creating and not when editing', async () => {
    const { unmount } = render(
      <UserForm mode="create" submitLabel="Crear" onSubmit={onSubmit} />,
    );
    expect(screen.getByLabelText(/contraseña inicial/i)).toBeInTheDocument();
    unmount();

    // An existing account changes its password through its own endpoint, so the field would only
    // invite an administrator to set one for somebody else.
    render(
      <UserForm
        mode="edit"
        submitLabel="Guardar"
        initial={{ fullName: 'Ana Torres', email: 'ana@centro.pe', role: 'dermatologo' }}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });

  it('submits normalised values once every field is valid', async () => {
    const user = userEvent.setup();
    render(<UserForm mode="create" submitLabel="Crear" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nombre completo/i), '  Ana Torres Vega  ');
    await user.type(screen.getByLabelText(/correo/i), '  Ana@Centro.PE  ');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'dermatologo');
    await user.type(screen.getByLabelText(/contraseña/i), 'ClaveSegura1');
    await user.type(screen.getByLabelText(/teléfono/i), '  +51 987 654 321  ');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'Ana Torres Vega',
      email: 'ana@centro.pe',
      role: 'dermatologo',
      specialty: '',
      // Recortado como los demás: un teléfono con espacios al final es el mismo teléfono, y
      // guardarlo así lo vuelve distinto de sí mismo en cualquier comparación posterior.
      phone: '+51 987 654 321',
      password: 'ClaveSegura1',
    });
  });

  it('locks the role when someone edits their own account', () => {
    // Mirrors the server, which refuses a self role change: an administrator who demoted
    // themselves would need another administrator to undo it.
    render(
      <UserForm
        mode="edit"
        lockRole
        submitLabel="Guardar"
        initial={{ fullName: 'Ana Torres', email: 'ana@centro.pe', role: 'admin' }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText(/rol/i)).toBeDisabled();
    expect(screen.getByText(/no puede cambiar su propio rol/i)).toBeInTheDocument();
  });
});
