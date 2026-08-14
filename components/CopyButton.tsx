'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  copyLabel: string;
  copiedLabel: string;
  /** Announced when the copy succeeds; the visible label change is silent. */
  announcement: string;
  /** Shown briefly when the clipboard write throws — previously silent. */
  failedLabel?: string;
}

export default function CopyButton({
  value,
  copyLabel,
  copiedLabel,
  announcement,
  failedLabel,
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };

  const label =
    state === 'copied' ? `${copiedLabel} ✓` : state === 'failed' ? failedLabel ?? copyLabel : copyLabel;

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className="min-h-touch inline-flex items-center font-mono text-meta text-text-subtle hover:text-gold border border-edge hover:border-edge-accent px-2.5 py-1 rounded transition-colors"
        aria-label={`${copyLabel} ${value}`}
      >
        {label}
      </button>
      {/* The label flip is visual only — a screen reader got no confirmation
          that the address had been copied, or that the copy failed. */}
      <span className="sr-only" role="status">
        {state === 'copied' ? announcement : ''}
        {state === 'failed' ? failedLabel : ''}
      </span>
    </>
  );
}
