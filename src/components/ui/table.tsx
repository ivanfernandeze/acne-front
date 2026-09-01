import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

/**
 * Data table.
 *
 * The wrapper scrolls horizontally on its own so a wide instrument sheet (Anexo 4, 5 or 7) never
 * makes the whole page scroll sideways on a laptop in the consulting room.
 */
export function Table({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)}>
        {caption !== undefined ? (
          <caption className="px-1 pb-3 text-left text-xs text-slate-500 dark:text-slate-400">{caption}</caption>
        ) : null}
        {children}
      </table>
    </div>
  );
}

export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-100 dark:bg-slate-800', className)} {...props} />;
}

export function Tbody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/60', className)} {...props} />;
}

export function Th({
  className,
  numeric,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-slate-200 dark:border-slate-700 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
        numeric === true && 'text-right',
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  numeric,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        'px-3 py-2.5 align-top text-slate-900 dark:text-slate-100',
        // Tabular figures keep columns of measurements aligned, which matters when the reader is
        // comparing 30 review times at a glance.
        numeric === true && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
}
