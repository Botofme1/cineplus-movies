import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Media } from '@/types';
import { MediaCard, MediaCardSkeleton } from './MediaCard';

interface MediaRowProps {
  title: string;
  items: Media[];
  loading?: boolean;
  onPlay: (media: Media) => void;
  onInfo: (media: Media) => void;
}

export function MediaRow({ title, items, loading, onPlay, onInfo }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="rounded-full bg-white/5 hover:bg-white/15 p-1.5 text-neutral-300 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-full bg-white/5 hover:bg-white/15 p-1.5 text-neutral-300 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)
          : items.map((media, i) => (
              <MediaCard key={`${media.type}-${media.id}`} media={media} onPlay={onPlay} onInfo={onInfo} index={i} />
            ))}
      </div>
    </section>
  );
}
