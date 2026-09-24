import { cn } from '@/lib/cn';

/**
 * The application's mark.
 *
 * Same drawing as `public/icons/icon-192.svg`, which is the PWA icon: a face in outline with three
 * lesions and two baseline rules under it. Kept as a component rather than an `<img>` so it inherits
 * the surrounding colour — the login panel needs it on a blue field, the landing needs it on the
 * page background — and so it stays crisp at any size without a second asset.
 */
export function BrandMark({
  className,
  title = 'Diagnóstico asistido de acné',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 192 192"
      className={cn('h-10 w-10', className)}
      role="img"
      aria-label={title}
    >
      <rect width="192" height="192" rx="34" className="fill-purple-900" />
      <circle
        cx="96"
        cy="86"
        r="42"
        fill="none"
        strokeWidth="7"
        className="stroke-violet-300"
      />
      <circle cx="80" cy="76" r="6" className="fill-violet-300" />
      <circle cx="110" cy="92" r="5" className="fill-violet-300" />
      <circle cx="92" cy="104" r="4" className="fill-violet-300" />
      <path
        d="M62 140h68"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-white"
      />
      <path
        d="M74 156h44"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.6"
        className="stroke-white"
      />
    </svg>
  );
}
