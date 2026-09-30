import { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { Media, VideoModalData } from '@/types';
import { Navbar, type TabId } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { MediaRow } from '@/components/MediaRow';
import { MediaGrid } from '@/components/MediaGrid';
import { VideoModal } from '@/components/VideoModal';
import { DetailModal } from '@/components/DetailModal';
import * as tmdb from '@/lib/tmdb';
import * as jikan from '@/lib/jikan';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [searching, setSearching] = useState(false);
  const [videoModal, setVideoModal] = useState<VideoModalData | null>(null);
  const [detailMedia, setDetailMedia] = useState<Media | null>(null);

  // Home page data
  const [featured, setFeatured] = useState<Media | null>(null);
  const [trending, setTrending] = useState<Media[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularMoviesLoading, setPopularMoviesLoading] = useState(true);
  const [popularSeries, setPopularSeries] = useState<Media[]>([]);
  const [popularSeriesLoading, setPopularSeriesLoading] = useState(true);
  const [topAnime, setTopAnime] = useState<Media[]>([]);
  const [topAnimeLoading, setTopAnimeLoading] = useState(true);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedMoviesLoading, setTopRatedMoviesLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<Media[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Movies page
  const [moviesData, setMoviesData] = useState<Media[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [movieGenres, setMovieGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedMovieGenre, setSelectedMovieGenre] = useState<number | null>(null);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesHasMore, setMoviesHasMore] = useState(true);
  const [moviesLoadingMore, setMoviesLoadingMore] = useState(false);

  // Series page
  const [seriesData, setSeriesData] = useState<Media[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [tvGenres, setTvGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedTvGenre, setSelectedTvGenre] = useState<number | null>(null);
  const [seriesPage, setSeriesPage] = useState(1);
  const [seriesHasMore, setSeriesHasMore] = useState(true);
  const [seriesLoadingMore, setSeriesLoadingMore] = useState(false);

  // Anime page
  const [animeData, setAnimeData] = useState<Media[]>([]);
  const [animeLoading, setAnimeLoading] = useState(true);
  const [animeSeasonal, setAnimeSeasonal] = useState<Media[]>([]);
  const [animeSeasonalLoading, setAnimeSeasonalLoading] = useState(true);

  // Load home data
  useEffect(() => {
    let cancelled = false;
    async function loadHome() {
      try {
        const [trendingData, popMovies, popSeries, topAnimeData, topRated, upcomingData] = await Promise.all([
          tmdb.getTrending('week'),
          tmdb.getPopularMovies(),
          tmdb.getPopularTv(),
          jikan.getTopAnime().catch(() => []),
          tmdb.getTopRatedMovies(),
          tmdb.getUpcomingMovies(),
        ]);
        if (cancelled) return;
        setTrending(trendingData);
        // Featured: try to find Terrifier 3, fall back to first trending item
        const terrifier = trendingData.find(m => m.title.toLowerCase().includes('terrifier 3'));
        setFeatured(terrifier || trendingData[0] || popMovies[0] || null);
        setTrendingLoading(false);
        setPopularMovies(popMovies);
        setPopularMoviesLoading(false);
        setPopularSeries(popSeries);
        setPopularSeriesLoading(false);
        setTopAnime(topAnimeData);
        setTopAnimeLoading(false);
        setTopRatedMovies(topRated);
        setTopRatedMoviesLoading(false);
        setUpcoming(upcomingData);
        setUpcomingLoading(false);
      } catch (err) {
        console.error('Failed to load home data:', err);
        if (!cancelled) setTrendingLoading(false);
      }
    }
    loadHome();
    return () => { cancelled = true; };
  }, []);

  // Load movies page
  useEffect(() => {
    if (activeTab !== 'movies') return;
    let cancelled = false;
    async function load() {
      setMoviesLoading(true);
      setMoviesPage(1);
      setMoviesHasMore(true);
      try {
        if (movieGenres.length === 0) {
          const g = await tmdb.getMovieGenres();
          if (!cancelled) setMovieGenres(g);
        }
        const data = await tmdb.discoverMovies(selectedMovieGenre || undefined, 1);
        if (cancelled) return;
        setMoviesData(data);
        setMoviesLoading(false);
        setMoviesHasMore(data.length >= 20);
      } catch {
        if (!cancelled) setMoviesLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, selectedMovieGenre]);

  // Load series page
  useEffect(() => {
    if (activeTab !== 'series') return;
    let cancelled = false;
    async function load() {
      setSeriesLoading(true);
      setSeriesPage(1);
      setSeriesHasMore(true);
      try {
        if (tvGenres.length === 0) {
          const g = await tmdb.getTvGenres();
          if (!cancelled) setTvGenres(g);
        }
        const data = await tmdb.discoverTv(selectedTvGenre || undefined, 1);
        if (cancelled) return;
        setSeriesData(data);
        setSeriesLoading(false);
        setSeriesHasMore(data.length >= 20);
      } catch {
        if (!cancelled) setSeriesLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, selectedTvGenre]);

  // Load anime page
  useEffect(() => {
    if (activeTab !== 'anime') return;
    let cancelled = false;
    async function load() {
      setAnimeLoading(true);
      setAnimeSeasonalLoading(true);
      try {
        const [top, seasonal] = await Promise.all([
          jikan.getTopAnime(),
          jikan.getSeasonalAnime().catch(() => []),
        ]);
        if (cancelled) return;
        setAnimeData(top);
        setAnimeLoading(false);
        setAnimeSeasonal(seasonal);
        setAnimeSeasonalLoading(false);
      } catch {
        if (!cancelled) setAnimeLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  // Search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [tmdbResults, animeResults] = await Promise.all([
          tmdb.searchMulti(searchQuery),
          jikan.searchAnime(searchQuery).catch(() => []),
        ]);
        // Merge and dedupe: TMDB results first, then anime that aren't already in the list
        const merged = [...tmdbResults];
        const existingIds = new Set(tmdbResults.map(m => `${m.type}-${m.id}`));
        for (const a of animeResults.slice(0, 10)) {
          if (!existingIds.has(`anime-${a.id}`)) merged.push(a);
        }
        setSearchResults(merged);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const handlePlay = useCallback((media: Media) => {
    setDetailMedia(null);
    setVideoModal({ media });
  }, []);

  const handleInfo = useCallback((media: Media) => {
    setDetailMedia(media);
  }, []);

  const loadMoreMovies = async () => {
    if (moviesLoadingMore || !moviesHasMore) return;
    setMoviesLoadingMore(true);
    try {
      const next = moviesPage + 1;
      const data = await tmdb.discoverMovies(selectedMovieGenre || undefined, next);
      setMoviesData(prev => [...prev, ...data]);
      setMoviesPage(next);
      setMoviesHasMore(data.length >= 20);
    } finally {
      setMoviesLoadingMore(false);
    }
  };

  const loadMoreSeries = async () => {
    if (seriesLoadingMore || !seriesHasMore) return;
    setSeriesLoadingMore(true);
    try {
      const next = seriesPage + 1;
      const data = await tmdb.discoverTv(selectedTvGenre || undefined, next);
      setSeriesData(prev => [...prev, ...data]);
      setSeriesPage(next);
      setSeriesHasMore(data.length >= 20);
    } finally {
      setSeriesLoadingMore(false);
    }
  };

  const showSearch = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar
        activeTab={activeTab}
        onTabChange={(t) => { setActiveTab(t); setSearchQuery(''); window.scrollTo({ top: 0 }); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Search results override */}
      {showSearch ? (
        <div className="pt-20 md:pt-24">
          <div className="px-4 md:px-8 lg:px-12 pt-6 pb-2">
            <div className="flex items-center gap-2 text-neutral-400">
              <SearchIcon size={18} />
              <span className="text-sm">
                {searching ? 'Searching...' : `${searchResults.length} results for `}
                {!searching && <span className="text-white font-semibold">"{searchQuery}"</span>}
              </span>
            </div>
          </div>
          <MediaGrid
            items={searchResults}
            loading={searching}
            onPlay={handlePlay}
            onInfo={handleInfo}
            emptyMessage={`No results found for "${searchQuery}"`}
          />
        </div>
      ) : (
        <main className="pt-16 md:pt-18">
          {/* HOME */}
          {activeTab === 'home' && (
            <>
              {featured && (
                <Hero media={featured} onPlay={handlePlay} onInfo={handleInfo} />
              )}
              <div className="pt-6 md:pt-8">
                <MediaRow title="Trending This Week" items={trending} loading={trendingLoading} onPlay={handlePlay} onInfo={handleInfo} />
                <MediaRow title="Popular Movies" items={popularMovies} loading={popularMoviesLoading} onPlay={handlePlay} onInfo={handleInfo} />
                <MediaRow title="Popular Series" items={popularSeries} loading={popularSeriesLoading} onPlay={handlePlay} onInfo={handleInfo} />
                <MediaRow title="Top Anime" items={topAnime} loading={topAnimeLoading} onPlay={handlePlay} onInfo={handleInfo} />
                <MediaRow title="Top Rated Movies" items={topRatedMovies} loading={topRatedMoviesLoading} onPlay={handlePlay} onInfo={handleInfo} />
                <MediaRow title="Coming Soon" items={upcoming} loading={upcomingLoading} onPlay={handlePlay} onInfo={handleInfo} />
              </div>
            </>
          )}

          {/* MOVIES */}
          {activeTab === 'movies' && (
            <div className="pt-2">
              <PageHeader title="Movies" subtitle="Discover thousands of films" />
              <GenreFilter
                genres={movieGenres}
                selected={selectedMovieGenre}
                onSelect={setSelectedMovieGenre}
              />
              <MediaGrid
                items={moviesData}
                loading={moviesLoading}
                onPlay={handlePlay}
                onInfo={handleInfo}
                emptyMessage="No movies found in this category."
              />
              {moviesHasMore && !moviesLoading && moviesData.length > 0 && (
                <LoadMoreButton onClick={loadMoreMovies} loading={moviesLoadingMore} />
              )}
            </div>
          )}

          {/* SERIES */}
          {activeTab === 'series' && (
            <div className="pt-2">
              <PageHeader title="Series" subtitle="Binge-worthy TV shows" />
              <GenreFilter
                genres={tvGenres}
                selected={selectedTvGenre}
                onSelect={setSelectedTvGenre}
              />
              <MediaGrid
                items={seriesData}
                loading={seriesLoading}
                onPlay={handlePlay}
                onInfo={handleInfo}
                emptyMessage="No series found in this category."
              />
              {seriesHasMore && !seriesLoading && seriesData.length > 0 && (
                <LoadMoreButton onClick={loadMoreSeries} loading={seriesLoadingMore} />
              )}
            </div>
          )}

          {/* ANIME */}
          {activeTab === 'anime' && (
            <div className="pt-2">
              <PageHeader title="Anime" subtitle="Explore the world of Japanese animation" />
              <MediaRow title="Top Anime" items={animeData} loading={animeLoading} onPlay={handlePlay} onInfo={handleInfo} />
              <MediaRow title="This Season" items={animeSeasonal} loading={animeSeasonalLoading} onPlay={handlePlay} onInfo={handleInfo} />
              {!animeLoading && animeData.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight px-4 md:px-8 lg:px-12 mb-3">All Top Anime</h2>
                  <MediaGrid
                    items={animeData}
                    onPlay={handlePlay}
                    onInfo={handleInfo}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      )}

      <Footer />

      {/* Modals */}
      {detailMedia && (
        <DetailModal media={detailMedia} onPlay={handlePlay} onClose={() => setDetailMedia(null)} />
      )}
      {videoModal && (
        <VideoModal data={videoModal} onClose={() => setVideoModal(null)} />
      )}
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
      <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function GenreFilter({
  genres,
  selected,
  onSelect,
}: {
  genres: { id: number; name: string }[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}) {
  if (genres.length === 0) return null;
  return (
    <div className="px-4 md:px-8 lg:px-12 pb-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === null ? 'bg-primary-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/15'
          }`}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === g.id ? 'bg-primary-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/15'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center pb-12">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium px-8 py-3 transition-colors"
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-neutral-500 text-xs">
          CinePulse Stream — Movies, Series & Anime. Data from TMDB & Jikan (MyAnimeList).
          This app does not host any content; streams are provided by third-party embeds.
        </p>
      </div>
    </footer>
  );
}

export default App;
