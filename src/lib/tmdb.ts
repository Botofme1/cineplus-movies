import type { Media, GenreOption } from '@/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function tmdbFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export function img(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '';
  return `${TMDB_IMG}/${size}${path}`;
}

function mapMovie(m: any): Media {
  return {
    id: m.id,
    title: m.title || m.name || 'Unknown',
    overview: m.overview || '',
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    year: (m.release_date || m.first_air_date || '').slice(0, 4) || null,
    rating: m.vote_average != null ? Math.round(m.vote_average * 10) / 10 : null,
    type: 'movie',
    tmdbType: 'movie',
    seasons: m.number_of_seasons,
    genres: (m.genres || []).map((g: any) => g.name),
  };
}

function mapTv(m: any): Media {
  return {
    id: m.id,
    title: m.title || m.name || 'Unknown',
    overview: m.overview || '',
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    year: (m.release_date || m.first_air_date || '').slice(0, 4) || null,
    rating: m.vote_average != null ? Math.round(m.vote_average * 10) / 10 : null,
    type: 'tv',
    tmdbType: 'tv',
    seasons: m.number_of_seasons,
    genres: (m.genres || []).map((g: any) => g.name),
  };
}

export async function getTrending(window: 'day' | 'week' = 'week'): Promise<Media[]> {
  const data = await tmdbFetch('/trending/all/' + window);
  return (data.results || [])
    .filter((m: any) => m.media_type !== 'person' && (m.poster_path || m.backdrop_path))
    .map((m: any) => m.media_type === 'tv' ? mapTv(m) : mapMovie(m));
}

export async function getTrendingMovies(): Promise<Media[]> {
  const data = await tmdbFetch('/trending/movie/week');
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function getTrendingTv(): Promise<Media[]> {
  const data = await tmdbFetch('/trending/tv/week');
  return (data.results || []).filter((m: any) => m.poster_path).map(mapTv);
}

export async function getPopularMovies(page = 1): Promise<Media[]> {
  const data = await tmdbFetch('/movie/popular', { page });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function getPopularTv(page = 1): Promise<Media[]> {
  const data = await tmdbFetch('/tv/popular', { page });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapTv);
}

export async function getTopRatedMovies(page = 1): Promise<Media[]> {
  const data = await tmdbFetch('/movie/top_rated', { page });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function getTopRatedTv(page = 1): Promise<Media[]> {
  const data = await tmdbFetch('/tv/top_rated', { page });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapTv);
}

export async function getUpcomingMovies(): Promise<Media[]> {
  const data = await tmdbFetch('/movie/upcoming');
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function getNowPlaying(): Promise<Media[]> {
  const data = await tmdbFetch('/movie/now_playing');
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function discoverMovies(genreId?: number, page = 1): Promise<Media[]> {
  const params: Record<string, string | number> = {
    page,
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
  };
  if (genreId) params.with_genres = genreId;
  const data = await tmdbFetch('/discover/movie', params);
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function discoverTv(genreId?: number, page = 1): Promise<Media[]> {
  const params: Record<string, string | number> = {
    page,
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
  };
  if (genreId) params.with_genres = genreId;
  const data = await tmdbFetch('/discover/tv', params);
  return (data.results || []).filter((m: any) => m.poster_path).map(mapTv);
}

export async function getMovieDetails(id: number): Promise<Media> {
  const data = await tmdbFetch(`/movie/${id}`);
  return mapMovie(data);
}

export async function getTvDetails(id: number): Promise<Media> {
  const data = await tmdbFetch(`/tv/${id}`);
  return mapTv(data);
}

export async function getMovieGenres(): Promise<GenreOption[]> {
  const data = await tmdbFetch('/genre/movie/list');
  return data.genres || [];
}

export async function getTvGenres(): Promise<GenreOption[]> {
  const data = await tmdbFetch('/genre/tv/list');
  return data.genres || [];
}

export async function searchMulti(query: string, page = 1): Promise<Media[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch('/search/multi', { query, page, include_adult: 'false' });
  return (data.results || [])
    .filter((m: any) => m.media_type !== 'person' && (m.poster_path || m.backdrop_path))
    .map((m: any) => m.media_type === 'tv' ? mapTv(m) : mapMovie(m));
}

export async function searchMovies(query: string, page = 1): Promise<Media[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch('/search/movie', { query, page, include_adult: 'false' });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapMovie);
}

export async function searchTv(query: string, page = 1): Promise<Media[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch('/search/tv', { query, page, include_adult: 'false' });
  return (data.results || []).filter((m: any) => m.poster_path).map(mapTv);
}
