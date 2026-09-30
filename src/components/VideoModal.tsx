import { useState, useEffect } from 'react';
import { X, ExternalLink, Search, AlertCircle, RefreshCw, List, ChevronDown } from 'lucide-react';
import type { Media, VideoModalData } from '@/types';
import { getStreamLinks } from '@/lib/streamLinks';
import { useLockBodyScroll } from './MediaCard';

interface VideoModalProps {
  data: VideoModalData;
  onClose: () => void;
}

export function VideoModal({ data, onClose }: VideoModalProps) {
  const { media } = data;
  const [season, setSeason] = useState(data.season || 1);
  const [episode, setEpisode] = useState(data.episode || 1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isSeries = media.tmdbType === 'tv';
  const { sources, fallbacks } = getStreamLinks(media, season, episode);
  const [sourceIdx, setSourceIdx] = useState(0);
  const currentSource = sources[sourceIdx];

  useLockBodyScroll(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Reset to first source and reload when season/episode changes
  useEffect(() => {
    setSourceIdx(0);
    setReloadKey(k => k + 1);
  }, [season, episode]);

  const handleSourceChange = (idx: number) => {
    setSourceIdx(idx);
    setSourceDropdownOpen(false);
    setReloadKey(k => k + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-white font-semibold text-sm md:text-base truncate">
            {media.title}
            {isSeries && <span className="text-neutral-400 font-normal ml-2">S{season} E{episode}</span>}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isSeries && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 transition-colors"
            >
              <List size={16} /> <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Source switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 transition-colors"
            >
              <span className="hidden sm:inline">{currentSource?.label}</span>
              <span className="sm:hidden">Source</span>
              <ChevronDown size={14} />
            </button>
            {sourceDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-neutral-900 border border-white/10 shadow-xl overflow-hidden z-10">
                {sources.map((src, i) => (
                  <button
                    key={src.id}
                    onClick={() => handleSourceChange(i)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      i === sourceIdx
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="rounded-lg bg-white/10 hover:bg-white/20 text-white p-2 transition-colors"
            aria-label="Reload player"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/20 text-white p-2 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Player + sidebar */}
      <div className="flex-1 flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 relative bg-black">
          <iframe
            key={`${reloadKey}-${sourceIdx}`}
            src={currentSource?.url}
            title={media.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            referrerPolicy="origin"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          />

          {/* Fallback bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-amber-400/90 text-xs font-medium mr-1">
                <AlertCircle size={14} /> Not playing? Switch source or try:
              </span>
              {fallbacks.map((fb) => (
                <a
                  key={fb.label}
                  href={fb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                >
                  {fb.icon === 'search' ? <Search size={12} /> : <ExternalLink size={12} />}
                  {fb.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Episode sidebar */}
        {isSeries && showSidebar && (
          <div className="w-72 bg-neutral-950 border-l border-white/10 overflow-y-auto flex-shrink-0 animate-fade-in hidden md:block">
            <SeasonEpisodePicker
              media={media}
              season={season}
              episode={episode}
              onSeasonChange={setSeason}
              onEpisodeChange={(ep) => { setEpisode(ep); setShowSidebar(false); }}
            />
          </div>
        )}
      </div>

      {/* Mobile episode picker */}
      {isSeries && showSidebar && (
        <div className="md:hidden bg-neutral-950 border-t border-white/10 max-h-[40vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <SeasonEpisodePicker
            media={media}
            season={season}
            episode={episode}
            onSeasonChange={setSeason}
            onEpisodeChange={(ep) => { setEpisode(ep); setShowSidebar(false); }}
          />
        </div>
      )}
    </div>
  );
}

function SeasonEpisodePicker({
  media,
  season,
  episode,
  onSeasonChange,
  onEpisodeChange,
}: {
  media: Media;
  season: number;
  episode: number;
  onSeasonChange: (s: number) => void;
  onEpisodeChange: (e: number) => void;
}) {
  const seasonCount = Math.min(media.seasons || 1, 30);
  const [episodeCount, setEpisodeCount] = useState(24);

  return (
    <div className="p-4">
      <div className="mb-3">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1.5 block">Season</label>
        <select
          value={season}
          onChange={(e) => { onSeasonChange(Number(e.target.value)); }}
          className="w-full rounded-lg bg-white/10 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          {Array.from({ length: seasonCount }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s} className="bg-neutral-900">Season {s}</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1.5 block">Episodes</label>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
            <button
              key={ep}
              onClick={() => onEpisodeChange(ep)}
              className={`rounded-lg text-sm font-medium py-2 transition-colors ${
                episode === ep
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/15'
              }`}
            >
              {ep}
            </button>
          ))}
        </div>
        {episodeCount < 100 && (
          <button
            onClick={() => setEpisodeCount(c => Math.min(c + 24, 100))}
            className="w-full mt-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 text-xs font-medium py-2 transition-colors"
          >
            Show more episodes
          </button>
        )}
      </div>
    </div>
  );
}
