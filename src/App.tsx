import React, { useState, useEffect } from 'react';
import {
  Flame,
  Tv,
  Clock,
  Film,
  Compass,
  Bookmark,
  ShieldAlert,
  HelpCircle,
  X,
  ExternalLink,
  Play,
  CheckCircle,
  User as UserIcon,
} from 'lucide-react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { Anime, Episode, Bookmark as BookmarkType, WatchHistory } from './types/anime';
import { ANIME_DATABASE } from './data/animeData';
import {
  getLocalBookmarks,
  saveLocalBookmark,
  removeLocalBookmark,
  getLocalHistory,
  saveLocalHistory,
  addBookmark,
  deleteBookmark,
  subscribeToBookmarks,
  saveWatchProgress,
  subscribeToWatchHistory,
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AnimeRow } from './components/AnimeRow';
import { AnimeCard } from './components/AnimeCard';
import { CatalogView } from './components/CatalogView';
import { WatchPlayer } from './components/WatchPlayer';
import { WatchModal } from './components/WatchModal';
import { MyListView } from './components/MyListView';
import { AnimeDetailPage } from './components/AnimeDetailPage';
import { ProfilePage } from './components/ProfilePage';
import { AnimeModal } from './components/AnimeModal';

function MainApp() {
  const { user } = useAuth();

  // Navigation state: 'home' | 'catalog' | 'trending' | 'mylist' | 'watch' | 'detail' | 'profile'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedGenreForCatalog, setSelectedGenreForCatalog] = useState<string>('All');

  // Currently watching state for Full Watch Page
  const [activeAnime, setActiveAnime] = useState<Anime>(ANIME_DATABASE[0]);
  const [activeEpisode, setActiveEpisode] = useState<Episode>(ANIME_DATABASE[0].episodes[0]);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(1);

  // Popup Video Player Overlay Modal state
  const [modalVideo, setModalVideo] = useState<{
    anime: Anime;
    episode: Episode;
    seasonNumber?: number;
  } | null>(null);

  // Selected anime for dedicated detail page
  const [detailAnime, setDetailAnime] = useState<Anime>(ANIME_DATABASE[0]);

  // Modal details state (synopsis modal fallback)
  const [modalAnime, setModalAnime] = useState<Anime | null>(null);

  // Bookmarks state (synced with Firestore when authenticated, else local)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  // Watch history state (synced with Firestore when authenticated, else local)
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);

  // Firebase Setup Guide Modal
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  // Sync Bookmarks & History on Auth change
  useEffect(() => {
    if (user) {
      // Subscribe to Firestore bookmarks
      const unsubBookmarks = subscribeToBookmarks(
        user.uid,
        (fbBookmarks) => {
          setBookmarks(fbBookmarks);
        },
        (err) => {
          console.warn('Falling back to local bookmarks:', err);
          setBookmarks(getLocalBookmarks());
        }
      );

      // Subscribe to Firestore watch history
      const unsubHistory = subscribeToWatchHistory(
        user.uid,
        (fbHistory) => {
          setWatchHistory(fbHistory);
        },
        (err) => {
          console.warn('Falling back to local history:', err);
          setWatchHistory(getLocalHistory());
        }
      );

      return () => {
        unsubBookmarks();
        unsubHistory();
      };
    } else {
      // Guest mode - use local storage
      setBookmarks(getLocalBookmarks());
      setWatchHistory(getLocalHistory());
    }
  }, [user]);

  // Check if anime is in watchlist
  const isBookmarked = (animeId: string): boolean => {
    return bookmarks.some((b) => b.animeId === animeId);
  };

  // Toggle bookmark in Firestore or LocalStorage
  const handleToggleBookmark = async (anime: Anime) => {
    const exists = isBookmarked(anime.id);

    if (exists) {
      // Remove
      setBookmarks((prev) => prev.filter((b) => b.animeId !== anime.id));
      if (user) {
        try {
          await deleteBookmark(user.uid, anime.id);
        } catch (err) {
          console.error('Error removing bookmark from Firestore:', err);
        }
      } else {
        removeLocalBookmark(anime.id);
      }
    } else {
      // Add
      const newBm: BookmarkType = {
        animeId: anime.id,
        userId: user ? user.uid : 'guest',
        title: anime.title,
        poster: anime.poster,
        genres: anime.genres.slice(0, 2).join(', '),
        rating: anime.score,
        episodesCount: anime.episodesCount,
        addedAt: new Date().toISOString(),
      };

      setBookmarks((prev) => [newBm, ...prev]);

      if (user) {
        try {
          await addBookmark(user.uid, newBm);
        } catch (err) {
          console.error('Error adding bookmark to Firestore:', err);
        }
      } else {
        saveLocalBookmark(newBm);
      }
    }
  };

  // Navigate to dedicated Anime Detail Page
  const handleOpenDetail = (anime: Anime) => {
    setDetailAnime(anime);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open the Modal Video Player Overlay immediately (Requirement 1)
  const handleOpenWatchModal = (
    anime: Anime,
    episodeNumber: number = 1,
    seasonNumber: number = 1
  ) => {
    const targetSeason = anime.seasons?.find((s) => s.seasonNumber === seasonNumber);
    const seasonEps = targetSeason?.episodes || anime.episodes || [];
    const ep =
      seasonEps.find((e) => e.number === episodeNumber) ||
      seasonEps[0] || {
        id: `ep-${episodeNumber}`,
        number: episodeNumber,
        title: `Episode ${episodeNumber}`,
        thumbnail: anime.poster,
        duration: '24:15',
        durationSeconds: 1455,
        synopsis: anime.synopsis,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      };

    setModalVideo({ anime, episode: ep, seasonNumber });
  };

  // Open Full Dedicated Watch Page (Requirement 2)
  const handleOpenFullWatchPage = (
    anime: Anime,
    episodeNumber: number = 1,
    seasonNumber: number = 1
  ) => {
    setCurrentSeasonNumber(seasonNumber);
    const targetSeason = anime.seasons?.find((s) => s.seasonNumber === seasonNumber);
    const seasonEps = targetSeason?.episodes || anime.episodes || [];
    const ep = seasonEps.find((e) => e.number === episodeNumber) || seasonEps[0];
    setActiveAnime(anime);
    setActiveEpisode(ep);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save playback progress
  const handleProgressUpdate = async (progressSeconds: number, durationSeconds: number) => {
    const historyItem: WatchHistory = {
      animeId: activeAnime.id,
      userId: user ? user.uid : 'guest',
      title: activeAnime.title,
      poster: activeAnime.poster,
      episodeNumber: activeEpisode.number,
      progressSeconds,
      totalDurationSeconds: durationSeconds,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local state update
    setWatchHistory((prev) => {
      const filtered = prev.filter((h) => h.animeId !== activeAnime.id);
      return [historyItem, ...filtered];
    });

    if (user) {
      try {
        await saveWatchProgress(user.uid, historyItem);
      } catch (err) {
        console.error('Error saving progress to Firestore:', err);
      }
    } else {
      saveLocalHistory(historyItem);
    }
  };

  // Filtered lists for Home sections
  const featuredAnime = ANIME_DATABASE.filter((a) => a.isFeatured);
  const trendingAnime = ANIME_DATABASE.filter((a) => a.isTrending);
  const popularAnime = ANIME_DATABASE.filter((a) => a.isPopular);
  const recentAnime = ANIME_DATABASE.filter((a) => a.isRecent);

  return (
    <div className="min-h-screen bg-[#0f1014] text-zinc-100 flex flex-col font-sans">
      {/* Sticky Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSelectAnime={(anime, epNum) => handleOpenWatchModal(anime, epNum || 1)}
        bookmarksCount={bookmarks.length}
      />

      {/* Main Body Views */}
      <main className="flex-1">
        {/* VIEW 1: HOME VIEW */}
        {currentView === 'home' && (
          <div className="space-y-6 pb-16">
            {/* Hero Banner Carousel - "Watch Now" opens popup player modal */}
            <HeroBanner
              featuredAnime={featuredAnime}
              onWatchNow={(anime) => handleOpenWatchModal(anime, 1)}
              onOpenDetails={(anime) => handleOpenDetail(anime)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />

            {/* Continue Watching Section (if history exists) */}
            {watchHistory.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Continue Watching
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    {watchHistory.length} in progress
                  </span>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {watchHistory.map((item) => {
                    const anime = ANIME_DATABASE.find((a) => a.id === item.animeId);
                    const progressPercent = item.totalDurationSeconds
                      ? Math.min(100, Math.round((item.progressSeconds / item.totalDurationSeconds) * 100))
                      : 45;

                    return (
                      <div
                        key={item.animeId}
                        onClick={() => {
                          if (anime) handleOpenWatchModal(anime, item.episodeNumber);
                        }}
                        className="group flex-shrink-0 w-64 sm:w-72 bg-[#14151a] rounded-xl overflow-hidden border border-zinc-800 hover:border-violet-500/60 transition-all cursor-pointer shadow-lg hover:shadow-violet-900/20"
                      >
                        <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                          <img
                            src={item.poster || anime?.banner || anime?.poster}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                            <div
                              className="h-full bg-violet-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-3">
                          <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                            <span>Episode {item.episodeNumber}</span>
                            <span className="text-violet-400 font-medium">{progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending Now Row */}
            <AnimeRow
              title="Trending Now"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
              subtitle="The most-watched series across the globe right now"
              animeList={trendingAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => setCurrentView('trending')}
            />

            {/* Popular Airing Row */}
            <AnimeRow
              title="Popular Airing"
              icon={<Tv className="w-5 h-5 text-violet-400" />}
              subtitle="Currently broadcasting weekly masterworks"
              animeList={popularAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => {
                setSelectedGenreForCatalog('Action');
                setCurrentView('catalog');
              }}
            />

            {/* Recent Releases Row */}
            <AnimeRow
              title="Recent Releases"
              icon={<Compass className="w-5 h-5 text-emerald-400" />}
              subtitle="Fresh seasonal debuts and brand-new episodes"
              animeList={recentAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => {
                setSelectedGenreForCatalog('Fantasy');
                setCurrentView('catalog');
              }}
            />

            {/* Top Rated Classics */}
            <AnimeRow
              title="Top Rated Masterpieces"
              icon={<Film className="w-5 h-5 text-cyan-400" />}
              subtitle="Critically acclaimed series with scores above 9.0"
              animeList={ANIME_DATABASE.filter((a) => parseFloat(a.score) >= 9.0)}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => {
                setSelectedGenreForCatalog('All');
                setCurrentView('catalog');
              }}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED ANIME DETAIL PAGE */}
        {currentView === 'detail' && (
          <AnimeDetailPage
            anime={detailAnime}
            onPlayEpisode={(anime, epNum, sNum) => handleOpenWatchModal(anime, epNum, sNum || 1)}
            onBack={() => setCurrentView('home')}
            onSelectRelatedAnime={(anime) => handleOpenDetail(anime)}
            isBookmarked={isBookmarked(detailAnime.id)}
            onToggleBookmark={handleToggleBookmark}
            lastWatchedEpisodeNumber={
              watchHistory.find((h) => h.animeId === detailAnime.id)?.episodeNumber
            }
          />
        )}

        {/* VIEW 3: FULL CATALOG VIEW */}
        {currentView === 'catalog' && (
          <CatalogView
            onSelectAnime={(anime) => handleOpenDetail(anime)}
            onPlayAnime={(anime) => handleOpenWatchModal(anime, 1)}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
            initialGenre={selectedGenreForCatalog}
          />
        )}

        {/* VIEW 4: TRENDING VIEW */}
        {currentView === 'trending' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
              <Flame className="w-6 h-6 text-amber-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Top Trending Anime
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Ranked by live viewer counts, engagement, and stream completions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {trendingAnime.map((anime, index) => (
                <div key={anime.id} className="relative">
                  {/* Rank Badge */}
                  <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-xl bg-violet-600 text-white font-black text-sm flex items-center justify-center shadow-lg border border-violet-400/50">
                    #{index + 1}
                  </div>
                  <AnimeCard
                    anime={anime}
                    onSelect={(a) => handleOpenDetail(a)}
                    onPlay={(a) => handleOpenWatchModal(a, 1)}
                    isBookmarked={isBookmarked(anime.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: USER PROFILE & COMPLETE WATCHLIST PAGE */}
        {(currentView === 'profile' || currentView === 'mylist') && (
          <ProfilePage
            bookmarks={bookmarks}
            watchHistory={watchHistory}
            onSelectAnime={(anime) => handleOpenWatchModal(anime, 1)}
            onRemoveBookmark={(id) => {
              const anime = ANIME_DATABASE.find((a) => a.id === id);
              if (anime) handleToggleBookmark(anime);
            }}
            onExploreCatalog={() => setCurrentView('catalog')}
          />
        )}

        {/* VIEW 6: DEDICATED COMPLETE VIDEO PLAYER PAGE LAYOUT (Requirement 2) */}
        {currentView === 'watch' && (
          <WatchPlayer
            anime={activeAnime}
            episode={activeEpisode}
            seasonNumber={currentSeasonNumber}
            onSelectEpisode={(ep, sNum) => {
              setActiveEpisode(ep);
              if (sNum) setCurrentSeasonNumber(sNum);
            }}
            onBackToHome={() => setCurrentView('home')}
            isBookmarked={isBookmarked(activeAnime.id)}
            onToggleBookmark={() => handleToggleBookmark(activeAnime)}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </main>

      {/* POPUP / MODAL VIDEO PLAYER OVERLAY (Requirement 1) */}
      {modalVideo && (
        <WatchModal
          anime={modalVideo.anime}
          episode={modalVideo.episode}
          isOpen={!!modalVideo}
          onClose={() => setModalVideo(null)}
          onSelectEpisode={(ep: Episode) => {
            setModalVideo((prev) => (prev ? { ...prev, episode: ep } : null));
          }}
          onOpenFullPage={() => {
            handleOpenFullWatchPage(
              modalVideo.anime,
              modalVideo.episode.number,
              modalVideo.seasonNumber || 1
            );
            setModalVideo(null);
          }}
        />
      )}

      {/* Quick Details Modal Fallback */}
      <AnimeModal
        anime={modalAnime}
        onClose={() => setModalAnime(null)}
        onPlayEpisode={(anime, epNum) => handleOpenWatchModal(anime, epNum)}
        isBookmarked={modalAnime ? isBookmarked(modalAnime.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Firebase Setup Guide Modal */}
      {showFirebaseGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#14151a] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFirebaseGuide(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Firebase & Authentication Setup</h3>
                <p className="text-xs text-zinc-400">Configured and active for Nel Anime</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Active Firebase Services
                </h4>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li>
                    <strong>Firebase Authentication:</strong> Google Sign-In with popup authorization.
                  </li>
                  <li>
                    <strong>Cloud Firestore:</strong> Dedicated database for user watchlists, continue watching progress, and episode comments.
                  </li>
                  <li>
                    <strong>Security Rules:</strong> Zero-trust schema validation rules active on all collections.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white">Google Sign-In in Firebase Console</h4>
                <p className="text-zinc-400 leading-relaxed">
                  To allow users to sign in with their Google accounts on production domains:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                  <li>Open the <strong>Firebase Console</strong> and select your project.</li>
                  <li>Navigate to <strong>Build &rarr; Authentication &rarr; Sign-in method</strong>.</li>
                  <li>Verify <strong>Google</strong> provider is enabled and project support email is set.</li>
                  <li>Under <strong>Authorized domains</strong>, ensure your domain is added.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white">Guest Mode & Fallbacks</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Even without signing in, users can immediately bookmark anime, maintain watch progress, and stream episodes via local state fallbacks. When they sign in, bookmarks and history are synced directly to Firestore.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFirebaseGuide(false)}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0b0c0e] border-t border-zinc-800/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">
                NEL<span className="text-violet-500">ANIME</span>
              </span>
              <p className="text-xs text-zinc-500">
                Premium Anime Streaming Platform &bull; No ads &bull; HD Playback
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-400">
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
            <button
              onClick={() => {
                setCurrentView('trending');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Trending
            </button>
            <button
              onClick={() => setShowFirebaseGuide(true)}
              className="flex items-center gap-1 hover:text-violet-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Firebase Setup
            </button>
          </div>

          <p className="text-xs text-zinc-600 text-center md:text-right">
            &copy; {new Date().getFullYear()} Nel Anime. Built with React, Tailwind CSS, & Cloud Firestore.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
