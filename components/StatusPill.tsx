/**
 * The one pill shape in the system — a pill is a status claim (DESIGN.md, the
 * Pill Rule). Opaque so it stays legible over any screenshot.
 */
export default function StatusPill({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-navy px-2.5 py-1 text-xs font-medium text-cream ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lagoon" />
      {label}
    </span>
  );
}
