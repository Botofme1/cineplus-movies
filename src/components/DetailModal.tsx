import { useEffect, useState } from 'react';
import { X, Play, Star, Calendar, Tv, Film, Sparkles } from 'lucide-react';
import type { Media } from '@/types';
import { getPosterUrl, getBackdropUrl } from '@/lib/images';
import { getMovieDetails, getTvDetails } from '@/lib/tmdb';
import { useLockBodyScroll } from './MediaCard';

interface DetailModalProps {
  media: Media;
  onPlay: (media: Media) => void;
  onClose: () => void;
}

export function DetailModal({ media, onPlay, onClose }: DetailModalProps) {
  const [details, setDetails] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  useLockBodyScroll(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    // For anime, we already have all the info from Jikan
    if (media.type === 'anime') {
      setDetails(media);
      setLoading(false);
      return;
    }
    // For TMDB, fetch full details for genres etc
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const d = media.tmdbType === 'movie' ? await getMovieDetails(media.id) : await getTvDetails(media.id);
        if (!cancelled) {
          setDetails({ ...d, type: media.type });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDetails(media);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [media]);

  const display = details || media;
  const posterUrl = getPosterUrl(display, 'w300');
  const backdropUrl = getBackdropUrl(display, 'w780');
  const typeIcon = display.type === 'movie' ? Film : display.type === 'tv' ? Tv : Sparkles;
  const TypeIcon = typeIcon;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-neutral-900 ring-1 ring-white/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          {backdropUrl && (
            <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-black/60 hover:bg-black/80 text-white p-2 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="relative px-4 md:px-6 pb-6 -mt-20 md:-mt-24">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Poster */}
            <div className="flex-shrink-0 w-28 md:w-40 -mt-8 md:-mt-12 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/10 bg-zinc-800 shadow-2xl">
                {posterUrl ? (
                  <img src={posterUrl} alt={display.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Film size={32} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 md:pt-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 rounded-md bg-white/10 text-neutral-300 text-xs font-medium px-2 py-1 uppercase tracking-wide">
                  <TypeIcon size={12} />
                  {display.type === 'tv' ? 'Series' : display.type}
                </span>
                {display.rating && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{display.rating.toFixed(1)}</span>
                  </div>
                )}
                {display.year && (
                  <span className="flex items-center gap-1 text-neutral-400 text-sm">
                    <Calendar size={12} />
                    {display.year}
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
                {display.title}
              </h2>

              {display.genres && display.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {display.genres.slice(0, 5).map((g: string) => (
                    <span key={g} className="rounded-full bg-white/5 text-neutral-400 text-xs px-2.5 py-1">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 mb-4">
                {display.overview || 'No description available.'}
              </p>

              <button
                onClick={() => onPlay(display)}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 transition-all duration-200 hover:scale-105"
              >
                <Play size={18} className="fill-white" /> Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
