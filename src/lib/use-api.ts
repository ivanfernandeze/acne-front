'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError, api, type QueryParams } from '@/lib/api';

/**
 * Minimal data-fetching hook.
 *
 * Deliberately not TanStack Query: the portal has a handful of screens, each reading one or two
 * endpoints, and a cache layer would add a dependency and a mental model without buying anything
 * this application needs.
 */
export interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

export function useApi<T>(
  path: string | null,
  query?: QueryParams,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [nonce, setNonce] = useState(0);

  const serialisedQuery = useMemo(() => JSON.stringify(query ?? {}), [query]);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPath<T>(path, JSON.parse(serialisedQuery) as QueryParams)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError(0, caught instanceof Error ? caught.message : String(caught)),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, serialisedQuery, nonce, ...deps]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, error, loading, reload };
}

/**
 * Reloads on an interval, for the desktop watching photographs arrive from a phone.
 *
 * Polling rather than a socket: the portal has exactly one screen that needs live updates, for the
 * few minutes a capture session is open, and a WebSocket server would be infrastructure the study
 * has to run, secure and explain for that one panel.
 *
 * It stops while the tab is hidden — the receptionist switches away constantly and there is no
 * reason to keep hitting the API from a screen nobody is looking at — and resumes on focus.
 */
export function usePolledApi<T>(
  path: string | null,
  query?: QueryParams,
  intervalMs = 3000,
): AsyncState<T> {
  const state = useApi<T>(path, query);
  const { reload } = state;

  useEffect(() => {
    if (path === null || intervalMs <= 0) return;

    const tick = (): void => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      reload();
    };

    const timer = setInterval(tick, intervalMs);
    // A tab coming back into view should refresh immediately rather than wait out the interval.
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [path, intervalMs, reload]);

  return state;
}

/**
 * Delays a fast-changing value, for search boxes.
 *
 * Without it every keystroke fires a request and the results area blanks out mid-word, which on a
 * list the clinician is scanning reads as the data disappearing rather than as loading.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/** Imperative call with its own pending/error state, for buttons and form submissions. */
export function useAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
): {
  run: (...args: TArgs) => Promise<TResult | null>;
  pending: boolean;
  error: ApiError | null;
  reset: () => void;
} {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setPending(true);
      setError(null);
      try {
        return await action(...args);
      } catch (caught: unknown) {
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError(0, caught instanceof Error ? caught.message : String(caught)),
        );
        return null;
      } finally {
        setPending(false);
      }
    },
    [action],
  );

  return { run, pending, error, reset: () => setError(null) };
}
