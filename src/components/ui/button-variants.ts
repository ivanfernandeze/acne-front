import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button class variants.
 *
 * Deliberately in its own module WITHOUT `'use client'`: server components style `<Link>` as a
 * button by calling `buttonVariants(...)` during render. Exporting it from the client component
 * file would hand the server a client-reference proxy instead of the function, and the page would
 * crash at prerender with "(0 , l.d) is not a function".
 *
 * Section 12.3 requires repeated visual patterns to live in React components with Tailwind
 * utilities, never in CSS classes; `class-variance-authority` is what keeps the variants in
 * TypeScript.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-900 dark:focus-visible:ring-sky-400 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-sky-900 dark:bg-sky-600 text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-500',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700',
        outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
        ghost: 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
        danger: 'bg-red-700 dark:bg-red-600 text-white dark:text-slate-950 hover:bg-red-800 dark:hover:bg-red-500',
        success: 'bg-emerald-700 dark:bg-emerald-600 text-white dark:text-slate-950 hover:bg-emerald-800 dark:hover:bg-emerald-500',
        link: 'text-sky-900 dark:text-sky-400 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
