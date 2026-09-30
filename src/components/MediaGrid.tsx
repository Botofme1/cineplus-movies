import type { Media } from '@/types';
import { MediaCard, MediaCardSkeleton } from './MediaCard';

interface MediaGridProps {
  items: Media[];
  loading?: boolean;
  onPlay: (media: Media) => void;
  onInfo: (media: Media) => void;
  emptyMessage?: string;
}

export function MediaGrid({ items, loading, onPlay, onInfo, emptyMessage }: MediaGridProps) {
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-neutral-400 text-lg">{emptyMessage || 'No results found.'}</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 pb-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaCardSkeleton key={i} />)
          : items.map((media, i) => (
              <div
                key={`${media.type}-${media.id}`}
                style={{ animation: `fade-in-up 0.4s ease-out ${Math.min(i * 30, 300)}ms both` }}
              >
                <MediaCard media={media} onPlay={onPlay} onInfo={onInfo} index={i} />
              </div>
            ))}
      </div>
    </div>
  );
}
