'use client';

import { Activity, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_GROUPS, isActive } from '@/components/portal/navigation';
import { cn } from '@/lib/cn';

/**
 * Portal sidebar.
 *
 * Collapses to an icon rail on desktop and becomes a drawer on mobile. Collapsed items keep a
 * `title` so the label is still reachable on hover — an icon rail with no way to recover the
 * meaning is a trap for an occasional user, which is exactly who a thesis examiner is.
 */
export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  // The drawer is always rendered expanded: collapsing is a desktop space trade-off, and an icon
  // rail inside an overlay that already covers the screen would only make it harder to read.
  const renderContent = (collapsed: boolean) => (
    <>
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-700',
          collapsed && 'justify-center px-0',
        )}
      >
        <Activity className="h-6 w-6 shrink-0 text-sky-900 dark:text-sky-400" aria-hidden />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-(family-name:--font-poppins) text-sm font-bold text-slate-900 dark:text-slate-100">
              Acné UNT
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              Diagnóstico asistido
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" aria-hidden />
          <span className="sr-only">Cerrar menú</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`} className={groupIndex > 0 ? 'mt-5' : ''}>
            {group.title !== null && !collapsed ? (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.title}
              </p>
            ) : null}
            {group.title !== null && collapsed ? (
              <div className="mx-3 mb-2 border-t border-slate-200 dark:border-slate-700" />
            ) : null}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item, pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : (item.objective ?? undefined)}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-900 dark:focus-visible:ring-sky-400',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-sky-50 font-medium text-sky-900 dark:bg-sky-950 dark:text-sky-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5 shrink-0',
                          active
                            ? 'text-sky-900 dark:text-sky-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                        )}
                        aria-hidden
                      />
                      {!collapsed ? (
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{item.label}</span>
                          {item.hint !== undefined ? (
                            <span className="block truncate text-[11px] font-normal text-slate-400 dark:text-slate-500">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-2 dark:border-slate-700">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors lg:flex',
            'hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4.5 w-4.5" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="h-4.5 w-4.5" aria-hidden />
              <span>Colapsar</span>
            </>
          )}
          <span className="sr-only">{collapsed ? 'Expandir menú' : 'Colapsar menú'}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex',
          'dark:border-slate-700 dark:bg-slate-900',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {renderContent(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-slate-900/50"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {renderContent(false)}
          </aside>
        </div>
      ) : null}
    </>
  );
}
