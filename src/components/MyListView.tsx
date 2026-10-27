import React, { useState } from 'react';
import { Bookmark, Clock, Play, Trash2, LogIn, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { Bookmark as BookmarkType, WatchHistory, Anime } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';

interface MyListViewProps {
  bookmarks: BookmarkType[];
  watchHistory: WatchHistory[];
  onSelectAnime: (anime: Anime, episodeNumber?: number) => void;
  onRemoveBookmark: (animeId: string) => void;
  onExploreCatalog: () => void;
}

export const MyListView: React.FC<MyListViewProps> = ({
  bookmarks,
  watchHistory,
  onSelectAnime,
  onRemoveBookmark,
  onExploreCatalog,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Auth Sync Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your personal watchlist and continue where you left off
          </p>
        </div>

        {/* Sync status / Sign in callout */}
        {user ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-950/60 border border-violet-800/50 text-xs text-violet-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Synced to {user.displayName || user.email}</span>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google to sync across devices</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Continue Watching ({watchHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks / Watchlist */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="py-20 text-center bg-[#14151a] rounded-2xl border border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-violet-400">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Save anime series and movies you want to watch later by clicking the bookmark button on any title.
              </p>
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {bookmarks.map((b) => {
                const anime = ANIME_DATABASE.find((a) => a.id === b.animeId);
                return (
                  <div
                    key={b.animeId}
                    className="group relative bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                      <img
                        src={b.poster}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

                      {/* Remove button */}
                      <button
                        onClick={() => onRemoveBookmark(b.animeId)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer z-10"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Play overlay */}
                      <button
                        onClick={() => anime && onSelectAnime(anime, 1)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </button>
                    </div>

                    <div className="p-3">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                        {b.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                        <span>{b.genres || 'Action'}</span>
                        <span className="font-semibold text-emerald-400">{b.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Watch History / Continue Watching */}
      {activeTab === 'history' && (
        <div>
          {watchHistory.length === 0 ? (
            <div className="py-20 text-center bg-[#14151a] rounded-2xl border border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-indigo-400">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Watch History Yet</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Episodes you start watching will automatically save your position here so you can pick up anytime.
              </p>
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              >
                <span>Start Watching Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {watchHistory.map((item) => {
                const anime = ANIME_DATABASE.find((a) => a.id === item.animeId);
                const progressPercent = item.totalDurationSeconds
                  ? Math.min(100, (item.progressSeconds / item.totalDurationSeconds) * 100)
                  : 0;

                return (
                  <div
                    key={item.animeId}
                    className="bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/50 transition-all p-3 flex flex-col justify-between group"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative w-24 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                        <img
                          src={item.poster || anime?.poster}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={() => anime && onSelectAnime(anime, item.episodeNumber)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-5 h-5 text-white fill-current" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-violet-950/80 border border-violet-800/40 text-violet-300">
                          Episode {item.episodeNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate mt-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Left off at: {formatTime(item.progressSeconds)}
                        </p>

                        {/* Resume CTA */}
                        <button
                          onClick={() => anime && onSelectAnime(anime, item.episodeNumber)}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-violet-500 h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
