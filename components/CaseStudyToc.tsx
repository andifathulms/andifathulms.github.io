'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/content';

/**
 * Sticky table of contents for case-study pages, with scroll-spy highlighting
 * of the section currently in view.
 */
export default function CaseStudyToc({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className="font-mono text-meta text-accent uppercase tracking-wider mb-4">{label}</p>
      <ul className="border-l border-gold/15">
        {items.map((item) => {
          const isActive = active === item.slug;
          return (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                className={`-ml-px block border-l py-1 text-sm transition-colors ${
                  item.level === 3 ? 'pl-6' : 'pl-3'
                } ${
                  isActive
                    ? 'border-gold text-gold'
                    : 'border-transparent text-text-subtle hover:text-text-muted'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
