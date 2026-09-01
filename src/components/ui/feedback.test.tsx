import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StudyModeBlocked } from './feedback';

/**
 * The pretest block is a critical component: it is what the physician sees instead of the AI
 * suggestion during observation O₁. It must read as intended behaviour of the design, not as a
 * malfunction, or the reviewer will "fix" it by working around the block.
 */
describe('StudyModeBlocked', () => {
  it('explains that the block protects the internal validity of the pretest', () => {
    render(<StudyModeBlocked />);

    expect(screen.getByText(/bloqueado — modo pretest/i)).toBeInTheDocument();
    expect(screen.getByText(/sin asistencia de la inteligencia artificial/i)).toBeInTheDocument();
    expect(screen.getByText(/RF-TR-01/)).toBeInTheDocument();
  });

  it('states that the block is enforced on the server, not only on screen', () => {
    render(<StudyModeBlocked />);
    expect(screen.getByText(/se aplica en el servidor/i)).toBeInTheDocument();
  });
});
