'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts up from 0 to `end` once, the first time it scrolls into view.
 * Honors prefers-reduced-motion by rendering the final value immediately.
 */
export default function CountUp({ end, duration = 1200 }: { end: number; duration?: number }) {
  // Start at the real value so SSR / no-JS / reduced-motion show it correctly.
  const [value, setValue] = useState(end);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Reset to 0, then count up when scrolled into view. The band sits below the
    // hero, so on most viewports this reset happens off-screen (no flash).
    setValue(0);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
              setValue(Math.round(eased * end));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value}</span>;
}
