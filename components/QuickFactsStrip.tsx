import { useTranslations } from 'next-intl';
import type { ProjectMeta } from '@/lib/content';
import TechStackChips from './TechStackChips';

interface QuickFactsStripProps {
  project: ProjectMeta;
  /** Optional trailing control, pinned to the right end of the action row. */
  action?: React.ReactNode;
}

export default function QuickFactsStrip({ project, action }: QuickFactsStripProps) {
  const t = useTranslations('case_study');
  const isPrivate = project.status === 'private';
  // Access badge only makes sense when there's a public URL to click through to.
  const accessBadge =
    project.liveUrl && project.access && project.access !== 'public' ? project.access : null;

  return (
    <div className="border-y border-line py-6 my-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Role */}
        {project.role && (
          <div>
            <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
              {t('role')}
            </p>
            <p className="text-sm text-cream">{project.role}</p>
          </div>
        )}

        {/* Timeframe */}
        {project.timeframe && (
          <div>
            <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
              {t('timeframe')}
            </p>
            <p className="font-mono text-sm text-cream">{project.timeframe}</p>
          </div>
        )}

        {/* Stack */}
        <div className="col-span-2">
          <p className="font-mono text-meta text-accent uppercase tracking-wider mb-1.5">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={6} size="md" />
        </div>
      </div>

      {/* Action links or private badge */}
      <div className="mt-5 pt-5 border-t border-line flex flex-wrap items-center gap-3">
        {isPrivate ? (
          <span className="font-mono text-meta text-text-subtle border border-cream/10 px-3 py-1.5 rounded">
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
                  title="Staging environment — not the production URL"
                  className="font-mono text-meta text-accent-2 border border-clay/40 px-3 py-1.5 rounded hover:border-clay/70 transition-colors inline-flex items-center gap-1.5"
                >
                  {t('view_staging')} ↗
                  <span className="text-meta uppercase tracking-wider text-accent-2 border-l border-clay/30 pl-1.5">
                    Staging
                  </span>
                </a>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-meta font-medium bg-gold text-navy px-3.5 py-1.5 rounded hover:bg-gold/90 transition-colors inline-flex items-center gap-1.5"
                >
                  {t('view_live')} ↗
                </a>
              ))}
            {accessBadge === 'internal' && (
              <span
                title={t('access_internal_hint')}
                className="font-mono text-meta text-text-subtle border border-cream/15 px-3 py-1.5 rounded inline-flex items-center gap-1.5"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {t('access_internal')}
              </span>
            )}
            {accessBadge === 'registration' && (
              <span
                title={t('access_registration_hint')}
                className="font-mono text-meta text-accent border border-gold/25 px-3 py-1.5 rounded inline-flex items-center gap-1.5"
              >
                {t('access_registration')}
              </span>
            )}
            {Array.isArray(project.githubUrl)
              ? project.githubUrl.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-meta text-text-muted border border-cream/20 px-3 py-1.5 rounded hover:border-cream/40 transition-colors"
                  >
                    {t('view_github')} {project.githubUrl!.length > 1 ? `(${i + 1})` : ''} ↗
                  </a>
                ))
              : project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-meta text-text-muted border border-cream/20 px-3 py-1.5 rounded hover:border-cream/40 transition-colors"
                  >
                    {t('view_github')} ↗
                  </a>
                )}
          </>
        )}

        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
}
