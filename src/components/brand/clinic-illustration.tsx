import { cn } from '@/lib/cn';

/**
 * The illustrated half of the login screen.
 *
 * Drawn rather than photographed for three reasons: there is no licensed clinical photograph to ship
 * with the repository, a stock face would misrepresent a prototype that has never seen a real
 * patient, and an SVG stays sharp on the 4K projector a thesis defence runs on. It reuses the visual
 * language already established by the PWA icon — the outlined face, the lesion marks — and adds the
 * two ideas the system is about: the dashed framing oval from the capture screen, and a faint
 * analysis grid over the region of interest.
 *
 * SVG in JSX is markup, not a stylesheet, so the Tailwind-only policy holds.
 *
 * To use a photograph instead, replace this component's body with an `<img>` pointing at a file in
 * `public/`, keeping the same absolute-fill classes. Nothing else needs to change.
 */
export function ClinicIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustración de un rostro analizado por el sistema"
    >
      <defs>
        <linearGradient id="clinic-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="55%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <radialGradient id="clinic-glow" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="400" fill="url(#clinic-bg)" />
      <circle cx="200" cy="168" r="150" fill="url(#clinic-glow)" />

      {/* Analysis grid, faint: it suggests the model reading the image without pretending to be a
          real heat map, which would be a claim the stub backend cannot support. */}
      <g stroke="#c4b5fd" strokeOpacity="0.14" strokeWidth="1">
        {[60, 100, 140, 180, 220, 260, 300, 340].map((x) => (
          <line key={`v${x}`} x1={x} y1="40" x2={x} y2="300" />
        ))}
        {[60, 100, 140, 180, 220, 260, 300].map((y) => (
          <line key={`h${y}`} x1="60" y1={y} x2="340" y2={y} />
        ))}
      </g>

      {/* Framing oval — the same guide the capture screen draws over the camera preview. */}
      <ellipse
        cx="200"
        cy="168"
        rx="104"
        ry="136"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="2"
        strokeDasharray="10 8"
        opacity="0.75"
      />

      {/* The face, in the same outline style as the icon. */}
      <circle cx="200" cy="168" r="84" fill="none" stroke="#f5f3ff" strokeWidth="3" opacity="0.9" />

      {/* Lesions, each ringed as the model would mark a region of interest. */}
      <g>
        <circle cx="168" cy="146" r="9" fill="#c4b5fd" />
        <circle cx="168" cy="146" r="20" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
        <circle cx="230" cy="178" r="7" fill="#c4b5fd" />
        <circle cx="230" cy="178" r="17" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
        <circle cx="192" cy="208" r="6" fill="#c4b5fd" />
        <circle cx="192" cy="208" r="15" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
        <circle cx="214" cy="128" r="5" fill="#c4b5fd" opacity="0.8" />
      </g>

      {/* The icon's baseline rules are deliberately NOT repeated here: the caption sits across the
          bottom of this panel and they read as strikethrough behind the text. */}
    </svg>
  );
}
