'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  copyLabel: string;
  copiedLabel: string;
  /** Announced when the copy succeeds; the visible label change is silent. */
  announcement: string;
}

export default function CopyButton({
  value,
  copyLabel,
  copiedLabel,
  announcement,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className="min-h-touch inline-flex items-center font-mono text-meta text-text-subtle hover:text-gold border border-edge hover:border-edge-accent px-2.5 py-1 rounded transition-colors"
        aria-label={`${copyLabel} ${value}`}
      >
        {copied ? `${copiedLabel} ✓` : copyLabel}
      </button>
      {/* The label flip is visual only — a screen reader got no confirmation
          that the address had been copied. */}
      <span className="sr-only" role="status">
        {copied ? announcement : ''}
      </span>
    </>
  );
}
