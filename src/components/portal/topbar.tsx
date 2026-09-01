'use client';

import { LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { pageTitleFor } from '@/components/portal/navigation';
import { StudyModeSwitch } from '@/components/portal/study-mode-switch';
import { useSession } from '@/components/session-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { USER_ROLE_LABELS } from '@/lib/roles';

/**
 * Top bar of the portal.
 *
 * Navigation lives in the sidebar, so this carries only what has to be visible on every screen:
 * where you are, under which experimental condition you are recording, and who you are.
 *
 * The study-mode badge sits here on purpose. It is the single piece of state that changes what
 * the physician is allowed to see, and burying it in a menu would let someone diagnose a case
 * without noticing which observation they are contributing to.
 */
export function Topbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" aria-hidden />
        <span className="sr-only">Abrir menú</span>
      </button>

      <h1 className="truncate font-(family-name:--font-poppins) text-base font-semibold text-slate-900 dark:text-slate-100">
        {pageTitleFor(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <StudyModeSwitch />
        {/* Always visible, including on a phone: hiding it below `sm` left the drawer as the only
            way to change theme, and the drawer has no toggle. */}
        <ThemeToggle />

        <div className="hidden min-w-0 text-right md:block">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {user?.fullName ?? ''}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {user === null ? '' : (USER_ROLE_LABELS[user.role] ?? user.role)}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Cerrar sesión"
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="sr-only">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
