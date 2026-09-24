import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmAction } from './confirm';

/**
 * The whole point of this component is that one click is never enough. Everything it guards —
 * deactivating an account, taking a patient out of the study — is either irreversible or expensive
 * to undo, so the tests are about the second step existing and being reachable.
 */
describe('ConfirmAction', () => {
  function setup(props: Partial<Parameters<typeof ConfirmAction>[0]> = {}) {
    const onConfirm = vi.fn();
    render(
      <ConfirmAction
        label="Desactivar cuenta"
        title="La cuenta dejará de poder entrar"
        description="No se borra nada."
        confirmLabel="Desactivar"
        onConfirm={onConfirm}
        {...props}
      />,
    );
    return { onConfirm, user: userEvent.setup() };
  }

  it('does not act on the first click', async () => {
    const { onConfirm, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('La cuenta dejará de poder entrar')).toBeInTheDocument();
  });

  it('acts on the second, and says what it costs before it does', async () => {
    const { onConfirm, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
    expect(screen.getByText('No se borra nada.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desactivar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels with Escape without acting', async () => {
    const { onConfirm, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
    await user.keyboard('{Escape}');

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Desactivar cuenta' })).toBeInTheDocument();
  });

  it('cancels with the button without acting', async () => {
    const { onConfirm, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('withholds confirmation until a required reason is long enough', async () => {
    const { onConfirm, user } = setup({
      requireReason: true,
      reasonMinLength: 10,
      label: 'Retirar del estudio',
      confirmLabel: 'Registrar retiro',
      reasonLabel: 'Motivo del retiro',
    });

    await user.click(screen.getByRole('button', { name: 'Retirar del estudio' }));
    const confirm = screen.getByRole('button', { name: 'Registrar retiro' });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText('Motivo del retiro'), 'corto');
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText('Motivo del retiro'), ' pero ya no tanto');
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('corto pero ya no tanto');
  });

  it('forgets a half-typed reason when reopened', async () => {
    // Otherwise the reason from an abandoned attempt would be submitted against the next one.
    const { onConfirm, user } = setup({ requireReason: true, reasonMinLength: 4 });

    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
    await user.type(screen.getByLabelText('Motivo'), 'primer intento');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));

    expect(screen.getByLabelText('Motivo')).toHaveValue('');
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
