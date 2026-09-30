import type { Media } from '@/types';
import { img as tmdbImg } from '@/lib/tmdb';

export function getPosterUrl(media: Media, size: 'w200' | 'w300' | 'w500' = 'w300'): string {
  if (media.type === 'anime') {
    return media.posterPath || '';
  }
  return tmdbImg(media.posterPath, size);
}

export function getBackdropUrl(media: Media, size: 'w780' | 'original' = 'w780'): string {
  if (media.type === 'anime') {
    return media.backdropPath || media.posterPath || '';
  }
  return tmdbImg(media.backdropPath, size);
}
