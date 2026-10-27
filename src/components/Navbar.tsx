import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bookmark,
  User as UserIcon,
  LogOut,
  LogIn,
  Play,
  Film,
  Flame,
  Clock,
  X,
  Compass,
  Menu,
  Coins,
  Shield,
  ShoppingBag,
  Users,
  Zap,
  Calendar,
  KeyRound,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { Anime, UserProfile } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';
import { canClaimDailyReward, MASTER_ADMIN_EMAIL } from '../services/userService';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onSelectAnime: (anime: Anime, episodeNumber?: number) => void;
  bookmarksCount: number;
  currentUser: UserProfile;
  onOpenShop: () => void;
  onOpenDailyReward: () => void;
  onOpenFriends: () => void;
  onOpenAdminPanel: () => void;
  onOpenAdminLogin: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onSelectAnime,
  bookmarksCount,
  currentUser,
  onOpenShop,
  onOpenDailyReward,
  onOpenFriends,
  onOpenAdminPanel,
  onOpenAdminLogin,
  onToggleChat,
  isChatOpen,
}) => {
  const { user, signInWithGoogle, signOut, error, clearError } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isDailyRewardReady = canClaimDailyReward(currentUser.lastDailyRewardDate);
  const isAdmin = currentUser.isAdmin || currentUser.role === 'ADMIN' || currentUser.email === MASTER_ADMIN_EMAIL;

  // Live search filtering with instant local matches
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const localResults = ANIME_DATABASE.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    ).slice(0, 6);

    setSearchResults(localResults);
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFromSearch = (anime: Anime) => {
    onSelectAnime(anime, 1);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#0d0e12]/90 backdrop-blur-xl border-b border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-xl font-black tracking-wider text-white">NEL</span>
                    <span className="text-xl font-black tracking-wider text-violet-400 ml-1">
                      ANIME
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest block -mt-1">
                    Streaming Platform
                  </span>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'home'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'catalog'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-violet-400" />
                    Catalog
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('trending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'trending'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Trending
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('profile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'profile'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-violet-400" />
                    My List
                    {bookmarksCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                        {bookmarksCount}
                      </span>
                    )}
                  </span>
                </button>
              </nav>
            </div>

            {/* Quick Actions, Economy, & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar Container */}
              <div className="relative hidden md:block">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-36 lg:w-48 bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-xs pl-8 pr-7 py-2 rounded-xl border border-zinc-700/60 focus:border-violet-500 focus:outline-none transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-2.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Search Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute right-0 top-11 w-80 bg-[#14151a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
                      {searchResults.map((anime) => (
                        <button
                          key={anime.id}
                          type="button"
                          onClick={() => handleSelectFromSearch(anime)}
                          className="w-full p-2.5 flex items-center gap-3 hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer"
                        >
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-violet-400">
                              {anime.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400">
                              <span className="text-emerald-400 font-bold">Score: {anime.score}</span>
                              <span>&bull;</span>
                              <span>{anime.year}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement 5: Nel Coins Counter on Nav */}
              <button
                type="button"
                onClick={onOpenShop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black shadow-sm transition-all cursor-pointer group"
                title="View Nel Shop & Balance"
              >
                <Coins className="w-4 h-4 fill-amber-400 group-hover:scale-110 transition-transform" />
                <span>{currentUser.nelCoins}</span>
                <span className="hidden sm:inline text-[10px] uppercase text-amber-400/80 font-bold ml-0.5">
                  Coins
                </span>
              </button>

              {/* Daily Reward Claim Streak Button */}
              <button
                type="button"
                onClick={onOpenDailyReward}
                className={`relative p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDailyRewardReady
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/30 animate-pulse'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Claim 24h Daily Streak Reward"
              >
                <Calendar className="w-4 h-4" />
                {isDailyRewardReady && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-zinc-950" />
                )}
              </button>

              {/* Friends Modal Button */}
              <button
                type="button"
                onClick={onOpenFriends}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Friends List"
              >
                <Users className="w-4 h-4 text-violet-400" />
              </button>

              {/* Nel Shop Button */}
              <button
                type="button"
                onClick={onOpenShop}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Nel Customization Shop"
              >
                <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
              </button>

              {/* Requirement 1 & 4: Admin Panel Exclusive Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-extrabold shadow-lg shadow-violet-600/40 border border-violet-400/40 cursor-pointer animate-pulse"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              {/* Global Chat Toggle Button */}
              <button
                type="button"
                onClick={onToggleChat}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isChatOpen
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
                title="Toggle Global Live Chat"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden xl:inline text-xs">Chat</span>
              </button>

              {/* User Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700 cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-violet-500/50"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[90px] truncate leading-tight">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] text-violet-400 font-semibold leading-tight">
                      Lvl {currentUser.level}
                    </span>
                  </div>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-violet-600 text-white font-black text-[9px] uppercase hidden md:inline">
                      [ADMIN]
                    </span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-[#14151a] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.2 rounded bg-violet-600 text-white font-black text-[9px]">
                            [ADMIN]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center justify-between text-[11px] text-amber-300 mt-1 font-semibold">
                        <span>Balance: {currentUser.nelCoins} Coins</span>
                        <span className="text-violet-400">Level {currentUser.level}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-violet-400" />
                        <span>Profile & Customization</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenShop();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
                        <span>Nel Shop</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenDailyReward();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>Daily Streak Rewards</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenFriends();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Friends List</span>
                      </button>

                      {/* Admin Panel Direct Link */}
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenAdminPanel();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-violet-300 font-bold hover:bg-violet-950/50 rounded-xl transition-colors text-left cursor-pointer border border-violet-800/40"
                        >
                          <Shield className="w-4 h-4 text-violet-400" />
                          <span>Owner Admin Panel</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenAdminLogin();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-violet-300 hover:bg-zinc-800 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-zinc-400" />
                          <span>Master Admin Login</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#14151a] border-b border-zinc-800 px-4 pt-2 pb-4 space-y-1">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('catalog');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              Catalog
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('trending');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Trending
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('profile');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-violet-400" />
              My List ({bookmarksCount})
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onOpenAdminPanel();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-violet-300 bg-violet-950/40 border border-violet-800/40 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-violet-400" />
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
