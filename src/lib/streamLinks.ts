import type { Media } from '@/types';

export interface EmbedSource {
  id: string;
  label: string;
  url: string;
}

/**
 * Builds all available embed sources and fallback links for a given media item.
 */
export function getStreamLinks(media: Media, season?: number, episode?: number): {
  sources: EmbedSource[];
  fallbacks: { label: string; url: string; icon: 'external' | 'search' }[];
} {
  const searchTitle = encodeURIComponent(media.title);
  const s = season || 1;
  const e = episode || 1;
  const isMovie = media.tmdbType === 'movie';

  const sources: EmbedSource[] = [
    {
      id: 'vidsrc-me',
      label: 'VidSrc.me',
      url: isMovie
        ? `https://vidsrc.me/embed/movie/${media.id}`
        : `https://vidsrc.me/embed/tv/${media.id}/${s}/${e}`,
    },
    {
      id: 'vidbinge',
      label: 'VidBinge',
      url: isMovie
        ? `https://vidbinge.dev/embed/movie/${media.id}`
        : `https://vidbinge.dev/embed/tv/${media.id}/${s}/${e}`,
    },
    {
      id: '2embed',
      label: '2Embed',
      url: isMovie
        ? `https://www.2embed.cc/embed/${media.id}`
        : `https://www.2embed.cc/embedtv/${media.id}&s=${s}&e=${e}`,
    },
    {
      id: 'multiembed',
      label: 'MultiEmbed',
      url: isMovie
        ? `https://multiembed.mov/?video_id=${media.id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${media.id}&tmdb=1&s=${s}&e=${e}`,
    },
  ];

  const fallbacks: { label: string; url: string; icon: 'external' | 'search' }[] = [
    { label: 'EgyBest', url: `https://egy.best/search/${searchTitle}/`, icon: 'external' },
    { label: 'Search Web', url: `https://www.google.com/search?q=${searchTitle}+watch+online+free`, icon: 'search' },
  ];

  return { sources, fallbacks };
}
