import { Play, Info, Star } from 'lucide-react';
import type { Media } from '@/types';
import { getBackdropUrl } from '@/lib/images';

interface HeroProps {
  media: Media;
  onPlay: (media: Media) => void;
  onInfo: (media: Media) => void;
}

export function Hero({ media, onPlay, onInfo }: HeroProps) {
  const backdrop = getBackdropUrl(media, 'original');

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[750px] w-full overflow-hidden">
      {backdrop && (
        <img
          src={backdrop}
          alt={media.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-990 via-neutral-950/70 to-transparent" style={{ background: 'linear-gradient(to right, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.7) 40%, transparent 100%)' }} />

      <div className="relative h-full flex items-end pb-12 md:pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-md bg-primary-600 text-white text-xs font-bold uppercase tracking-wider px-2 py-1">
              Featured
            </span>
            {media.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{media.rating.toFixed(1)}</span>
              </div>
            )}
            {media.year && (
              <span className="text-neutral-400 text-sm">{media.year}</span>
            )}
            {media.genres && media.genres.length > 0 && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 text-sm">{media.genres.slice(0, 3).join(', ')}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">
            {media.title}
          </h1>

          <p className="text-neutral-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6 line-clamp-3 max-w-xl">
            {media.overview || 'No description available.'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlay(media)}
              className="flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30"
            >
              <Play size={20} className="fill-white" /> Play Now
            </button>
            <button
              onClick={() => onInfo(media)}
              className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 transition-all duration-200 border border-white/10"
            >
              <Info size={20} /> More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
