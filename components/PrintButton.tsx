'use client';

/**
 * Opens the browser's own print dialog, where "Save as PDF" lives on every
 * platform. No PDF generation and no dependency — the print stylesheet in
 * globals.css does the work, so the paper version can't drift from the page.
 * Hidden from the printed output itself.
 */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide min-h-touch inline-flex items-center gap-2 rounded border border-edge px-3.5 py-2 font-mono text-meta text-text-subtle transition-colors hover:border-edge-accent hover:text-gold"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M4 6V2h8v4M4 12H2V6h12v6h-2M4 10h8v4H4z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
