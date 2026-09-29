import { useTranslations } from 'next-intl';
import type { ProjectMeta } from '@/lib/content';

/**
 * The 30-second version of a case study, beside the hero screenshot: who it's
 * for, my role, when, what came of it, the skills it shows, and where to see
 * it. Built from meta.json, so it's in the page's language via the id block.
 */
export default function AtAGlance({ project }: { project: ProjectMeta }) {
  const t = useTranslations('case_study');
  const isPrivate = project.status === 'private';
  // Access badge only makes sense when there's a public URL to click through to.
  const accessBadge =
    project.liveUrl && project.access && project.access !== 'public' ? project.access : null;

  const rows = [
    { label: t('for'), value: project.glance?.for },
    { label: t('role'), value: project.role },
    { label: t('timeframe'), value: project.timeframe, mono: true },
    { label: t('result'), value: project.glance?.result },
  ].filter((r) => r.value);

  return (
    <aside className="rounded-media border border-line-strong bg-deck p-5 sm:p-6" aria-label={t('at_a_glance')}>
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-gold">{t('at_a_glance')}</p>
      <dl className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-3 text-[0.9375rem]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="pt-px text-sm text-text-subtle">{r.label}</dt>
            <dd className={`text-cream ${r.mono ? 'font-mono text-sm' : ''}`}>{r.value}</dd>
          </div>
        ))}
        {project.skills && project.skills.length > 0 && (
          <div className="contents">
            <dt className="pt-1 text-sm text-text-subtle">{t('skills')}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {project.skills.map((s) => (
                <span key={s} className="rounded bg-deck-2 px-2 py-1 text-[0.8125rem] text-cream">
                  {s}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* Action links or private badge */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5">
        {isPrivate ? (
          <span className="inline-flex min-h-touch items-center gap-1.5 px-1 text-sm text-text-subtle">
            {t('private_badge')}
          </span>
        ) : (
          <>
            {project.liveUrl &&
              (project.liveIsStaging ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-2 border border-line-strong min-h-touch inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control hover:border-edge-strong transition-colors"
                >
                  {t('view_staging')} ↗
                  {/* The caveat used to live only in a `title`, which is
                      unavailable on touch and unreliable for screen readers.
                      It's in the accessible name now, and visible on the
                      badge — the hardcoded English "Staging" is gone too. */}
                  <span className="text-meta uppercase tracking-wider text-accent-2 border-l border-line-muted pl-1.5">
                    {t('staging_badge')}
                  </span>
                  <span className="sr-only">{t('staging_hint')}</span>
                </a>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  // min-h-touch to match its neighbours: every other control
                  // in this row got it in the touch-target pass, so the gold
                  // primary was the one button sitting short.
                  className="text-sm font-medium bg-gold text-navy min-h-touch inline-flex items-center gap-1.5 px-4 py-2 rounded-control hover:bg-gold/90 transition-colors"
                >
                  {t('view_live')} ↗
                </a>
              ))}
            {accessBadge === 'internal' && (
              <span className="inline-flex min-h-touch items-center gap-1.5 px-1 text-sm text-text-subtle">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {t('access_internal')}
                <span className="sr-only">— {t('access_internal_hint')}</span>
              </span>
            )}
            {accessBadge === 'registration' && (
              <span className="inline-flex min-h-touch items-center gap-1.5 px-1 text-sm text-text-muted">
                {t('access_registration')}
                <span className="sr-only">— {t('access_registration_hint')}</span>
              </span>
            )}
            {Array.isArray(project.githubUrl)
              ? project.githubUrl.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-muted border border-edge min-h-touch inline-flex items-center px-3 py-1.5 rounded-control hover:border-edge-strong transition-colors"
                  >
                    {t('view_github')} {project.githubUrl!.length > 1 ? `(${i + 1})` : ''} ↗
                  </a>
                ))
              : project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-muted border border-edge min-h-touch inline-flex items-center px-3 py-1.5 rounded-control hover:border-edge-strong transition-colors"
                  >
                    {t('view_github')} ↗
                  </a>
                )}
          </>
        )}

      </div>
    </aside>
  );
}
