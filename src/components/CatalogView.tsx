import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Filter, X, Compass, Globe, Layers, ArrowRight } from 'lucide-react';
import { Anime } from '../types/anime';
import { ANIME_DATABASE, ALL_GENRES, ALL_FORMATS, ALL_STATUSES } from '../data/animeData';
import { searchGlobalAniList, fetchTrendingFromAniList } from '../services/aniListService';
import { AnimeCard } from './AnimeCard';

interface CatalogViewProps {
  onSelectAnime: (anime: Anime) => void;
  onPlayAnime: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (anime: Anime) => void;
  initialGenre?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectAnime,
  onPlayAnime,
  isBookmarked,
  onToggleBookmark,
  initialGenre = 'All',
}) => {
  const [catalogMode, setCatalogMode] = useState<'curated' | 'global'>('curated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'score' | 'title' | 'year'>('popular');

  // State for global API queries
  const [globalAnimeList, setGlobalAnimeList] = useState<Anime[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Fetch from AniList when in global mode
  useEffect(() => {
    if (catalogMode !== 'global') return;

    let isCancelled = false;
    setIsLoadingGlobal(true);

    const fetchData = async () => {
      try {
        if (searchQuery.trim().length >= 2) {
          const results = await searchGlobalAniList(searchQuery, 30);
          if (!isCancelled) setGlobalAnimeList(results);
        } else {
          const results = await fetchTrendingFromAniList(30);
          if (!isCancelled) setGlobalAnimeList(results);
        }
      } catch (err) {
        console.error('Failed to query global anime', err);
      } finally {
        if (!isCancelled) setIsLoadingGlobal(false);
      }
    };

    const timer = setTimeout(fetchData, searchQuery.trim() ? 400 : 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [catalogMode, searchQuery]);

  // Local filtered curated catalog
  const filteredCuratedAnime = useMemo(() => {
    return ANIME_DATABASE.filter((anime) => {
      // Search text match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = anime.title.toLowerCase().includes(q);
        const matchesJap = anime.japaneseTitle?.toLowerCase().includes(q);
        const matchesStudio = anime.studio.toLowerCase().includes(q);
        const matchesGenres = anime.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesJap && !matchesStudio && !matchesGenres) return false;
      }

      // Genre filter
      if (selectedGenre !== 'All' && !anime.genres.includes(selectedGenre)) {
        return false;
      }

      // Format filter
      if (selectedFormat !== 'All' && anime.type !== selectedFormat) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && anime.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return parseFloat(b.score) - parseFloat(a.score);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return b.year - a.year;
      // default: popularity ranking
      return (a.rankedNumber || 99) - (b.rankedNumber || 99);
    });
  }, [searchQuery, selectedGenre, selectedFormat, selectedStatus, sortBy]);

  const displayedAnime = catalogMode === 'global' ? globalAnimeList : filteredCuratedAnime;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSelectedStatus('All');
    setSortBy('popular');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedGenre !== 'All' ||
    selectedFormat !== 'All' ||
    selectedStatus !== 'All' ||
    sortBy !== 'popular';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anime Library & Catalog
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Browse our curated all-star archive or explore the entire global anime universe with authentic covers.
          </p>
        </div>

        {/* Search input in catalog */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={
              catalogMode === 'global'
                ? 'Search any anime in the world...'
                : 'Search titles, genres, studios...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14151a] text-sm text-white placeholder-zinc-500 pl-10 pr-9 py-2.5 rounded-xl border border-zinc-800 focus:border-violet-500 focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Mode Selector (Curated vs Global Universe) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14151a] p-3 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatalogMode('curated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              catalogMode === 'curated'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Curated All-Stars ({ANIME_DATABASE.length})</span>
          </button>

          <button
            onClick={() => setCatalogMode('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              catalogMode === 'global'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Global Database (Every Anime Known to Man)</span>
          </button>
        </div>

        {catalogMode === 'global' && (
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live connection to AniList (15,000+ Titles)
          </span>
        )}
      </div>

      {/* Filter controls section (Available in Curated mode) */}
      {catalogMode === 'curated' && (
        <div className="space-y-4 bg-[#14151a]/60 p-4 sm:p-5 rounded-2xl border border-zinc-800/80">
          
          {/* Genre Pills Slider */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Genres
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ALL_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Sub filters: Format, Status, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800/60">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Format Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 font-medium">Format:</span>
                <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  {ALL_FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        selectedFormat === fmt
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 font-medium">Status:</span>
                <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  {ALL_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        selectedStatus === st
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort By & Clear Filter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="score">Highest Score</option>
                  <option value="year">Newest First</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Suggestions */}
      {catalogMode === 'global' && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">Popular Searches:</span>
          {[
            'Dragon Ball Z',
            'Naruto',
            'One Piece',
            'Bleach',
            'Evangelion',
            'Hunter x Hunter',
            'JoJo',
            'Gundam',
            'Berserk',
            'Cowboy Bebop',
            'Fate',
            'Gintama',
            'Monster',
            'Pokemon',
          ].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <strong className="text-white">{displayedAnime.length}</strong> anime titles
          {catalogMode === 'global' ? ' from Global Database' : ' in Curated Archive'}
        </span>
        {isLoadingGlobal && (
          <span className="text-violet-400 font-semibold animate-pulse">
            Fetching anime from AniList worldwide server...
          </span>
        )}
      </div>

      {/* Grid of Anime Cards */}
      {displayedAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedAnime.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onSelect={onSelectAnime}
              onPlay={onPlayAnime}
              isBookmarked={isBookmarked(anime.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : isLoadingGlobal ? (
        <div className="py-24 text-center space-y-3 bg-[#14151a] rounded-2xl border border-zinc-800">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-zinc-300">
            Querying worldwide anime database...
          </p>
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 bg-[#14151a] rounded-2xl border border-zinc-800">
          <p className="text-base font-semibold text-zinc-300">
            No anime found matching &quot;{searchQuery}&quot;
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try switching to the Global Database to search across 15,000+ anime titles or check your spelling.
          </p>
          <button
            onClick={() => {
              setCatalogMode('global');
            }}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Search Global Database
          </button>
        </div>
      )}
    </div>
  );
};
