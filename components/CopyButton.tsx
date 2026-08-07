'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}

export default function CopyButton({ value, copyLabel, copiedLabel }: CopyButtonProps) {
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
    <button
      type="button"
      onClick={onCopy}
      className="font-mono text-meta text-text-subtle hover:text-gold border border-cream/10 hover:border-gold/40 px-2.5 py-1 rounded transition-colors"
      aria-label={`${copyLabel} ${value}`}
    >
      {copied ? `${copiedLabel} ✓` : copyLabel}
    </button>
  );
}
