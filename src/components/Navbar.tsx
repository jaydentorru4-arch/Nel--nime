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
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { Anime } from '../types/anime';
import { ANIME_DATABASE } from '../data/animeData';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onSelectAnime: (anime: Anime, episodeNumber?: number) => void;
  bookmarksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onSelectAnime,
  bookmarksCount,
}) => {
  const { user, signInWithGoogle, signOut, error, clearError } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Live search filtering with instant local + global AniList lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    // Instant local matches
    const localResults = ANIME_DATABASE.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    ).slice(0, 5);

    setSearchResults(localResults);

    // Global AniList lookup if query has at least 2 characters
    if (q.length >= 2) {
      setIsSearchingGlobal(true);
      const timer = setTimeout(async () => {
        try {
          const { searchGlobalAniList } = await import('../services/aniListService');
          const globalResults = await searchGlobalAniList(searchQuery, 6);
          setSearchResults((prev) => {
            const seen = new Set(prev.map((item) => item.title.toLowerCase()));
            const uniqueGlobal = globalResults.filter(
              (g) => !seen.has(g.title.toLowerCase())
            );
            return [...prev, ...uniqueGlobal].slice(0, 8);
          });
        } catch (err) {
          console.warn('Global search fallback:', err);
        } finally {
          setIsSearchingGlobal(false);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
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
      <header className="sticky top-0 z-50 w-full bg-[#0f1014]/90 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-xl font-black tracking-wider text-white">NEL</span>
                    <span className="text-xl font-black tracking-wider text-violet-400 ml-1">ANIME</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block -mt-1">
                    Stream Stream HD
                  </span>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'home'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'catalog'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-violet-400" />
                    Catalog
                  </span>
                </button>
                <button
                  onClick={() => setCurrentView('trending')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'trending'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Trending
                  </span>
                </button>
                <button
                  onClick={() => setCurrentView('mylist')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                    currentView === 'mylist'
                      ? 'text-white bg-zinc-800/90 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-violet-400" />
                    My List
                    {bookmarksCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 bg-violet-600 text-white text-[11px] font-bold rounded-full">
                        {bookmarksCount}
                      </span>
                    )}
                  </span>
                </button>
              </nav>
            </div>

            {/* Live Search and Profile */}
            <div className="flex items-center gap-3">
              {/* Search Bar Container */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-44 sm:w-64 md:w-72 bg-zinc-900/90 hover:bg-zinc-800/70 focus:bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-sm pl-9 pr-8 py-2 rounded-xl border border-zinc-700/60 focus:border-violet-500 focus:outline-none transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-2.5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Search Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#14151a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span>Global Anime Matches</span>
                        {isSearchingGlobal && (
                          <span className="text-[10px] lowercase text-violet-400 font-normal animate-pulse">
                            (searching worldwide...)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">Esc to close</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/50">
                      {searchResults.map((anime) => (
                        <button
                          key={anime.id}
                          onClick={() => handleSelectFromSearch(anime)}
                          className="w-full p-2.5 flex items-center gap-3 hover:bg-zinc-800/80 transition-colors text-left group"
                        >
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-12 h-16 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
                              {anime.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                              <span className="px-1.5 py-0.5 bg-violet-950/80 text-violet-300 font-semibold rounded text-[11px] border border-violet-800/40">
                                Score: {anime.score}
                              </span>
                              <span>{anime.year}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="truncate">{anime.genres.slice(0, 2).join(', ')}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('catalog');
                        setIsSearchOpen(false);
                      }}
                      className="w-full py-2.5 text-center text-xs font-medium text-violet-400 hover:text-violet-300 bg-zinc-900 hover:bg-zinc-800/70 transition-colors block border-t border-zinc-800"
                    >
                      View all results in Catalog &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* User Authentication Menu */}
              <div className="relative" ref={profileMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700 focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-bold text-white text-sm">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden lg:inline text-xs font-medium text-zinc-200 max-w-[100px] truncate">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign in with Google</span>
                    <span className="sm:hidden">Sign In</span>
                  </button>
                )}

                {/* Profile Dropdown */}
                {isProfileMenuOpen && user && (
                  <div className="absolute right-0 top-12 w-64 bg-[#14151a] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="text-sm font-semibold text-white truncate">{user.displayName || 'Anime Fan'}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Firebase Auth Connected
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left"
                      >
                        <UserIcon className="w-4 h-4 text-violet-400" />
                        <span>Profile & Watchlist</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left"
                      >
                        <Bookmark className="w-4 h-4 text-violet-400" />
                        <span>My Watchlist ({bookmarksCount})</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span>Continue Watching</span>
                      </button>
                    </div>
                    <div className="pt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          signOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#14151a] border-b border-zinc-800 px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Home
            </button>
            <button
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
              onClick={() => {
                setCurrentView('mylist');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-violet-400" />
              My List ({bookmarksCount})
            </button>
          </div>
        )}
      </header>

      {/* Auth error notification banner if any */}
      {error && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-4 py-2.5 text-xs text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
