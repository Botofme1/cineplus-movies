export type MediaType = 'movie' | 'tv' | 'anime';

export interface Media {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string | null;
  rating: number | null;
  type: MediaType;
  /** TMDB media_type for API requests */
  tmdbType: 'movie' | 'tv';
  /** anime-only: mal id for Jikan */
  malId?: number;
  /** for TV/anime series, total number of seasons */
  seasons?: number;
  /** genre name list */
  genres?: string[];
}

export interface VideoModalData {
  media: Media;
  season?: number;
  episode?: number;
}

export interface GenreOption {
  id: number;
  name: string;
}
