'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { UserMenu } from '@/components/portal/user-menu';
import { pageTitleFor } from '@/lib/portals';
import { usePortal } from '@/lib/use-portal';

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
  const { portal } = usePortal();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
        <span className="sr-only">Abrir menú</span>
      </button>

      <h1 className="min-w-24 flex-1 truncate text-base font-semibold text-neutral-900">
        {pageTitleFor(portal, pathname ?? '')}
      </h1>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Visible at every width: as a single button it costs 36 px, which the row can
            afford even on a phone. As a three-segment control it could not. */}

        <UserMenu />
      </div>
    </header>
  );
}
