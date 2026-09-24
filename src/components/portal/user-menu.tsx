'use client';

import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { useSession } from '@/components/session-provider';
import { cn } from '@/lib/cn';
import { USER_ROLE_LABELS } from '@/lib/roles';
import { useDismissable } from '@/lib/use-dismissable';
import { usePortalHref } from '@/lib/use-portal';

/** First letters of the name, for the avatar. Two words at most: "Ana Torres Vega" → "AT". */
export function initialsOf(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * The account control of the top bar.
 *
 * Replaces a name, a role and a bare sign-out icon sitting loose in the row. Two things come out of
 * folding them into a menu: the row gets one control instead of three, which is what let the bar fit
 * on a phone at all, and signing out stops being a one-click reach — it was an unlabelled icon next
 * to the user's own name, which is a mis-click waiting to happen mid-review with a chronometer
 * running.
 */
export function UserMenu() {
  const href = usePortalHref();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismissable<HTMLDivElement>(open, close);

  if (user === null) return null;

  const role = USER_ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          // On a phone the trigger is the bare avatar: name and chevron both fold away, because
          // the row also carries the menu button, the page title and the study-mode badge, and
          // 68 px of account control was more than it had.
          'flex items-center rounded-full transition-colors sm:gap-2 sm:py-1 sm:pl-1 sm:pr-2',
          'hover:bg-neutral-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-900',
          open && 'bg-neutral-100',
        )}
      >
        <Avatar name={user.fullName} />
        {/* The name is for orientation, not identification, so it is the first thing to go when the
            row runs out of room; the avatar stays at every width. */}
        <span className="hidden max-w-32 truncate text-sm font-medium text-neutral-900 sm:inline">
          {user.fullName}
        </span>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 shrink-0 text-neutral-500 transition-transform sm:block',
            open && 'rotate-180',
          )}
          aria-hidden
        />
        <span className="sr-only">Menú de la cuenta</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
        >
          <div className="flex items-start gap-3 border-b border-neutral-200 p-4">
            <Avatar name={user.fullName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {user.email}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">{role}</p>
            </div>
          </div>

          <div className="p-1">
            <Link
              href={href('/perfil')}
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <UserRound className="h-4 w-4 shrink-0" aria-hidden />
              Mi cuenta
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-purple-900 font-semibold text-white',
        size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs',
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
