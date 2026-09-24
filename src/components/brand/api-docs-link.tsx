'use client';

import { ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button-variants';

/**
 * Link to the API's Swagger UI.
 *
 * The href used to be hard-coded to `http://localhost:3001/docs`, which only ever worked on the
 * machine running the server — from the phone or from a colleague's laptop it pointed at their own
 * loopback. It is resolved the same way `resolveBaseUrl` in `lib/api.ts` resolves the API itself:
 * the origin the page was actually served from, minus the client port. That means this has to be a
 * client component; the landing around it stays a server component.
 */
export function ApiDocsLink() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  const href =
    configured !== undefined && configured !== ''
      ? `${configured.replace(/\/api\/?$/, '')}/docs`
      : typeof window === 'undefined'
        ? 'http://localhost:3001/docs'
        : `${window.location.protocol}//${window.location.hostname}:3001/docs`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant: 'outline' })}
    >
      Documentación de la API
      <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}
