'use client';

import { Monitor, Moon, Sun } from 'lucide-react';

import { useTheme, type Theme } from '@/components/theme-provider';
import { cn } from '@/lib/cn';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

/**
 * Three-state theme switch.
 *
 * A segmented control rather than a single toggle because `system` is a real third state: a
 * two-way switch would force the user to pick a fixed theme and lose the ability to follow the
 * operating system.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5',
        'dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-900 dark:focus-visible:ring-sky-400',
              active
                ? 'bg-white text-sky-900 shadow-sm dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
