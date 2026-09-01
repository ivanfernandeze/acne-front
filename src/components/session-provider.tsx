'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearSession, readSession, type SessionUser, type StoredSession } from '@/lib/api';

/**
 * Client-side session.
 *
 * The token is held in `localStorage` rather than in an HttpOnly cookie. That is a deliberate
 * trade-off for a single-institution academic prototype: the portal is a pure SPA against a
 * separate origin, and cookie-based auth would need CSRF protection and a shared domain that the
 * three-repository architecture does not have. It is recorded here because a productive
 * deployment in a hospital would have to revisit it.
 */
interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  setSession: (session: StoredSession) => void;
  logout: () => void;
  /** Refreshes the cached user after a study-mode change. */
  refresh: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const setSession = useCallback((session: StoredSession) => {
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  const refresh = useCallback(() => {
    setUser(readSession()?.user ?? null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, setSession, logout, refresh }),
    [user, loading, setSession, logout, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  }
  return context;
}
