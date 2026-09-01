import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { SessionProvider } from '@/components/session-provider';
import { THEME_INIT_SCRIPT, ThemeProvider } from '@/components/theme-provider';

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
    <html lang="es-PE" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before the first paint, so a user on dark never sees a
            white flash. It has to be inline: nothing else runs early enough. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-(family-name:--font-inter) text-slate-900 dark:text-slate-100 antialiased">
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
