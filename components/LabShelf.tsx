'use client';

import { useId, useRef, useState } from 'react';
import type { ProjectMeta } from '@/lib/content';
import ProjectCard, { type ProjectCardLabels } from './ProjectCard';

export interface ShelfGroup {
  key: string;
  label: string;
  /** Singular type label for the cards in this group. */
  typeLabel: string;
  projects: ProjectMeta[];
}

/**
 * The home page's window into the lab: one tab per problem type, four cards
 * per tab. A tablist rather than filter chips because exactly one panel is
 * shown at a time. Arrow keys move between tabs (WAI-ARIA tabs pattern).
 */
export default function LabShelf({
  groups,
  labels,
  tabsLabel,
}: {
  groups: ShelfGroup[];
  labels: Omit<ProjectCardLabels, 'type'>;
  tabsLabel: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + groups.length) % groups.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const group = groups[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label={tabsLabel}
        onKeyDown={onKeyDown}
        className="mb-8 flex flex-wrap gap-2"
      >
        {groups.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`inline-flex min-h-touch items-center gap-2 rounded-control border px-4 text-sm transition-colors ${
                selected
                  ? 'border-cream bg-cream text-navy'
                  : 'border-line-strong text-text-muted hover:border-edge-strong hover:text-cream'
              }`}
            >
              {g.label}
              <span className={`font-mono text-xs ${selected ? 'text-navy/70' : 'text-text-subtle'}`}>
                {g.projects.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {group.projects.slice(0, 4).map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            labels={{ ...labels, type: group.typeLabel }}
          />
        ))}
      </div>
    </div>
  );
}
