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
 */
export function ConfusionMatrix({
  matrix,
  labels,
  className,
}: {
  matrix: number[][];
  labels: string[];
  className?: string;
}) {
  const rowTotals = matrix.map((row) => row.reduce((acc, value) => acc + value, 0));

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <caption className="px-1 pb-3 text-left text-xs text-slate-500 dark:text-slate-400">
          Filas: diagnóstico de referencia · Columnas: predicción · Diagonal: concordancia.
        </caption>
        <thead>
          <tr>
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Referencia \ Predicción
            </th>
            {labels.map((label) => (
              <th
                key={label}
                scope="col"
                className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {label}
              </th>
            ))}
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {matrix.map((row, rowIndex) => {
            const total = rowTotals[rowIndex] ?? 0;
            return (
              <tr key={labels[rowIndex] ?? rowIndex}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-slate-900 dark:text-slate-100"
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
                        isDiagonal ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100',
                      )}
                      style={{
                        // The shade encodes the cell's own value, so it is a datum rather than a
                        // style rule and cannot be expressed as a utility class. Colours are
                        // Tailwind's emerald-600 and red-600 with a data-driven alpha.
                        backgroundColor:
                          value === 0
                            ? undefined
                            : `rgb(${isDiagonal ? '0 150 137' : '231 0 11'} / ${0.08 + share * 0.32})`,
                      }}
                      title={`${value} caso(s) · ${(share * 100).toFixed(1)} % de la fila`}
                    >
                      {value}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right tabular-nums text-slate-500 dark:text-slate-400">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
