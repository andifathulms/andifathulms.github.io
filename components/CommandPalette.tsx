'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import TrackMark from './TrackMark';
import type { Track } from '@/lib/project';

export interface PaletteProject {
  slug: string;
  title: string;
  tagline: string;
  track: Track;
  /** Stack, skills and tags, lower-cased and joined, for matching only. */
  terms: string;
}

interface Item {
  key: string;
  href: string;
  title: string;
  subtitle?: string;
  track?: Track;
  group: 'pages' | 'projects';
}

function rank(p: PaletteProject, term: string): number {
  const startsWord = (text: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}`, 'iu').test(text);
  if (startsWord(p.title)) return 0;
  if (p.title.toLowerCase().includes(term)) return 1;
  if (startsWord(p.tagline) || startsWord(p.terms)) return 2;
  return 3;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ⌘K / Ctrl K search across every project and page. A native <dialog> opened
 * with showModal(), so focus containment, Escape and the inert background come
 * from the browser rather than from hand-rolled traps.
 */
export default function CommandPalette({
  projects,
  pages,
}: {
  projects: PaletteProject[];
  pages: { href: string; label: string }[];
}) {
  const t = useTranslations('palette');
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  // Platform only affects the hint label; the shortcut accepts both keys.
  // The server snapshot assumes Mac so the prerendered label is stable.
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true
  );

  const open = useCallback(() => {
    setQuery('');
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const pageItems: Item[] = pages
      .filter((p) => terms.every((term) => p.label.toLowerCase().includes(term)))
      .map((p) => ({ key: p.href, href: p.href, title: p.label, group: 'pages' }));
    const projectItems: Item[] = projects
      .filter((p) => {
        const haystack = `${p.title} ${p.tagline} ${p.terms}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      // Title before tagline, and the start of a word before the middle of
      // one: "rain" should find Pola Hujan's "rainfall" before Cubiq's
      // "trainer".
      .map((p) => ({ p, score: terms.reduce((sum, term) => sum + rank(p, term), 0) }))
      .sort((a, b) => a.score - b.score)
      .map(({ p }) => p)
      .slice(0, 12)
      .map((p) => ({
        key: p.slug,
        href: `/work/${p.slug}`,
        title: p.title,
        subtitle: p.tagline,
        track: p.track,
        group: 'projects',
      }));
    return query ? [...projectItems, ...pageItems] : [...pageItems, ...projectItems];
  }, [query, pages, projects]);

  const go = (item: Item) => {
    dialog.current?.close();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault();
      go(items[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`palette-item-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup: Item['group'] | null = null;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t('open')}
        className="inline-flex h-9 items-center gap-2 rounded-control border border-line-strong px-2.5 text-sm text-text-muted transition-colors hover:border-edge-strong hover:text-cream"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <kbd className="hidden font-mono text-xs text-text-subtle lg:inline">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label={t('open')}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === dialog.current) dialog.current.close();
        }}
        className="m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] max-w-none rounded-media border border-line-strong bg-deck p-0 text-cream backdrop:bg-navy/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 text-text-subtle">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `palette-item-${active}` : undefined}
            aria-label={t('open')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t('placeholder', { count: projects.length })}
            autoComplete="off"
            className="h-14 w-full bg-transparent text-body text-cream placeholder:text-text-subtle focus:outline-none"
          />
        </div>

        <ul id="palette-list" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-6 text-center text-text-muted">{t('no_results')}</li>}
          {items.map((item, i) => {
            const header = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <li key={item.key} role="presentation">
                {header && (
                  <p className="px-3 pb-1.5 pt-3 font-mono text-xs uppercase tracking-widest text-text-subtle">
                    {t(item.group)}
                  </p>
                )}
                <div
                  id={`palette-item-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 ${
                    i === active ? 'bg-deck-2' : ''
                  }`}
                >
                  {item.track && <TrackMark track={item.track} />}
                  <span className="min-w-0 flex-1">
                    <span className={`block ${i === active ? 'text-gold' : 'text-cream'}`}>{item.title}</span>
                    {item.subtitle && <span className="block truncate text-sm text-text-muted">{item.subtitle}</span>}
                  </span>
                  {i === active && (
                    <span aria-hidden="true" className="text-gold">
                      ↵
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-line px-4 py-2.5 text-xs text-text-subtle">{t('hint')}</p>
      </dialog>
    </>
  );
}
