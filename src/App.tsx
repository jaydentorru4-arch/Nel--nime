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
  Shield,
  Coins,
  Bug,
  Zap,
  ArrowRight,
  UserX,
  Lock,
} from 'lucide-react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { Anime, Episode, Bookmark as BookmarkType, WatchHistory, UserProfile, Friend } from './types/anime';
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
import {
  loadUserProfile,
  saveUserProfile,
  loadFriends,
  saveFriends,
  calculateLevelFromXP,
  saveChatMessages,
  loadChatMessages,
  MASTER_ADMIN_EMAIL,
} from './services/userService';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AnimeRow } from './components/AnimeRow';
import { AnimeCard } from './components/AnimeCard';
import { CatalogView } from './components/CatalogView';
import { WatchPlayer } from './components/WatchPlayer';
import { WatchModal } from './components/WatchModal';
import { AnimeDetailPage } from './components/AnimeDetailPage';
import { ProfilePage } from './components/ProfilePage';
import { AnimeModal } from './components/AnimeModal';

// Upgraded Interactive Systems
import { SplashScreen } from './components/SplashScreen';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GlobalChatDrawer } from './components/GlobalChatDrawer';
import { ShopModal } from './components/ShopModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { LevelUpModal } from './components/LevelUpModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { FriendsModal } from './components/FriendsModal';
import { BugReportModal } from './components/BugReportModal';

