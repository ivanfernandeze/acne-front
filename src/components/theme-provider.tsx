'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'acne.theme';

/**
 * Light / dark / system theme.
 *
 * The `dark` variant is bound to a class in `globals.css` (`@custom-variant dark`), because
 * Tailwind v4 compiles `dark:` to `@media (prefers-color-scheme: dark)` by default and JavaScript
 * cannot override a media query. Toggling the class on `<html>` is what makes a manual switch
 * possible at all.
 *
 * `system` is a distinct state, not a synonym for whatever the OS says right now: it keeps
 * following the OS if the user changes it mid-session, which an explicit `light`/`dark` must not.
 */
interface ThemeContextValue {
  theme: Theme;
  /** What is actually painted right now, once `system` has been resolved. */
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(theme: Theme): 'light' | 'dark' {
  const resolved = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  // Lets the browser paint native widgets (scrollbars, form controls) to match.
  root.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    let stored: Theme = 'system';
    try {
      const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw;
    } catch {
      // Private browsing or blocked storage: fall back to following the system.
    }
    setThemeState(stored);
    setResolved(apply(stored));
  }, []);

  // Only while on `system`: react to the OS switching theme mid-session.
  useEffect(() => {
    if (theme !== 'system') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => setResolved(apply('system'));
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setResolved(apply(next));
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The choice simply will not survive a reload.
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  return context;
}

/**
 * Runs before React hydrates, so a user on dark never sees a white flash first.
 *
 * It is intentionally tiny and dependency-free: it duplicates a few lines of the provider because
 * the provider cannot run early enough, and a wrong first paint on a clinical screen is jarring.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';
var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',d);
document.documentElement.style.colorScheme=d?'dark':'light';
}catch(e){}})();`;
