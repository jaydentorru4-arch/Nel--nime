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
  Coins,
  Shield,
  Palette,
  ShoppingBag,
  Edit3,
  Check,
  Flame,
  Zap,
  X,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { Bookmark as BookmarkType, WatchHistory, Anime, UserProfile } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';
import { SHOP_ITEMS, calculateLevelFromXP } from '../services/userService';

interface ProfilePageProps {
  bookmarks: BookmarkType[];
  watchHistory: WatchHistory[];
  onSelectAnime: (anime: Anime, episodeNumber?: number) => void;
  onRemoveBookmark: (animeId: string) => void;
  onExploreCatalog: () => void;
  currentUser: UserProfile;
  onUpdateCurrentUser: (profile: Partial<UserProfile>) => void;
  onOpenShop: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  bookmarks,
  watchHistory,
  onSelectAnime,
  onRemoveBookmark,
  onExploreCatalog,
  currentUser,
  onUpdateCurrentUser,
  onOpenShop,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history' | 'customization'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Edit modal/state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  const filteredBookmarks = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const { level, currentLevelXP, xpForNextLevel, progressPercent } = calculateLevelFromXP(
    currentUser.xp || 45
  );

  // Equipped cosmetics
  const equippedFrame = SHOP_ITEMS.find((s) => s.id === currentUser.equippedFrame);
  const equippedBanner = SHOP_ITEMS.find((s) => s.id === currentUser.equippedBanner);
  const equippedColor = SHOP_ITEMS.find((s) => s.id === currentUser.equippedNameColor);

  const bannerUrl =
    equippedBanner?.previewUrl ||
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      username: editUsername.trim() || currentUser.username,
      bio: editBio.trim() || currentUser.bio,
      avatar: editAvatar.trim() || currentUser.avatar,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Banner & Glassmorphic Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
        {/* Equipped Banner Background */}
        <div className="relative h-48 sm:h-64 w-full bg-zinc-950 overflow-hidden">
          <img src={bannerUrl} alt="Profile Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          {/* Banner Tag in corner */}
          {equippedBanner && (
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-zinc-300 text-[11px] font-medium border border-zinc-700/60">
              Banner: {equippedBanner.name}
            </span>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 -mt-20 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover bg-zinc-950 shadow-2xl ${
                    equippedFrame?.previewClass || 'ring-4 ring-zinc-800'
                  }`}
                />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-violet-600 text-white font-black text-xs shadow-lg border-2 border-zinc-900">
                  Lvl {level}
                </span>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    className={`text-2xl sm:text-3xl font-black truncate ${
                      equippedColor?.previewClass || 'text-white'
                    }`}
                  >
                    {currentUser.username}
                  </h1>

                  {/* Rank Badges */}
                  {currentUser.role === 'ADMIN' && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-violet-600 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-violet-600/40">
                      [ADMIN]
                    </span>
                  )}
                  {currentUser.role === 'VIP' && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-black font-black text-xs uppercase shadow-md">
                      [VIP]
                    </span>
                  )}
                  {currentUser.equippedBadge && currentUser.role !== 'ADMIN' && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-700 font-bold text-xs">
                      [{currentUser.equippedBadge}]
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                  {currentUser.bio}
                </p>

                <p className="text-xs text-zinc-500 font-mono">{currentUser.email}</p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={onOpenShop}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-600/30"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Nel Shop</span>
              </button>
            </div>
          </div>

          {/* XP Progress Bar Section */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  Level {level} Progression
                </span>
              </div>
              <span className="text-zinc-400 font-mono">
                {currentLevelXP} / {xpForNextLevel} XP ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Gain XP by watching episodes (+25 XP), chatting in Global Chat (+5 XP), and daily streaks (+50 XP).
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Nel Coins
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {currentUser.nelCoins}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <Tv className="w-5 h-5 text-violet-400" />
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Episodes Watched
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {currentUser.episodesWatched || 6}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <Flame className="w-5 h-5 text-rose-400" />
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Daily Streak
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {currentUser.dailyStreak} Days
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Watchlist Titles
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {bookmarks.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Edit Profile Customization</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs: Watchlist & Watch History */}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        {/* Remove from watchlist button */}
                        <button
                          onClick={() => onRemoveBookmark(b.animeId)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors cursor-pointer z-10"
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
