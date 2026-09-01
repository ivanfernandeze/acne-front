import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { SessionProvider } from '@/components/session-provider';

import './globals.css';

/**
 * Fonts are loaded with `next/font`, never with an `@import` in a stylesheet: the Tailwind-only
 * policy of section 12.3 forbids anything in `globals.css` beyond the directives and the theme
 * variables, and `next/font` self-hosts the files, which also keeps patient-facing pages from
 * calling Google on load.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Diagnóstico asistido de acné · UNT 2026',
    template: '%s · Diagnóstico asistido de acné',
  },
  description:
    'Prototipo de diagnóstico asistido de acné con inteligencia artificial. Herramienta de apoyo ' +
    'con fines de investigación académica; no sustituye el juicio clínico del profesional médico.',
  applicationName: 'Diagnóstico asistido de acné',
  manifest: '/manifest.json',
  // The portal handles patient data: it must never be indexed.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#123a5c',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
