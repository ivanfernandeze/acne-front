import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Catalogs } from '@/lib/use-catalogs';

import { EnsembleVotes } from './ensemble-votes';

const catalogs = {
  iga: { labels: { leve: 'Leve', moderado: 'Moderado', severo: 'Severo' } },
} as unknown as Catalogs;

const members = [
  {
    tag: 'yolov8s-cls',
    modelName: 'yolov8_cls',
    modelVersion: 'yolov8_cls_9ea3',
    weightsChecksum: 'abc',
    weight: 0.676,
    igaClass: 'severo' as const,
    confidence: 0.73,
    classProbs: {},
    heatmapImageId: 'heat-yolo',
    latencyMs: 120,
  },
  {
    tag: 'efficientnet_b2',
    modelName: 'efficientnet_b2',
    modelVersion: 'efficientnet_b2_2026',
    weightsChecksum: 'def',
    weight: 0.633,
    igaClass: 'moderado' as const,
    confidence: 0.81,
    classProbs: {},
    heatmapImageId: null,
    latencyMs: 90,
  },
];

describe('EnsembleVotes', () => {
  it('renders nothing without members', () => {
    const { container } = render(
      <EnsembleVotes members={[]} agreement={null} catalogs={catalogs} recommended={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('lists every vote, the agreement level and marks the dissenting model', () => {
    render(
      <EnsembleVotes
        members={members}
        agreement="mayoria"
        catalogs={catalogs}
        recommended="severo"
      />,
    );
    expect(screen.getByText('Acuerdo: Mayoría')).toBeInTheDocument();
    expect(screen.getByText('yolov8s-cls')).toBeInTheDocument();
    expect(screen.getByText('Severo')).toHaveClass('text-neutral-900');
    expect(screen.getByText('Moderado')).toHaveClass('text-amber-700');
    expect(screen.getByText('0,676')).toBeInTheDocument();
  });

  it('lets the reader open a member Grad-CAM when there is one', () => {
    const onSelect = vi.fn();
    render(
      <EnsembleVotes
        members={members}
        agreement="mayoria"
        catalogs={catalogs}
        recommended="severo"
        selectedHeatmap="heat-yolo"
        onSelectHeatmap={onSelect}
      />,
    );
    expect(screen.getByRole('button', { name: 'Mostrando' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrando' }));
    expect(onSelect).toHaveBeenCalledWith('heat-yolo');
  });
});
