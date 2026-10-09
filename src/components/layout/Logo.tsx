/**
 * Brand mark — the lime bolt on a dark rounded square, matching the
 * favicon. Literal colors so it reads identically on light and dark bars.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="logo-mark">
      <rect width="64" height="64" rx="16" fill="#0b0f0c" />
      <path d="M36.5 8 18 36h10.2L27 56l18.5-28H35.3L36.5 8Z" fill="#c9f556" />
    </svg>
  )
}
