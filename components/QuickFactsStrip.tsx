import { useTranslations } from 'next-intl';
import type { ProjectMeta } from '@/lib/content';
import TechStackChips from './TechStackChips';

interface QuickFactsStripProps {
  project: ProjectMeta;
}

export default function QuickFactsStrip({ project }: QuickFactsStripProps) {
  const t = useTranslations('case_study');
  const isPrivate = project.status === 'private';

  return (
    <div className="border-y border-gold/20 py-6 my-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Role */}
        {project.role && (
          <div>
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              {t('role')}
            </p>
            <p className="text-sm text-cream">{project.role}</p>
          </div>
        )}

        {/* Timeframe */}
        {project.timeframe && (
          <div>
            <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-1.5">
              {t('timeframe')}
            </p>
            <p className="font-mono text-sm text-cream">{project.timeframe}</p>
          </div>
        )}

        {/* Stack */}
        <div className="col-span-2">
          <p className="font-mono text-xs text-gold/60 uppercase tracking-wider mb-1.5">
            {t('stack')}
          </p>
          <TechStackChips stack={project.techStack} maxVisible={6} size="md" />
        </div>
      </div>

      {/* Action links or private badge */}
      <div className="mt-5 pt-5 border-t border-gold/10 flex flex-wrap gap-3">
        {isPrivate ? (
          <span className="font-mono text-xs text-cream/40 border border-cream/10 px-3 py-1.5 rounded">
            {t('private_badge')}
          </span>
        ) : (
          <>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-gold border border-gold/30 px-3 py-1.5 rounded hover:border-gold/60 transition-colors"
              >
                {t('view_live')} ↗
              </a>
            )}
            {Array.isArray(project.githubUrl)
              ? project.githubUrl.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-cream/60 border border-cream/20 px-3 py-1.5 rounded hover:border-cream/40 transition-colors"
                  >
                    {t('view_github')} {project.githubUrl!.length > 1 ? `(${i + 1})` : ''} ↗
                  </a>
                ))
              : project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-cream/60 border border-cream/20 px-3 py-1.5 rounded hover:border-cream/40 transition-colors"
                  >
                    {t('view_github')} ↗
                  </a>
                )}
          </>
        )}
      </div>
    </div>
  );
}
