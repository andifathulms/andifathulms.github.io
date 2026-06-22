'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ProjectScreenshot } from '@/lib/content';

const GRID_LIMIT = 6;

interface Props {
  screenshots: ProjectScreenshot[];
  label: string;
}

export default function ScreenshotGallery({ screenshots, label }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const hasMore = screenshots.length > GRID_LIMIT;
  const visible = showAll ? screenshots : screenshots.slice(0, GRID_LIMIT);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + screenshots.length) % screenshots.length)),
    [screenshots.length]
  );
  const next = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % screenshots.length)),
    [screenshots.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, prev, next]);

  return (
    <div className="border-t border-gold/20 mt-16 pt-10">
      <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-6">{label}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((shot, i) => (
          <figure key={shot.src}>
            <button
              onClick={() => setActiveIndex(i)}
              className="block w-full text-left group cursor-zoom-in"
              aria-label={`View ${shot.caption} full size`}
            >
              <div className="relative overflow-hidden rounded border border-cream/5 bg-navy/60 transition-colors group-hover:border-cream/20">
                <Image
                  src={shot.src}
                  alt={shot.caption}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-navy/80 text-cream/70 font-mono text-xs px-2 py-1 rounded">
                    click to enlarge
                  </span>
                </div>
              </div>
            </button>
            {shot.caption && (
              <figcaption className="font-mono text-xs text-cream/30 mt-2 px-0.5">
                {shot.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* View all / collapse toggle */}
      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-5 font-mono text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-4 py-2 rounded transition-colors"
        >
          {showAll
            ? 'Show less ↑'
            : `View all ${screenshots.length} screenshots ↓`}
        </button>
      )}

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 bg-navy/90 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-4xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — top right, clearly visible */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cream/30">
                {activeIndex + 1} / {screenshots.length}
              </span>
              <button
                onClick={close}
                className="flex items-center gap-1.5 font-mono text-xs text-cream/50 hover:text-cream border border-cream/10 hover:border-cream/30 px-3 py-1.5 rounded transition-colors"
                aria-label="Close lightbox"
              >
                close ✕
              </button>
            </div>

            {/* Image — constrained so it never fills the full viewport */}
            <div className="rounded border border-cream/10 overflow-hidden bg-navy/60">
              <Image
                src={screenshots[activeIndex].src}
                alt={screenshots[activeIndex].caption}
                width={1600}
                height={1000}
                className="w-full h-auto object-contain max-h-[65vh]"
                priority
              />
            </div>

            {/* Caption + prev/next */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={prev}
                className="font-mono text-xs text-cream/40 hover:text-cream border border-cream/10 hover:border-cream/30 px-3 py-1.5 rounded transition-colors"
                aria-label="Previous"
              >
                ← prev
              </button>

              <span className="font-mono text-xs text-cream/50 text-center">
                {screenshots[activeIndex].caption}
              </span>

              <button
                onClick={next}
                className="font-mono text-xs text-cream/40 hover:text-cream border border-cream/10 hover:border-cream/30 px-3 py-1.5 rounded transition-colors"
                aria-label="Next"
              >
                next →
              </button>
            </div>

            <p className="font-mono text-xs text-cream/20 text-center -mt-1">
              click outside or press Esc to close · ← → to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