function MainApp() {
  const { user } = useAuth();

  // Intro Splash Screen: show on initial load
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('nel_splash_entered');
  });

  // Current User Profile & Economy State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => loadUserProfile());
  const [friends, setFriends] = useState<Friend[]>(() => loadFriends());

  // Navigation state: 'home' | 'catalog' | 'trending' | 'profile' | 'watch' | 'detail'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedGenreForCatalog, setSelectedGenreForCatalog] = useState<string>('All');

  // Video Watching States
  const [activeAnime, setActiveAnime] = useState<Anime>(ANIME_DATABASE[0]);
  const [activeEpisode, setActiveEpisode] = useState<Episode>(ANIME_DATABASE[0].episodes[0]);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(1);

  // Popup Video Player Overlay Modal state
  const [modalVideo, setModalVideo] = useState<{
    anime: Anime;
    episode: Episode;
    seasonNumber?: number;
  } | null>(null);

  // Detail Page Anime
  const [detailAnime, setDetailAnime] = useState<Anime>(ANIME_DATABASE[0]);
  const [modalAnime, setModalAnime] = useState<Anime | null>(null);

  // Bookmarks & History
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);

  // Modals & Panels State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Level Up Celebratory Modal
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number } | null>(null);

  // Public Profile Modal Target
  const [publicProfileTarget, setPublicProfileTarget] = useState<Partial<UserProfile> | null>(null);

  // Sync Firebase Auth with Local User Profile
  useEffect(() => {
    if (user) {
      const isMasterAdmin = user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
      setCurrentUser((prev) => {
        const updated: UserProfile = {
          ...prev,
          email: user.email || prev.email,
          username: user.displayName || prev.username,
          avatar: user.photoURL || prev.avatar,
          isAdmin: isMasterAdmin ? true : prev.isAdmin,
          role: isMasterAdmin ? 'ADMIN' : prev.role,
          equippedBadge: isMasterAdmin ? 'ADMIN' : prev.equippedBadge,
        };
        saveUserProfile(updated);
        return updated;
      });

      // Subscribe to Firestore bookmarks
      const unsubBookmarks = subscribeToBookmarks(
        user.uid,
        (fbBookmarks) => setBookmarks(fbBookmarks),
        () => setBookmarks(getLocalBookmarks())
      );

      // Subscribe to Firestore history
      const unsubHistory = subscribeToWatchHistory(
        user.uid,
        (fbHistory) => setWatchHistory(fbHistory),
        () => setWatchHistory(getLocalHistory())
      );

      return () => {
        unsubBookmarks();
        unsubHistory();
      };
    } else {
      setBookmarks(getLocalBookmarks());
      setWatchHistory(getLocalHistory());
    }
  }, [user]);

  // Save user profile changes
  const handleUpdateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      saveUserProfile(updated);
      return updated;
    });
  };

  // Add XP and trigger Level-Up check
  const handleAddXP = (amount: number) => {
    const prevXP = currentUser.xp || 0;
    const nextXP = prevXP + amount;

    const prevLevel = calculateLevelFromXP(prevXP).level;
    const nextLevelData = calculateLevelFromXP(nextXP);

    if (nextLevelData.level > prevLevel) {
      // Level up triggered! Award +100 Nel Coins
      const nextCoins = currentUser.nelCoins + 100;
      handleUpdateCurrentUser({
        xp: nextXP,
        level: nextLevelData.level,
        nelCoins: nextCoins,
      });
      setLevelUpData({ newLevel: nextLevelData.level });
    } else {
      handleUpdateCurrentUser({
        xp: nextXP,
        level: nextLevelData.level,
      });
    }
  };

  // Claim Daily Reward
  const handleClaimDailyReward = (coinsAwarded: number, xpAwarded: number) => {
    const nextStreak = (currentUser.dailyStreak || 0) + 1;
    const nextCoins = currentUser.nelCoins + coinsAwarded;
    const prevXP = currentUser.xp || 0;
    const nextXP = prevXP + xpAwarded;

    const prevLevel = calculateLevelFromXP(prevXP).level;
    const nextLevelData = calculateLevelFromXP(nextXP);

    handleUpdateCurrentUser({
      nelCoins: nextCoins,
      xp: nextXP,
      level: nextLevelData.level,
      dailyStreak: nextStreak,
      lastDailyRewardDate: new Date().toISOString(),
    });

    if (nextLevelData.level > prevLevel) {
      setLevelUpData({ newLevel: nextLevelData.level });
    }

    setIsDailyRewardOpen(false);
  };

  // Send System Broadcast to Global Chat
  const handleSendBroadcast = (message: string) => {
    const msgs = loadChatMessages();
    const broadcastMsg = {
      id: `sys-${Date.now()}`,
      userId: 'system',
      userName: 'SYSTEM BROADCAST',
      userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
      text: message,
      timestamp: 'Just now',
      role: 'ADMIN' as const,
      level: 99,
      badge: 'ADMIN',
      isSystemBroadcast: true,
    };
    const updated = [...msgs, broadcastMsg];
    saveChatMessages(updated);
  };

  // Add Friend
  const handleAddFriend = (friendName: string) => {
    const newFriend: Friend = {
      id: `fr-${Date.now()}`,
      username: friendName,
      avatar: `https://images.unsplash.com/photo-1534528741775?w=120&q=80`,
      level: Math.floor(Math.random() * 15) + 2,
      status: 'online',
      currentlyWatching: 'Solo Leveling Episode 4',
      frame: 'frame-neon-violet',
    };
    const updated = [newFriend, ...friends];
    setFriends(updated);
    saveFriends(updated);
  };

  const handleRemoveFriend = (friendId: string) => {
    const updated = friends.filter((f) => f.id !== friendId);
    setFriends(updated);
    saveFriends(updated);
  };

  // Bookmark handling
  const isBookmarked = (animeId: string): boolean => {
    return bookmarks.some((b) => b.animeId === animeId);
  };

  const handleToggleBookmark = async (anime: Anime) => {
    const exists = isBookmarked(anime.id);

    if (exists) {
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

  // Navigate to Detail Page
  const handleOpenDetail = (anime: Anime) => {
    setDetailAnime(anime);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Popup Video Player Overlay
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

    // Watching award: +25 XP and episodes watched counter!
    handleAddXP(25);
    handleUpdateCurrentUser({
      episodesWatched: (currentUser.episodesWatched || 0) + 1,
    });
  };

  // Open Full Dedicated Watch Page Layout
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

    handleAddXP(25);
    handleUpdateCurrentUser({
      episodesWatched: (currentUser.episodesWatched || 0) + 1,
    });
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

  // Curated spotlight titles required by prompt:
  // Jujutsu Kaisen, Demon Slayer, Attack on Titan, One Piece, Solo Leveling, My Hero Academia
  const popularMustWatch = ANIME_DATABASE.filter((a) => {
    const t = a.title.toLowerCase();
    return (
      t.includes('jujutsu') ||
      t.includes('demon slayer') ||
      t.includes('attack on titan') ||
      t.includes('one piece') ||
      t.includes('solo leveling') ||
      t.includes('my hero academia')
    );
  });

  const featuredAnime = ANIME_DATABASE.filter((a) => a.isFeatured);
  const trendingAnime = ANIME_DATABASE.filter((a) => a.isTrending);
  const popularAnime = ANIME_DATABASE.filter((a) => a.isPopular);
  const actionFantasyAnime = ANIME_DATABASE.filter(
    (a) => a.genres.includes('Action') || a.genres.includes('Fantasy')
  );

  // 1. BAN SCREEN OVERRIDE (Requirement 2 & 4: Ban User completely blocks account access)
  if (currentUser.isBanned) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#090a0d] text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-rose-600/50 shadow-2xl backdrop-blur-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Account Banned</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Your account <code className="text-rose-400 font-mono font-bold">{currentUser.email}</code> has been banned from accessing Nel Anime by an Administrator.
          </p>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400">
            Reason: Policy violation or administrative security action.
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleUpdateCurrentUser({ isBanned: false })}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Emergency Admin Unban
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLoginOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-600/30"
            >
              Log in with Master Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEMPORARY SUSPENSION SCREEN OVERRIDE
  const isSuspended =
    currentUser.suspendedUntil && new Date(currentUser.suspendedUntil).getTime() > Date.now();
  if (isSuspended) {
    const formattedSuspension = new Date(currentUser.suspendedUntil!).toLocaleString();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#090a0d] text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-amber-500/50 shadow-2xl backdrop-blur-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Account Temporarily Suspended</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Your access has been placed on hold until{' '}
            <strong className="text-amber-400">{formattedSuspension}</strong>.
          </p>
          <button
            type="button"
            onClick={() => handleUpdateCurrentUser({ suspendedUntil: null })}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Emergency Clear Suspension
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-zinc-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* 1. ANIMATED INTRO / SPLASH SCREEN */}
      {showSplash && (
        <SplashScreen
          onEnter={() => {
            sessionStorage.setItem('nel_splash_entered', 'true');
            setShowSplash(false);
          }}
        />
      )}

      {/* Sticky Top Navigation Bar with Nel Coins Counter */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSelectAnime={(anime, epNum) => handleOpenWatchModal(anime, epNum || 1)}
        bookmarksCount={bookmarks.length}
        currentUser={currentUser}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenDailyReward={() => setIsDailyRewardOpen(true)}
        onOpenFriends={() => setIsFriendsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {/* VIEW 1: REDESIGNED GLASSMORPHIC DASHBOARD */}
        {currentView === 'home' && (
          <div className="space-y-8 pb-20">
            {/* Hero Carousel */}
            <HeroBanner
              featuredAnime={featuredAnime}
              onWatchNow={(anime) => handleOpenWatchModal(anime, 1)}
              onOpenDetails={(anime) => handleOpenDetail(anime)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />

            {/* MUST WATCH ANIME SPOTLIGHT (Jujutsu Kaisen, Demon Slayer, Solo Leveling, Attack on Titan, One Piece, MHA) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/40 via-zinc-900/60 to-fuchsia-950/30 border border-violet-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/40">
                      <Flame className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Must-Watch Anime Hall of Fame
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Jujutsu Kaisen, Demon Slayer, Attack on Titan, One Piece, Solo Leveling & MHA
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                    Ultra HD 1080p
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {popularMustWatch.slice(0, 6).map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onSelect={(a) => handleOpenDetail(a)}
                      onPlay={(a) => handleOpenWatchModal(a, 1)}
                      isBookmarked={isBookmarked(anime.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Watching Row (if user has progress) */}
            {watchHistory.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        className="group flex-shrink-0 w-64 sm:w-72 bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/60 transition-all cursor-pointer shadow-lg hover:shadow-violet-900/20"
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
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-700">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
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

            {/* Category 1: Trending Now */}
            <AnimeRow
              title="Trending Now"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
              subtitle="The most-streamed masterworks worldwide this week"
              animeList={trendingAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => setCurrentView('trending')}
            />

            {/* Category 2: Popular Anime */}
            <AnimeRow
              title="Popular Anime"
              icon={<Tv className="w-5 h-5 text-violet-400" />}
              subtitle="Highest viewer engagement and all-time classic releases"
              animeList={popularAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => {
                setSelectedGenreForCatalog('All');
                setCurrentView('catalog');
              }}
            />

            {/* Category 3: Action & Fantasy */}
            <AnimeRow
              title="Action & Fantasy Masterpieces"
              icon={<Compass className="w-5 h-5 text-fuchsia-400" />}
              subtitle="High-octane fights, supernatural powers, and mythical worlds"
              animeList={actionFantasyAnime}
              onSelect={(anime) => handleOpenDetail(anime)}
              onPlay={(anime) => handleOpenWatchModal(anime, 1)}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={() => {
                setSelectedGenreForCatalog('Action');
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
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <Flame className="w-7 h-7 text-amber-500" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Top Trending Anime
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Live popularity rankings computed from real-time streaming activity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {trendingAnime.map((anime, index) => (
                <div key={anime.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-lg border border-violet-400/50">
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

        {/* VIEW 5: USER PROFILE & CUSTOMIZATION VIEW */}
        {currentView === 'profile' && (
          <ProfilePage
            bookmarks={bookmarks}
            watchHistory={watchHistory}
            onSelectAnime={(anime, epNum) => handleOpenWatchModal(anime, epNum || 1)}
            onRemoveBookmark={(id) => {
              const anime = ANIME_DATABASE.find((a) => a.id === id);
              if (anime) handleToggleBookmark(anime);
            }}
            onExploreCatalog={() => setCurrentView('catalog')}
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUser}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {/* VIEW 6: DEDICATED COMPLETE VIDEO PLAYER PAGE */}
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

      {/* POPUP / MODAL VIDEO PLAYER OVERLAY */}
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

      {/* 3 & 4. OWNER & ADMIN DASHBOARD PANEL */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        onSendBroadcast={handleSendBroadcast}
      />

      {/* MASTER ADMIN LOGIN OVERRIDE MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        currentUser={currentUser}
        onAdminLoginSuccess={(profileUpdates) => {
          handleUpdateCurrentUser(profileUpdates);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* 5. GLOBAL CHAT DRAWER */}
      <GlobalChatDrawer
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        currentUser={currentUser}
        onOpenPublicProfile={(target) => setPublicProfileTarget(target)}
        onAddXP={handleAddXP}
        onUpdateCurrentUser={handleUpdateCurrentUser}
      />

      {/* 6. NEL CUSTOMIZATION SHOP MODAL */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
      />

      {/* 24-HOUR DAILY REWARD MODAL */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        currentUser={currentUser}
        onClaimReward={handleClaimDailyReward}
      />

      {/* LEVEL UP POP-UP OVERLAY */}
      {levelUpData && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData.newLevel}
          bonusCoins={100}
        />
      )}

      {/* PUBLIC PROFILE INSPECTION MODAL */}
      <PublicProfileModal
        user={publicProfileTarget}
        onClose={() => setPublicProfileTarget(null)}
        onSendFriendRequest={(target) => {
          if (target.username) handleAddFriend(target.username);
        }}
        isAlreadyFriend={friends.some((f) => f.username === publicProfileTarget?.username)}
      />

      {/* FRIENDS LIST MODAL */}
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        friends={friends}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
        onOpenProfile={(target) => {
          setIsFriendsOpen(false);
          setPublicProfileTarget(target);
        }}
      />

      {/* 8. REPORT BUG MODAL */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        currentUser={currentUser}
      />

      {/* FLOATING REPORT BUG BUTTON (Requirement 8) */}
      <button
        type="button"
        onClick={() => setIsBugReportOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 group text-xs font-bold"
        title="Report an issue or bug to Admin"
      >
        <Bug className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Report Bug</span>
      </button>

      {/* Footer */}
      <footer className="bg-[#090a0d] border-t border-zinc-800/80 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
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
                Glassmorphic Anime Streaming & Community &bull; HD Playback &bull; Zero Ads
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-zinc-400">
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Catalogue
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Nel Shop
            </button>
            <button
              onClick={() => setIsFriendsOpen(true)}
              className="hover:text-violet-400 transition-colors cursor-pointer"
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setShowSplash(true)}
              className="hover:text-violet-400 transition-colors cursor-pointer"
            >
              Intro Animation
            </button>
            <button
              onClick={() => setIsBugReportOpen(true)}
              className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Bug className="w-3.5 h-3.5" />
              Report Issue
            </button>
            {currentUser.isAdmin ? (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="text-violet-400 font-bold hover:text-violet-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-zinc-500 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                Admin Login
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-600 text-center md:text-right">
            &copy; {new Date().getFullYear()} Nel Anime. Built with React & Tailwind CSS.
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
