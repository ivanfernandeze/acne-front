'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Sidebar } from '@/components/portal/sidebar';
import { Topbar } from '@/components/portal/topbar';
import { useSession } from '@/components/session-provider';
import { Loading } from '@/components/ui/feedback';
import { cn } from '@/lib/cn';

const COLLAPSED_STORAGE_KEY = 'acne.sidebarCollapsed';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && user === null) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');
    } catch {
      // Blocked storage: the sidebar simply starts expanded every time.
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        /* the preference just will not persist */
      }
      return next;
    });
  }, []);

  if (loading) return <Loading label="Verificando sesión…" />;
  if (user === null) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* The rail is fixed, so the content pane is offset by its width. */}
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
