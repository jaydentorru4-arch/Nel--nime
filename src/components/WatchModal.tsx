import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Tv,
  Check,
  Radio,
  SlidersHorizontal,
  RefreshCw,
  Film,
} from 'lucide-react';
import { Anime, Episode } from '../types/anime';
import {
  SAMPLE_VIDEO_STREAMS,
  fetchEpisodeStreamEmbed,
  getJikanEpisodes,
  JikanEpisodeItem,
} from '../services/jikanService';

interface WatchModalProps {
  anime: Anime;
  episode: Episode;
  isOpen: boolean;
  onClose: () => void;
  onSelectEpisode: (ep: Episode) => void;
  onOpenFullPage?: () => void;
}

export const WatchModal: React.FC<WatchModalProps> = ({
  anime,
  episode,
  isOpen,
  onClose,
  onSelectEpisode,
  onOpenFullPage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player mode: 'video' (Direct HTML5 <video>) | 'iframe' (Embedded streaming player)
  const [playerMode, setPlayerMode] = useState<'video' | 'iframe'>('video');
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [audioTrack, setAudioTrack] = useState<'SUB' | 'DUB'>('SUB');

  // Dynamic streaming URLs resolved via fetch()
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
    episode.videoUrl || SAMPLE_VIDEO_STREAMS[0].url
  );
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>(
    episode.embedUrl ||
      anime.trailerEmbedUrl ||
      'https://www.youtube-nocookie.com/embed/9Zfvhv11rIY?autoplay=1&playsinline=1'
  );

  // Fetched real episodes list from API
  const [realEpisodes, setRealEpisodes] = useState<JikanEpisodeItem[]>([]);
  const [isFetchingEpisodeData, setIsFetchingEpisodeData] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1455);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Loading & Error states
  // Requirement 3: Show a "Loading..." animation while the video embed is loading.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Requirement 4: Display fallback message ("Video currently unavailable, try another source") if a video link fails to load.
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto-hide controls timer
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Available episodes list (from props or anime model)
  const episodeList = anime.episodes && anime.episodes.length > 0 ? anime.episodes : [episode];
  const currentIndex = episodeList.findIndex(
    (ep) => ep.id === episode.id || ep.number === episode.number
  );
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < episodeList.length - 1;

  // 1. Fetch real anime episode numbers & streaming embeds via fetch() whenever episode changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setIsFetchingEpisodeData(true);

    async function loadEpisodeStreams() {
      try {
        // Fetch streaming embeds & direct URLs dynamically via JavaScript fetch()
        const streamData = await fetchEpisodeStreamEmbed(anime, episode.number);
        if (isMounted) {
          if (streamData.embedUrl) {
            setCurrentEmbedUrl(streamData.embedUrl);
          }
          if (streamData.directVideoUrl) {
            setCurrentVideoUrl(streamData.directVideoUrl);
          }
        }

        // Fetch real episode titles from Jikan if not loaded yet
        const malId = parseInt(anime.id.replace(/[^0-9]/g, ''), 10) || 151807;
        const eps = await getJikanEpisodes(malId);
        if (isMounted && eps && eps.length > 0) {
          setRealEpisodes(eps);
        }
      } catch (err) {
        console.warn('Episode stream fetch fallback:', err);
      } finally {
        if (isMounted) {
          setIsFetchingEpisodeData(false);
        }
      }
    }

    loadEpisodeStreams();

    return () => {
      isMounted = false;
    };
  }, [anime.id, episode.number, isOpen]);

  // Handle Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.key === 'ArrowRight') {
        seekRelative(10);
      } else if (e.key === 'ArrowLeft') {
        seekRelative(-10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);

  // Video element setup & play handling
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    if (playerMode === 'video' && videoRef.current) {
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
            // Autoplay policies: Mute and re-attempt
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
    } else if (playerMode === 'iframe') {
      // For iframe embeds, set loading state and auto-clear on load
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [playerMode, currentVideoUrl, currentEmbedUrl, selectedQuality, isOpen, episode.number]);

  // Controls auto-hide timer
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
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 1455, videoRef.current.currentTime + seconds)
    );
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {
        (videoRef.current as any)?.webkitEnterFullscreen?.();
      });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 85);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevious) {
      onSelectEpisode(episodeList[currentIndex - 1]);
    }
  };

  const handleNextEpisode = () => {
    if (hasNext) {
      onSelectEpisode(episodeList[currentIndex + 1]);
    }
  };

  // Switch to alternate quality stream
  const handleQualityChange = (q: string) => {
    setSelectedQuality(q);
    const stream = SAMPLE_VIDEO_STREAMS.find((s) => s.quality === q);
    if (stream) {
      setCurrentVideoUrl(stream.url);
      setHasError(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl bg-[#14151a] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Header Bar inside Modal */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f1014] border-b border-zinc-800 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-bold uppercase tracking-wider">
              <Tv className="w-3.5 h-3.5" />
              Now Streaming
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {anime.title}
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                Episode {episode.number}: {episode.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Player Type: Direct Video vs Iframe Embed */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPlayerMode('video')}
                className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                  playerMode === 'video'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="HTML5 Video Player"
              >
                Direct Player
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('iframe')}
                className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                  playerMode === 'iframe'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Embedded Streaming Player"
              >
                Iframe Embed
              </button>
            </div>

            {/* Audio Toggle: SUB / DUB */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setAudioTrack('SUB')}
                className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                  audioTrack === 'SUB'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                SUB
              </button>
              <button
                type="button"
                onClick={() => setAudioTrack('DUB')}
                className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                  audioTrack === 'DUB'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DUB
              </button>
            </div>

            {/* Expand to Full Page Layout */}
            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-all cursor-pointer"
                title="Open complete video player page"
              >
                <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
                Full Page
              </button>
            )}

            {/* CLOSE BUTTON (X) - Prominent & Functional */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close video player"
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-600/90 hover:text-white text-zinc-400 border border-zinc-700 transition-all cursor-pointer group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Requirement 2: Load an iframe player or video player whenever a user selects an episode */}
          {playerMode === 'video' ? (
            <video
              ref={videoRef}
              src={currentVideoUrl}
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

          {/* Requirement 3: Show a "Loading..." animation while the video embed is loading */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs pointer-events-none z-20">
              <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <span className="mt-3 text-xs font-semibold text-zinc-200 tracking-wider uppercase animate-pulse">
                Loading stream...
              </span>
              <span className="text-[11px] text-zinc-400 mt-1">
                Fetching episode {episode.number} audio & video frames
              </span>
            </div>
          )}

          {/* Requirement 4: Display a fallback message ("Video currently unavailable, try another source") if a video link fails to load */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/92 p-6 z-25 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                Video currently unavailable, try another source
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">
                The current stream source encountered an issue. You can instantly switch between the HTML5 video player, official embed, or alternative mirror qualities below.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    setPlayerMode(playerMode === 'video' ? 'iframe' : 'video');
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch to {playerMode === 'video' ? 'Iframe Embed' : 'Direct Video'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    handleQualityChange(selectedQuality === '1080p' ? '720p' : '1080p');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                >
                  Try Alternate Quality
                </button>
              </div>
            </div>
          )}

          {/* Unmuted Audio helper overlay if initial autoplay was muted */}
          {isMuted && isPlaying && playerMode === 'video' && (
            <div className="absolute top-4 left-4 z-20">
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-semibold shadow-lg backdrop-blur-sm cursor-pointer animate-pulse"
              >
                <VolumeX className="w-4 h-4" />
                Tap to Unmute Audio
              </button>
            </div>
          )}

          {/* Skip Intro Floating Action */}
          {playerMode === 'video' && currentTime > 15 && currentTime < 120 && (
            <button
              type="button"
              onClick={handleSkipIntro}
              className="absolute bottom-16 right-4 z-25 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-violet-600 text-zinc-100 border border-zinc-700/80 hover:border-violet-500 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <FastForward className="w-3.5 h-3.5" />
              Skip Intro (+85s)
            </button>
          )}

          {/* Custom HTML5 Overlay Controls (Video Mode) */}
          {playerMode === 'video' && (
            <div
              className={`absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-300 pointer-events-none ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Controls: Quality & Server Selector */}
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-zinc-800 text-[11px] font-semibold text-violet-300">
                    Direct HTML5 Player
                  </span>
                </div>

                {/* Quality Selector */}
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md border border-zinc-800 rounded-lg p-0.5 text-xs">
                  <SlidersHorizontal className="w-3 h-3 text-zinc-400 ml-1.5 mr-0.5" />
                  {(['1080p', '720p', '480p'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQualityChange(q)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        selectedQuality === q
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Scrubber & HUD Controls */}
              <div className="space-y-2 pointer-events-auto">
                {/* Timeline Progress Scrubber */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-300 min-w-[38px]">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:h-2 transition-all"
                  />
                  <span className="text-[11px] font-mono text-zinc-400 min-w-[38px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                      title="Play / Pause"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    {/* Rewind 10s */}
                    <button
                      type="button"
                      onClick={() => seekRelative(-10)}
                      className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Forward 10s */}
                    <button
                      type="button"
                      onClick={() => seekRelative(10)}
                      className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-2 group">
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
                        className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                  </div>

                  {/* Right Actions: Next/Prev & Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!hasPrevious}
                      onClick={handlePrevEpisode}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        hasPrevious
                          ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 hover:bg-zinc-700 cursor-pointer'
                          : 'bg-zinc-900 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    <button
                      type="button"
                      disabled={!hasNext}
                      onClick={handleNextEpisode}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        hasNext
                          ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 cursor-pointer'
                          : 'bg-zinc-900 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer ml-1"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer: Quick Episode Navigation & Jikan Enriched Episode Data */}
        <div className="p-3 bg-[#0f1014] border-t border-zinc-800/80 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-violet-400" />
              Episodes ({episodeList.length})
            </span>
            <span className="text-[11px] text-zinc-400">
              Click any episode to load video stream or embed immediately
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {episodeList.slice(0, 24).map((ep) => {
              const isActive = ep.id === episode.id || ep.number === episode.number;
              const matchedRealEp = realEpisodes.find((r) => r.mal_id === ep.number);

              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => onSelectEpisode(ep)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                  title={matchedRealEp?.title || ep.title}
                >
                  {isActive && <Check className="w-3 h-3" />}
                  <span>Ep {ep.number}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
