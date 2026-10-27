import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowLeft,
  Tv,
  Radio,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertCircle,
  Film,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Anime, Episode, Season } from '../types/anime';
import {
  SAMPLE_VIDEO_STREAMS,
  getJikanAnimeDetails,
  getJikanEpisodes,
  getJikanVideos,
  fetchEpisodeStreamEmbed,
  JikanEpisodeItem,
} from '../services/jikanService';

interface WatchPlayerProps {
  anime: Anime;
  episode: Episode;
  seasonNumber?: number;
  onSelectEpisode: (ep: Episode, seasonNum?: number) => void;
  onBackToHome: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onProgressUpdate?: (seconds: number, duration: number) => void;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  anime,
  episode,
  seasonNumber = 1,
  onSelectEpisode,
  onBackToHome,
  isBookmarked = false,
  onToggleBookmark,
  onProgressUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Streaming source state: 'direct' (HTML5 video) | 'embed' (iframe embed / Jikan trailer)
  const [streamSource, setStreamSource] = useState<'direct' | 'embed'>('direct');
  const [activeQuality, setActiveQuality] = useState<string>('1080p');
  const [audioMode, setAudioMode] = useState<'SUB' | 'DUB'>('SUB');

  // Theater Mode: Dims the rest of the page and expands video width
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1455);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Dynamic stream links loaded via fetch()
  const [currentDirectUrl, setCurrentDirectUrl] = useState<string>(
    episode.videoUrl || SAMPLE_VIDEO_STREAMS[0].url
  );
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>(
    episode.embedUrl ||
      anime.trailerEmbedUrl ||
      'https://www.youtube-nocookie.com/embed/9Zfvhv11rIY?autoplay=1&playsinline=1'
  );

  // Requirement 3: Loading animation state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Requirement 4: Fallback error state
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Jikan API enriched episodes and video promos
  const [jikanEpisodes, setJikanEpisodes] = useState<JikanEpisodeItem[]>([]);
  const [jikanPromoEmbed, setJikanPromoEmbed] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Active season selection
  const [selectedSeason, setSelectedSeason] = useState<number>(seasonNumber);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState<string>('');

  // Controls overlay auto-hide
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute active season episodes
  const availableSeasons: Season[] =
    anime.seasons && anime.seasons.length > 0
      ? anime.seasons
      : [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodes: anime.episodes || [],
          },
        ];

  const currentSeasonData =
    availableSeasons.find((s) => s.seasonNumber === selectedSeason) || availableSeasons[0];
  const episodesList = currentSeasonData.episodes || anime.episodes || [];

  // Filter episodes in sidebar by search
  const filteredEpisodes = episodesList.filter(
    (ep) =>
      ep.title.toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
      `episode ${ep.number}`.includes(episodeSearchQuery.toLowerCase()) ||
      `ep ${ep.number}`.includes(episodeSearchQuery.toLowerCase())
  );

  // Determine current episode index for Prev/Next navigation
  const currentIndex = episodesList.findIndex(
    (ep) => ep.id === episode.id || ep.number === episode.number
  );
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < episodesList.length - 1;

  // 1. Fetch real anime details & videos from Jikan API via JavaScript fetch()
  useEffect(() => {
    let isMounted = true;
    async function loadJikanData() {
      const malId = parseInt(anime.id.replace(/[^0-9]/g, ''), 10) || 151807;
      setApiLoading(true);

      try {
        const [eps, videos] = await Promise.all([
          getJikanEpisodes(malId),
          getJikanVideos(malId),
        ]);

        if (isMounted) {
          if (eps && eps.length > 0) {
            setJikanEpisodes(eps);
          }
          if (videos && videos.promo && videos.promo.length > 0) {
            const promoEmbed = videos.promo[0]?.trailer?.embed_url;
            if (promoEmbed) {
              setJikanPromoEmbed(promoEmbed);
            }
          }
        }
      } catch (err) {
        console.warn('Jikan API data load fallback:', err);
      } finally {
        if (isMounted) setApiLoading(false);
      }
    }

    loadJikanData();
    return () => {
      isMounted = false;
    };
  }, [anime.id]);

  // 1 & 2. Whenever episode changes, fetch streaming embed and video links via fetch()
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    async function loadEpisodeStream() {
      try {
        const streamData = await fetchEpisodeStreamEmbed(anime, episode.number);
        if (isMounted) {
          if (streamData.directVideoUrl) {
            setCurrentDirectUrl(streamData.directVideoUrl);
          }
          if (streamData.embedUrl) {
            setCurrentEmbedUrl(streamData.embedUrl);
          }
        }
      } catch (err) {
        console.warn('Error fetching episode stream embed:', err);
      }
    }

    loadEpisodeStream();

    return () => {
      isMounted = false;
    };
  }, [anime.id, episode.number]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  // Setup playback when stream source or episode changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    if (streamSource === 'direct' && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
            setIsLoading(false);
          });
      }
    } else {
      const timer = setTimeout(() => setIsLoading(false), 900);
      return () => clearTimeout(timer);
    }
  }, [episode.id, streamSource, activeQuality, currentDirectUrl, currentEmbedUrl]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(
      0,
      Math.min(videoRef.current.duration || 1455, videoRef.current.currentTime + seconds)
    );
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
        onProgressUpdate?.(current, videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.85);
      videoRef.current.volume = 0.85;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {
          (videoRef.current as any)?.webkitEnterFullscreen?.();
        });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      const targetTime = Math.min(duration, currentTime + 85);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevious) {
      onSelectEpisode(episodesList[currentIndex - 1], selectedSeason);
    }
  };

  const handleNextEpisode = () => {
    if (hasNext) {
      onSelectEpisode(episodesList[currentIndex + 1], selectedSeason);
    }
  };

  const handleQualityChange = (q: string) => {
    setActiveQuality(q);
    const stream = SAMPLE_VIDEO_STREAMS.find((s) => s.quality === q);
    if (stream) {
      setCurrentDirectUrl(stream.url);
      setHasError(false);
    }
    setShowQualityMenu(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen bg-[#0f1014] text-zinc-100 pb-20">
      {/* Theater Mode Dimmer Overlay */}
      {isTheaterMode && (
        <div
          onClick={() => setIsTheaterMode(false)}
          className="fixed inset-0 bg-black/92 backdrop-blur-xs z-30 transition-opacity duration-300"
        />
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400" />
            <span>Back to Browse</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300 font-medium truncate max-w-[200px]">{anime.title}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-violet-400 font-semibold">{currentSeasonData.title}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">Episode {episode.number}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theater Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isTheaterMode
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="Toggle Theater Mode (T)"
          >
            <Film className="w-3.5 h-3.5 text-violet-400" />
            <span>Theater Mode</span>
            {isTheaterMode && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </button>

          {/* Watchlist Bookmark */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Player + Episode Selection Sidebar */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 pt-5 transition-all duration-300 ${
          isTheaterMode ? 'relative z-40' : ''
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Video Player Section */}
          <div
            className={`transition-all duration-300 ${
              isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'
            }`}
          >
            {/* Video Player Card Container */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group select-none"
            >
              {/* Requirement 2: Load an iframe player or video player whenever a user selects an episode */}
              {streamSource === 'direct' ? (
                <video
                  ref={videoRef}
                  src={currentDirectUrl}
                  playsInline
                  // @ts-ignore
                  webkit-playsinline="true"
                  onTimeUpdate={handleTimeUpdate}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => {
                    setIsLoading(false);
                    setIsPlaying(true);
                    setHasError(false);
                  }}
                  onCanPlay={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                    setErrorMessage('Video currently unavailable, try another source');
                  }}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                />
              ) : (
                <iframe
                  src={currentEmbedUrl}
                  title={`${anime.title} - Episode ${episode.number}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                    setErrorMessage('Video currently unavailable, try another source');
                  }}
                />
              )}

              {/* Requirement 3: Loading Animation Overlay */}
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs pointer-events-none z-20">
                  <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  <span className="mt-3 text-xs font-semibold text-zinc-200 tracking-wider uppercase animate-pulse">
                    Connecting to streaming server...
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1">
                    Loading episode {episode.number} streams
                  </span>
                </div>
              )}

              {/* Requirement 4: Fallback Error Display if Video Fails */}
              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/92 p-6 z-25 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    Video currently unavailable, try another source
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mb-4">
                    The active video link or stream source is temporarily unresponsive. Switch player modes or load the backup high-definition mirror below.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        setStreamSource(streamSource === 'direct' ? 'embed' : 'direct');
                      }}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Switch to {streamSource === 'direct' ? 'Iframe Embed' : 'Direct Video'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        handleQualityChange(activeQuality === '1080p' ? '720p' : '1080p');
                      }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                    >
                      Try Alternate Quality
                    </button>
                  </div>
                </div>
              )}

              {/* Unmuted Audio helper overlay if initial autoplay was muted */}
              {isMuted && isPlaying && streamSource === 'direct' && (
                <div className="absolute top-4 left-4 z-20">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-lg backdrop-blur-sm cursor-pointer animate-pulse"
                  >
                    <VolumeX className="w-4 h-4" />
                    Tap to Unmute Audio
                  </button>
                </div>
              )}

              {/* Skip Intro Floating Pill */}
              {streamSource === 'direct' && currentTime > 15 && currentTime < 120 && (
                <button
                  type="button"
                  onClick={handleSkipIntro}
                  className="absolute bottom-16 right-4 z-25 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/85 hover:bg-violet-600 text-white border border-zinc-700 hover:border-violet-500 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xl"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  Skip Intro (+85s)
                </button>
              )}

              {/* Direct HTML5 Player HUD Controls */}
              {streamSource === 'direct' && (
                <div
                  className={`absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/95 via-transparent to-black/50 transition-opacity duration-300 pointer-events-none ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Top Header inside Player */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-zinc-800 text-[11px] font-bold text-violet-400">
                        {currentSeasonData.title} &bull; Ep {episode.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quality Selector Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-violet-400" />
                          <span>{activeQuality}</span>
                        </button>
                        {showQualityMenu && (
                          <div className="absolute right-0 mt-1 py-1 w-24 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30">
                            {SAMPLE_VIDEO_STREAMS.map((s) => (
                              <button
                                key={s.quality}
                                type="button"
                                onClick={() => handleQualityChange(s.quality)}
                                className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${
                                  activeQuality === s.quality
                                    ? 'bg-violet-600/30 text-violet-400'
                                    : 'text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                <span>{s.quality}</span>
                                {activeQuality === s.quality && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Playback Speed Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute right-0 mt-1 py-1 w-20 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => changeSpeed(spd)}
                                className={`w-full text-left px-3 py-1 text-xs font-medium cursor-pointer ${
                                  playbackSpeed === spd
                                    ? 'bg-violet-600/30 text-violet-400'
                                    : 'text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls & Progress Scrubber */}
                  <div className="space-y-2 pointer-events-auto">
                    {/* Scrubber */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-zinc-300 min-w-[40px]">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-zinc-700/70 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:h-2 transition-all"
                      />
                      <span className="text-[11px] font-mono text-zinc-400 min-w-[40px]">
                        {formatTime(duration)}
                      </span>
                    </div>

                    {/* Button Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                          title="Play / Pause (Space)"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => seekRelative(-10)}
                          className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Rewind 10s"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => seekRelative(10)}
                          className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Forward 10s"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Volume controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-4 h-4 text-rose-400" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="hidden sm:block w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Fullscreen (F)"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Audio & Navigation Controls Bar Below the Player */}
            <div className="mt-4 p-4 bg-[#14151a] rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              {/* Audio Mode: SUB / DUB toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Audio:
                </span>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setAudioMode('SUB')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      audioMode === 'SUB'
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    SUB
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioMode('DUB')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      audioMode === 'DUB'
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    DUB
                  </button>
                </div>

                {/* Source Mode Toggle: Direct Player vs Iframe Embed */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setStreamSource('direct')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      streamSource === 'direct'
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Direct Player
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamSource('embed')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      streamSource === 'embed'
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Iframe Embed
                  </button>
                </div>
              </div>

              {/* Previous / Next Episode Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={handlePrevEpisode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    hasPrevious
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer shadow-sm'
                      : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Episode</span>
                </button>

                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={handleNextEpisode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    hasNext
                      ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 cursor-pointer shadow-lg shadow-violet-600/25'
                      : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span>Next Episode</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Anime Info & Synopsis Card */}
            <div className="mt-5 p-6 bg-[#14151a] rounded-2xl border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {anime.title}
                  </h1>
                  <p className="text-sm font-semibold text-violet-400 mt-1">
                    {currentSeasonData.title} &bull; Episode {episode.number}: {episode.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-emerald-400">
                    Score: {anime.score}
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-300">
                    {anime.year}
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-violet-300">
                    {anime.quality}
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
                {episode.synopsis || anime.synopsis}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-zinc-800/80">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Episode Selection Sidebar */}
          <div
            className={`transition-all duration-300 ${
              isTheaterMode ? 'hidden' : 'lg:col-span-4 xl:col-span-3'
            }`}
          >
            <div className="bg-[#14151a] rounded-2xl border border-zinc-800 overflow-hidden sticky top-20 shadow-xl flex flex-col max-h-[calc(100vh-100px)]">
              {/* Sidebar Header */}
              <div className="p-4 bg-[#0f1014] border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-violet-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Episodes
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-bold">
                    {episodesList.length} Total
                  </span>
                </div>

                {/* Season Selector Tabs (if multiple seasons) */}
                {availableSeasons.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
                    {availableSeasons.map((season) => (
                      <button
                        key={season.seasonNumber}
                        type="button"
                        onClick={() => setSelectedSeason(season.seasonNumber)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedSeason === season.seasonNumber
                            ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Season {season.seasonNumber}
                      </button>
                    ))}
                  </div>
                )}

                {/* Episode Quick Filter Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search episode # or title..."
                    value={episodeSearchQuery}
                    onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Episode List Scroll Container */}
              <div className="overflow-y-auto divide-y divide-zinc-800/60 p-2 space-y-1.5">
                {filteredEpisodes.map((ep) => {
                  const isActive =
                    (ep.id === episode.id || ep.number === episode.number) &&
                    selectedSeason === (seasonNumber || 1);

                  const realEp = jikanEpisodes.find((r) => r.mal_id === ep.number);

                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => onSelectEpisode(ep, selectedSeason)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-violet-950/40 border-violet-500/80 shadow-md shadow-violet-900/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-transparent hover:border-zinc-700/80'
                      }`}
                    >
                      {/* Episode Number Badge */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isActive
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/40'
                            : 'bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700'
                        }`}
                      >
                        {isActive ? <Play className="w-3.5 h-3.5 fill-white" /> : ep.number}
                      </div>

                      {/* Episode Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive
                                ? 'text-violet-300'
                                : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            Episode {ep.number}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {ep.duration || '24:00'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {realEp?.title || ep.title}
                        </p>
                      </div>

                      {/* Active Status Indicator */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {filteredEpisodes.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No episodes found matching "{episodeSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
