import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnamnesisMismatchAlert } from './anamnesis-mismatch-alert';

describe('AnamnesisMismatchAlert', () => {
  it('renders nothing when the server found no mismatch', () => {
    const { container } = render(<AnamnesisMismatchAlert messages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows each message as an alert and says the decision stays with the professional', () => {
    render(
      <AnamnesisMismatchAlert
        messages={[
          'El modelo clasificó la imagen como "Casi sin lesiones", pero la anamnesis refiere lesiones desde hace 1 a 6 meses.',
          'Revise si la fotografía corresponde al paciente y a la zona afectada.',
        ]}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Incongruencia entre la anamnesis y la imagen');
    expect(screen.getByText(/Casi sin lesiones/)).toBeInTheDocument();
    expect(screen.getByText(/corresponde al paciente/)).toBeInTheDocument();
    expect(screen.getByText(/la decisión es del profesional/)).toBeInTheDocument();
  });
});
