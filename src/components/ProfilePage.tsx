import React, { useState } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Clock,
  Play,
  Trash2,
  LogOut,
  LogIn,
  ShieldCheck,
  Search,
  ArrowRight,
  Tv,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { Bookmark as BookmarkType, WatchHistory, Anime } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';

interface ProfilePageProps {
  bookmarks: BookmarkType[];
  watchHistory: WatchHistory[];
  onSelectAnime: (anime: Anime, episodeNumber?: number) => void;
  onRemoveBookmark: (animeId: string) => void;
  onExploreCatalog: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  bookmarks,
  watchHistory,
  onSelectAnime,
  onRemoveBookmark,
  onExploreCatalog,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="relative bg-[#14151a] border border-zinc-800 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl">
        {/* Subtle violet decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-violet-600/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-10 h-10" />}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user ? user.displayName || 'Anime Enthusiast' : 'Guest Viewer'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-violet-950 border border-violet-800/60 text-violet-300 text-xs font-semibold">
                  {user ? 'Verified Member' : 'Guest Mode'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                {user ? user.email : 'Sign in with Google to sync your watchlist across all devices.'}
              </p>

              {user && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cloud Firestore Sync Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Watchlist Items
            </span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              {bookmarks.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Episodes In Progress
            </span>
            <span className="text-xl sm:text-2xl font-black text-violet-400 mt-1 block">
              {watchHistory.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Resolution Quality
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              1080p / 4K
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Streaming Audio
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 block">
              SUB & DUB
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'watchlist'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Complete Watchlist ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Continue Watching ({watchHistory.length})</span>
            </button>
          </div>

          {activeTab === 'watchlist' && bookmarks.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 text-xs text-white placeholder-zinc-500 pl-8 pr-3 py-2 rounded-xl border border-zinc-700/60 focus:border-violet-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Complete Watchlist */}
        {activeTab === 'watchlist' && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="py-20 text-center bg-[#14151a] rounded-3xl border border-zinc-800 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-violet-400">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Add anime series to your watchlist directly from any anime card or detail page to track them here.
                </p>
                <button
                  onClick={onExploreCatalog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">
                No saved anime matches &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredBookmarks.map((b) => {
                  const anime = ANIME_DATABASE.find((a) => a.id === b.animeId);
                  return (
                    <div
                      key={b.animeId}
                      className="group relative bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/60 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                        <img
                          src={b.poster}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

                        {/* Remove from watchlist button */}
                        <button
                          onClick={() => onRemoveBookmark(b.animeId)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer z-10"
                          title="Remove from Watchlist"
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

                      <div className="p-3.5">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                          {b.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                          <span className="truncate">{b.genres}</span>
                          <span className="font-semibold text-emerald-400 ml-1 flex-shrink-0">
                            {b.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Watch History */}
        {activeTab === 'history' && (
          <div>
            {watchHistory.length === 0 ? (
              <div className="py-20 text-center bg-[#14151a] rounded-3xl border border-zinc-800 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-indigo-400">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Watch History</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Stream episodes and your progress will automatically sync here so you can pick up immediately.
                </p>
                <button
                  onClick={onExploreCatalog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <span>Start Streaming</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchHistory.map((item) => {
                  const anime = ANIME_DATABASE.find((a) => a.id === item.animeId);
                  const percent = item.totalDurationSeconds
                    ? Math.min(100, (item.progressSeconds / item.totalDurationSeconds) * 100)
                    : 0;

                  return (
                    <div
                      key={item.animeId}
                      className="bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/50 transition-all p-3.5 flex flex-col justify-between group"
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
                            Progress: {formatTime(item.progressSeconds)}
                          </p>

                          <button
                            onClick={() => anime && onSelectAnime(anime, item.episodeNumber)}
                            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Resume</span>
                          </button>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
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
    </div>
  );
};
