'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker of the patient PWA.
 *
 * The worker caches only the application shell. Clinical images are deliberately excluded: they
 * are served through short-lived signed URLs and must not be left sitting in a browser cache on a
 * shared or lost phone (RNF-02, Ley N.º 29733).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const register = (): void => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A failed registration only costs offline support; the app keeps working online.
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
