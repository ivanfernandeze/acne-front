'use client';

import { cn } from '@/lib/cn';

/**
 * Confusion matrix over the five IGA classes.
 *
 * Covers: RF-OE2-04. Rows are the reference (gold standard), columns the prediction, so the
 * diagonal is agreement — highlighted, because that is the first thing a reader looks for.
 *
 * Cells are shaded by their share of the ROW, not of the whole matrix: on an imbalanced sample a
 * global scale would wash out every minority class and hide exactly the errors that matter, such
 * as a `severo` case graded as `moderado`.
 *
 */
/**
 * Fill colours and alpha range of the cells.
 *
 * The -600 tones are dark enough to read as a tint over white, and the floor keeps a cell with one
 * single case from being invisible: a confusion matrix whose rare errors vanish is worse than no
 * matrix, because it looks like the model never made them.
 *
 * Green for agreement and red for error stay semantic and do NOT follow the brand colour: they mean
 * right and wrong, and repainting them violet would cost the one reading the matrix exists for.
 */
const RAMP = {
  agreement: '0 153 102', // emerald-600
  error: '231 0 11', // red-600
  floor: 0.08,
  span: 0.32,
} as const;

export function ConfusionMatrix({
  matrix,
  labels,
  className,
}: {
  matrix: number[][];
  labels: string[];
  className?: string;
}) {
  const ramp = RAMP;
  const rowTotals = matrix.map((row) => row.reduce((acc, value) => acc + value, 0));

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <caption className="px-1 pb-3 text-left text-xs text-neutral-500">
          Filas: diagnóstico de referencia · Columnas: predicción · Diagonal: concordancia.
        </caption>
        <thead>
          <tr>
            <th className="border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Referencia \ Predicción
            </th>
            {labels.map((label) => (
              <th
                key={label}
                scope="col"
                className="border-b border-neutral-200 px-3 py-2 text-center text-xs font-semibold text-neutral-500"
              >
                {label}
              </th>
            ))}
            <th className="border-b border-neutral-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {matrix.map((row, rowIndex) => {
            const total = rowTotals[rowIndex] ?? 0;
            return (
              <tr key={labels[rowIndex] ?? rowIndex}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-neutral-900"
                >
                  {labels[rowIndex] ?? `Clase ${rowIndex}`}
                </th>
                {row.map((value, columnIndex) => {
                  const isDiagonal = rowIndex === columnIndex;
                  const share = total === 0 ? 0 : value / total;
                  return (
                    <td
                      key={`${rowIndex}-${columnIndex}`}
                      className={cn(
                        'px-3 py-2 text-center tabular-nums',
                        isDiagonal
                          ? 'font-semibold text-emerald-700'
                          : 'text-neutral-900',
                      )}
                      style={{
                        // The shade encodes the cell's own value, so it is a datum rather than a
                        // style rule and cannot be expressed as a utility class.
                        backgroundColor:
                          value === 0
                            ? undefined
                            : `rgb(${isDiagonal ? ramp.agreement : ramp.error} / ${ramp.floor + share * ramp.span})`,
                      }}
                      title={`${value} caso(s) · ${(share * 100).toFixed(1)} % de la fila`}
                    >
                      {value}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right tabular-nums text-neutral-500">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
