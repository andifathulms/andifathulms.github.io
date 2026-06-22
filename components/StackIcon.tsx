import * as si from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

// Maps display names used in meta.json / about page to simple-icons export keys
const SLUG_MAP: Record<string, keyof typeof si> = {
  'Next.js': 'siNextdotjs',
  'TypeScript': 'siTypescript',
  'React': 'siReact',
  'PostgreSQL': 'siPostgresql',
  'Tailwind CSS': 'siTailwindcss',
  'Node.js': 'siNodedotjs',
  'Python': 'siPython',
  'Docker': 'siDocker',
  'Railway': 'siRailway',
  'Vercel': 'siVercel',
  'Django': 'siDjango',
  'Redis': 'siRedis',
  'Keycloak': 'siKeycloak',
  'MinIO': 'siMinio',
  'Celery': 'siCelery',
  'Figma': 'siFigma',
};

interface Props {
  name: string;
  className?: string;
}

export default function StackIcon({ name, className = 'w-5 h-5' }: Props) {
  const key = SLUG_MAP[name];
  if (!key) return null;

  const icon = si[key] as SimpleIcon | undefined;
  if (!icon) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-label={name}
    >
      <path d={icon.path} />
    </svg>
  );
}
