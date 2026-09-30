import type { Media } from '@/types';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

async function jikanFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const url = new URL(`${JIKAN_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Jikan ${res.status}`);
  return res.json();
}

function mapAnime(m: any): Media {
  return {
    id: m.mal_id,
    title: m.title_english || m.title || m.title_japanese || 'Unknown',
    overview: m.synopsis || '',
    posterPath: m.images?.jpg?.large_image_url || m.images?.webp?.large_image_url || null,
    backdropPath: m.images?.jpg?.large_image_url || m.images?.webp?.large_image_url || null,
    year: (m.aired?.from || '').slice(0, 4) || null,
    rating: m.score != null ? Math.round(m.score * 10) / 10 : null,
    type: 'anime',
    tmdbType: 'tv',
    malId: m.mal_id,
    seasons: undefined,
    genres: (m.genres || []).map((g: any) => g.name),
  };
}

/** For anime, posterPath holds the Jikan image URL directly (not a TMDB path) */
export function getAnimeImageUrl(media: Media, size: 'small' | 'medium' | 'large' = 'large'): string {
  if (media.posterPath) return media.posterPath;
  return '';
}

export async function getTopAnime(page = 1): Promise<Media[]> {
  const data = await jikanFetch('/top/anime', {
    page,
    filter: 'bypopularity',
    limit: 24,
  });
  return (data.data || []).map(mapAnime);
}

export async function getSeasonalAnime(): Promise<Media[]> {
  const now = new Date();
  const seasons = ['winter', 'spring', 'summer', 'fall'];
  const month = now.getMonth();
  const season = seasons[Math.floor(month / 3)];
  const year = now.getFullYear();
  const data = await jikanFetch(`/seasons/${year}/${season}`, { limit: 24 });
  return (data.data || []).map(mapAnime);
}

export async function getUpcomingAnime(): Promise<Media[]> {
  const data = await jikanFetch('/seasons/upcoming', { limit: 24 });
  return (data.data || []).map(mapAnime);
}

export async function searchAnime(query: string, page = 1): Promise<Media[]> {
  if (!query.trim()) return [];
  const data = await jikanFetch('/anime', {
    q: query,
    page,
    limit: 24,
    sfw: 'true',
    order_by: 'popularity',
  });
  return (data.data || []).map(mapAnime);
}
