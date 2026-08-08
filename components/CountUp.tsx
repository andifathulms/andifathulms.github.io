'use client';

import { useEffect, useRef } from 'react';

/**
 * Counts up from 0 to `end` once, the first time it scrolls into view.
 * Honors prefers-reduced-motion by leaving the final value in place.
 *
 * The animation writes textContent directly rather than calling setState per
 * frame. The previous version re-rendered on every animation frame — roughly
 * 72 React renders per instance, and the home page mounts four of them inside
 * <Link> subtrees, so ~288 renders landed in the first 1.2s of the page's life,
 * which is exactly when the user is trying to read it. The rendered markup is
 * identical; only the mechanism changed.
 */
export default function CountUp({ end, duration = 1200 }: { end: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let done = false;
    el.textContent = '0';

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || done) continue;
          done = true;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            el.textContent = String(Math.round(eased * end));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      // Leave the true value behind if we unmount mid-animation.
      el.textContent = String(end);
    };
  }, [end, duration]);

  // Server-rendered with the real value, so no-JS and reduced-motion users —
  // and any crawler — see the number without waiting for the effect.
  return <span ref={ref}>{end}</span>;
}
