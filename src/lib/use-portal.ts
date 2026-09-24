'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { PORTALS, portalFromPathname, portalHref, type PortalDefinition } from '@/lib/portals';

/**
 * The portal the current route belongs to, and how to build links inside it.
 *
 * Every screen is rendered by all three portals that declare it, so no screen may hard-code
 * `/dermatologo/casos`: the same component has to resolve to `/admin/casos` when the administrator
 * opens it. Deriving the base from the pathname keeps that decision in one place and means a screen
 * moved between portals needs no edit at all.
 *
 * Outside the portals — the login page, the patient PWA, the QR capture flow — there is no portal
 * to derive, and the hook falls back to `dermatologo` rather than throwing: a shared header
 * rendering a dead link is a nuisance, a crashed capture page is a patient who cannot send photos.
 */
export function usePortal(): {
  portal: PortalDefinition;
  href: (path: string) => string;
} {
  const pathname = usePathname();
  const portal = useMemo(
    () => portalFromPathname(pathname ?? '') ?? PORTALS.dermatologo,
    [pathname],
  );
  const href = useCallback((path: string) => portalHref(portal.slug, path), [portal.slug]);
  return { portal, href };
}

/** Just the link builder, for the many screens that need nothing else. */
export function usePortalHref(): (path: string) => string {
  return usePortal().href;
}
