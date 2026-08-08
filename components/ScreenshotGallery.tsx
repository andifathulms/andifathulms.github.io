'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ProjectScreenshot } from '@/lib/content';

const GRID_LIMIT = 6;

interface Props {
  screenshots: ProjectScreenshot[];
  label: string;
}

export default function ScreenshotGallery({ screenshots, label }: Props) {
  const t = useTranslations('case_study');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const hasMore = screenshots.length > GRID_LIMIT;
  const visible = showAll ? screenshots : screenshots.slice(0, GRID_LIMIT);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + screenshots.length) % screenshots.length
      ),
    [screenshots.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % screenshots.length)),
    [screenshots.length]
  );

  // showModal() gives the focus trap, Escape handling, initial focus, and —
  // unlike the hand-rolled version this replaces — real inertness: everything
  // behind the dialog leaves the accessibility tree, so a screen reader's
  // virtual cursor can't wander into the page underneath.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeIndex === null) {
      if (dialog.open) dialog.close();
      return;
    }

    triggerRef.current = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    dialog.addEventListener('keydown', onKey);
    return () => dialog.removeEventListener('keydown', onKey);
  }, [activeIndex, prev, next]);

  return (
    <div className="border-t border-line mt-16 pt-10">
      <p className="font-mono text-meta text-accent uppercase tracking-wider mb-6">{label}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((shot, i) => (
          <figure key={shot.src}>
            <button
              onClick={() => setActiveIndex(i)}
              className="block w-full text-left group cursor-zoom-in"
              aria-label={t('gallery_enlarge', { caption: shot.caption })}
            >
              <div className="relative overflow-hidden rounded border border-edge bg-navy/60">
                {/* alt is empty: the figcaption below already names this image,
                    and the button carries the action. Three copies of the same
                    caption is noise, not description. */}
                <Image
                  src={shot.src}
                  alt=""
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-navy/80 text-text-muted font-mono text-meta px-2 py-1 rounded">
                    {t('gallery_enlarge_hint')}
                  </span>
                </div>
              </div>
            </button>
            {shot.caption && (
              <figcaption className="font-mono text-meta text-text-subtle mt-2 px-0.5">
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
          aria-expanded={showAll}
          className="mt-5 min-h-touch font-mono text-meta text-accent hover:text-gold border border-line hover:border-edge-accent px-4 py-2 rounded transition-colors"
        >
          {showAll
            ? `${t('gallery_show_less')} ↑`
            : `${t('gallery_show_all', { count: screenshots.length })} ↓`}
        </button>
      )}

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={close}
        // Clicking the backdrop closes. The dialog element *is* the backdrop
        // here, so this needs no extra non-semantic div to hang a handler on.
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto max-h-full w-full max-w-4xl overflow-y-auto overscroll-contain bg-transparent p-6 md:p-12 backdrop:bg-navy/90 backdrop:backdrop-blur-sm"
      >
        {activeIndex !== null && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-meta text-text-subtle">
                {t('gallery_counter', {
                  current: activeIndex + 1,
                  total: screenshots.length,
                })}
              </span>
              <button
                onClick={close}
                className="min-h-touch flex items-center gap-1.5 font-mono text-meta text-text-subtle hover:text-cream border border-edge hover:border-edge-strong px-3 py-1.5 rounded transition-colors"
              >
                {t('gallery_close')} ✕
              </button>
            </div>

            <div className="rounded border border-edge overflow-hidden bg-navy/60">
              <Image
                src={screenshots[activeIndex].src}
                alt={screenshots[activeIndex].caption}
                width={1600}
                height={1000}
                // 65vh left no room for the controls above and below once the
                // page was zoomed; the panel scrolls now, and the image gives
                // up height first so the controls stay reachable.
                className="w-full h-auto object-contain max-h-[50vh] md:max-h-[65vh]"
                priority
              />
            </div>

            {/* Visible text is the accessible name on all three controls, so
                voice control matches what a user can actually read. */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={prev}
                className="min-h-touch font-mono text-meta text-text-subtle hover:text-cream border border-edge hover:border-edge-strong px-3 py-1.5 rounded transition-colors"
              >
                ← {t('gallery_prev')}
              </button>

              <span className="font-mono text-meta text-text-subtle text-center">
                {screenshots[activeIndex].caption}
              </span>

              <button
                onClick={next}
                className="min-h-touch font-mono text-meta text-text-subtle hover:text-cream border border-edge hover:border-edge-strong px-3 py-1.5 rounded transition-colors"
              >
                {t('gallery_next')} →
              </button>
            </div>

            <p className="font-mono text-meta text-text-subtle text-center -mt-1">
              {t('gallery_hint')}
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
