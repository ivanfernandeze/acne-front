/**
 * Service worker of the patient PWA.
 *
 * Caches ONLY the application shell. Clinical imagery, API responses and anything under
 * `/api/` are explicitly never cached: those travel through short-lived signed URLs and must not
 * be left readable in a browser cache on a shared or lost phone (RNF-02, Ley N.º 29733).
 */

const CACHE_VERSION = 'acne-shell-v2';
const SHELL = ['/app', '/app/captura', '/app/historial', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      // `addAll` rejects wholesale if any entry fails; the shell is best-effort, so failures are
      // swallowed and the app simply stays online-only.
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never touch clinical data or anything cross-origin.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/images/')) return;
  if (!url.pathname.startsWith('/app') && url.pathname !== '/manifest.json') return;

  // Network first, cache as a fallback: a patient must never see a stale screen just because they
  // once opened the app offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy).catch(() => undefined));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/app'))),
  );
});
