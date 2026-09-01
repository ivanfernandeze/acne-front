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
