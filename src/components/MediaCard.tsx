import { useEffect } from 'react';
import { Star, Play, Info } from 'lucide-react';
import type { Media } from '@/types';
import { getPosterUrl } from '@/lib/images';

interface MediaCardProps {
  media: Media;
  onPlay: (media: Media) => void;
  onInfo: (media: Media) => void;
  index?: number;
}

export function MediaCard({ media, onPlay, onInfo, index = 0 }: MediaCardProps) {
  const posterUrl = getPosterUrl(media);
  const year = media.year || '—';
  const rating = media.rating?.toFixed(1) ?? null;

  return (
    <div
      className="group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] cursor-pointer transition-all duration-300 hover:z-20"
      style={{ animation: `fade-in-up 0.4s ease-out ${Math.min(index * 40, 400)}ms both` }}
      onClick={() => onInfo(media)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary-500/20 ring-1 ring-white/5 group-hover:ring-primary-500/40">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={media.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Play size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          {rating ?? 'NR'}
        </div>

        <div className="absolute top-2 right-2 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-neutral-300 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {media.type === 'tv' ? 'Series' : media.type}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-sm font-semibold text-white line-clamp-1 mb-0.5">{media.title}</p>
          <p className="text-[11px] text-neutral-400 mb-2">{year}</p>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onPlay(media); }}
              className="flex-1 flex items-center justify-center gap-1 rounded-md bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold py-1.5 transition-colors"
            >
              <Play size={12} className="fill-white" /> Play
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onInfo(media); }}
              className="flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white py-1.5 px-2 transition-colors"
            >
              <Info size={12} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium text-neutral-300 line-clamp-1 group-hover:text-white transition-colors">
        {media.title}
      </p>
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
      <div className="aspect-[2/3] rounded-xl skeleton" />
      <div className="mt-2 h-4 w-3/4 rounded skeleton" />
    </div>
  );
}

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [locked]);
}
