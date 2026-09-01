'use client';

import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  FlaskConical,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSession } from '@/components/session-provider';
import { StudyModeSwitch } from '@/components/portal/study-mode-switch';
import { Loading } from '@/components/ui/feedback';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Activity;
  /** `/portal` would otherwise match every child route. */
  exact?: boolean;
}

const NAV: readonly NavItem[] = [
  { href: '/portal', label: 'Resumen', icon: Activity, exact: true },
  { href: '/portal/casos', label: 'Casos', icon: Stethoscope },
  { href: '/portal/jornada', label: 'Jornada', icon: Timer },
  { href: '/portal/indicadores', label: 'Indicadores', icon: BarChart3 },
  { href: '/portal/estadistica', label: 'Estadística', icon: FlaskConical },
  { href: '/portal/anexos', label: 'Anexos', icon: ClipboardList },
  { href: '/portal/encuesta', label: 'Encuesta', icon: FileText },
  { href: '/portal/auditoria', label: 'Auditoría', icon: ShieldCheck },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user === null) router.replace('/login');
  }, [loading, user, router]);

  if (loading) return <Loading label="Verificando sesión…" />;
  if (user === null) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/portal" className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-display text-sm font-semibold text-foreground">
              Portal del dermatólogo
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <StudyModeSwitch />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="rounded-md p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only">Cerrar sesión</span>
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-7xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2">
            {NAV.map((item) => {
              const active =
                item.exact === true ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-primary-soft font-medium text-primary'
                        : 'text-muted hover:bg-surface-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
