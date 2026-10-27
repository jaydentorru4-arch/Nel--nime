import React, { useState } from 'react';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Clock,
  Film,
  Tv,
  Share2,
  Check,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Anime, Episode, Season } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';
import { AnimeCard } from './AnimeCard';

interface AnimeDetailPageProps {
  anime: Anime;
  onPlayEpisode: (anime: Anime, episodeNumber: number, seasonNumber?: number) => void;
  onBack: () => void;
  onSelectRelatedAnime: (anime: Anime) => void;
  isBookmarked: boolean;
  onToggleBookmark: (anime: Anime) => void;
  lastWatchedEpisodeNumber?: number;
}

export const AnimeDetailPage: React.FC<AnimeDetailPageProps> = ({
  anime,
  onPlayEpisode,
  onBack,
  onSelectRelatedAnime,
  isBookmarked,
  onToggleBookmark,
  lastWatchedEpisodeNumber,
}) => {
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);

  const availableSeasons: Season[] = anime.seasons || [
    { seasonNumber: 1, title: 'Season 1', episodes: anime.episodes }
  ];

  const currentSeason =
    availableSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) ||
    availableSeasons[0];

  const seasonEpisodes = currentSeason?.episodes || anime.episodes;

  const relatedAnime = ANIME_DATABASE.filter(
    (a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))
  ).slice(0, 6);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const playTargetEpisodeNumber = lastWatchedEpisodeNumber || 1;

  return (
    <div className="min-h-screen bg-[#0f1014] text-zinc-100 pb-20">
      
      {/* Hero Backdrop with deep gradients */}
      <div className="relative w-full h-[400px] sm:h-[480px] md:h-[560px] overflow-hidden bg-black">
        <img
          src={anime.banner}
          alt={anime.title}
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/65 to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/70 to-transparent sm:w-2/3"></div>

        {/* Top Back Navigation Bar */}
        <div className="absolute top-6 left-4 sm:left-8 z-20 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-zinc-800/90 border border-zinc-700/60 backdrop-blur-md text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span>Catalog</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-violet-400 font-medium truncate max-w-xs">{anime.title}</span>
          </div>
        </div>
      </div>

      {/* Main Detail Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 relative z-20 space-y-12">
        
        {/* Top Split: Poster Card & Title/Actions */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Poster Image & Quick Actions */}
          <div className="w-48 sm:w-56 md:w-64 flex-shrink-0 mx-auto md:mx-0 space-y-3">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700/80 bg-zinc-900 group">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 font-bold text-xs border border-zinc-700/60">
                Score: {anime.score}
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-violet-950/90 text-violet-300 font-bold text-[11px] border border-violet-800/50">
                {anime.quality}
              </div>
            </div>

            {/* Watchlist Button */}
            <button
              onClick={() => onToggleBookmark(anime)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border shadow-lg transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-violet-950/70 border-violet-500/80 text-violet-300 hover:bg-violet-900/80'
                  : 'bg-zinc-900/90 border-zinc-700 hover:bg-zinc-800 text-white'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-violet-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-zinc-300" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Title</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Title, Metadata, Prominent Play CTA, and Synopsis */}
          <div className="flex-1 space-y-5">
            
            {/* Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-violet-600 text-white font-bold text-xs uppercase tracking-wider">
                  {anime.type}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold text-xs">
                  Score: {anime.score} / 10
                </span>
                <span className="px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-800/40 text-violet-300 font-semibold text-xs">
                  {anime.scorePercent}% Match
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs">
                  {availableSeasons.length > 1 ? `${availableSeasons.length} Seasons` : anime.status}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {anime.title}
              </h1>

              {anime.japaneseTitle && (
                <p className="text-base text-zinc-400 font-medium">
                  {anime.japaneseTitle}
                </p>
              )}
            </div>

            {/* Quick Metadata row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
              <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-semibold">
                {anime.ageRating}
              </span>
              <span>{anime.year}</span>
              <span className="text-zinc-600">•</span>
              <span>{availableSeasons.length} Seasons Available</span>
              <span className="text-zinc-600">•</span>
              <span>Studio: <strong className="text-white">{anime.studio}</strong></span>
              <span className="text-zinc-600">•</span>
              <span>Audio: <strong className="text-violet-400">{anime.audio.join(' / ')}</strong></span>
            </div>

            {/* Genres Pills */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Prominent Play Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlayEpisode(anime, playTargetEpisodeNumber, selectedSeasonNumber)}
                className="flex items-center gap-3 px-8 py-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-violet-600/40 hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
                <span>
                  {lastWatchedEpisodeNumber
                    ? `Resume Season ${selectedSeasonNumber} Episode ${lastWatchedEpisodeNumber}`
                    : `Watch Season ${selectedSeasonNumber} Episode 1`}
                </span>
              </button>
            </div>

            {/* Detailed Synopsis */}
            <div className="p-5 rounded-2xl bg-[#14151a] border border-zinc-800 space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {anime.synopsis}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Seasons Tabs & Episodes Catalog Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Seasons & Episodes
              </h2>
              <p className="text-xs text-zinc-400">
                Select a season and episode to stream immediately
              </p>
            </div>

            {/* Season Selector Tabs */}
            {availableSeasons.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {availableSeasons.map((s) => (
                  <button
                    key={s.seasonNumber}
                    onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedSeasonNumber === s.seasonNumber
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    Season {s.seasonNumber} ({s.episodes.length} Ep)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Episode Grid for Selected Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasonEpisodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => onPlayEpisode(anime, ep.number, selectedSeasonNumber)}
                className="p-3.5 rounded-2xl bg-[#14151a] border border-zinc-800 hover:border-violet-500/60 transition-all text-left group cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[11px] text-zinc-300">
                    {ep.duration}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-400">
                      Season {selectedSeasonNumber} • Episode {ep.number}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400">
                      1080p Stream
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5 group-hover:text-violet-300 transition-colors">
                    {ep.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {ep.synopsis}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Related Anime Recommendations */}
        {relatedAnime.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-zinc-800/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                More Like This
              </h2>
              <p className="text-xs text-zinc-400">
                Recommended titles with shared genres and themes
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedAnime.map((item) => (
                <div key={item.id} onClick={() => onSelectRelatedAnime(item)}>
                  <AnimeCard
                    anime={item}
                    onSelect={() => onSelectRelatedAnime(item)}
                    onPlay={() => onPlayEpisode(item, 1, 1)}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={onToggleBookmark}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
