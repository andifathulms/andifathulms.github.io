import type { Track } from '@/lib/project';

/**
 * The small square that says which track a project belongs to: clay for
 * government work, lagoon for the independent lab. A marker, never a fill
 * (DESIGN.md, the Track Rule).
 */
export default function TrackMark({ track, className = '' }: { track: Track; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 flex-shrink-0 rounded-[2px] ${
        track === 'government' ? 'bg-clay' : 'bg-lagoon'
      } ${className}`}
    />
  );
}
