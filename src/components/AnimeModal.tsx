import React from 'react';
import { X, Play, Bookmark, BookmarkCheck, Film, Clock, Check } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeModalProps {
  anime: Anime | null;
  onClose: () => void;
  onPlayEpisode: (anime: Anime, episodeNumber: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (anime: Anime) => void;
}

export const AnimeModal: React.FC<AnimeModalProps> = ({
  anime,
  onClose,
  onPlayEpisode,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!anime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#14151a] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-900">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14151a] via-[#14151a]/40 to-transparent"></div>

          {/* Quick CTA overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-violet-600 font-bold text-white text-xs uppercase tracking-wider">
                  {anime.type}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-emerald-400 font-bold text-xs">
                  Score: {anime.score}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-xs">
                  {anime.year}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {anime.title}
              </h2>
              {anime.japaneseTitle && (
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  {anime.japaneseTitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  onPlayEpisode(anime, 1);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/35 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Ep 1</span>
              </button>

              <button
                onClick={() => onToggleBookmark(anime)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-violet-950/80 border-violet-500 text-violet-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove from list' : 'Add to list'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-violet-400" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-zinc-400">Genres:</span>
            {anime.genres.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium"
              >
                {g}
              </span>
            ))}
            <div className="ml-auto flex items-center gap-3 text-zinc-400">
              <span>Studio: <strong className="text-zinc-200">{anime.studio}</strong></span>
              <span>•</span>
              <span>Rating: <strong className="text-zinc-200">{anime.ageRating}</strong></span>
              <span>•</span>
              <span>Audio: <strong className="text-violet-400">{anime.audio.join(', ')}</strong></span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Overview
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {anime.synopsis}
            </p>
          </div>

          {/* Episodes Preview Grid */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Episodes ({anime.episodes.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {anime.episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    onPlayEpisode(anime, ep.number);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors group cursor-pointer"
                >
                  <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-violet-400 block">
                      EPISODE {ep.number}
                    </span>
                    <h5 className="text-xs font-semibold text-white truncate">
                      {ep.title}
                    </h5>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {ep.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
