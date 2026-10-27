import React, { useState } from 'react';
import { Play, Tv, Shield, Film, Flame, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnterClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080a] text-white overflow-hidden transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Cyber Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glassmorphic Central Card */}
      <div className="relative z-10 max-w-xl mx-4 p-8 sm:p-12 rounded-3xl bg-zinc-900/40 border border-violet-500/30 backdrop-blur-2xl shadow-[0_0_80px_rgba(139,92,246,0.25)] flex flex-col items-center text-center">
        {/* Glowing Logo Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-600/50 ring-4 ring-violet-500/30 animate-bounce duration-1000">
            <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white text-white ml-1" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-violet-500/30 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Glowing Animated Typography "Nel Anime" */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            NEL
          </span>{' '}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.7)]">
            ANIME
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-md font-medium leading-relaxed mb-6">
          Next-generation anime streaming experience with real-time global chat, leveling progression, and a customizable otaku economy.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-[11px] font-semibold text-violet-300 flex items-center gap-1.5 backdrop-blur-md">
            <Tv className="w-3.5 h-3.5" />
            1080p Ultra HD Streams
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5 backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Live Global Community
          </span>
          <span className="px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/40 text-[11px] font-semibold text-fuchsia-300 flex items-center gap-1.5 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-fuchsia-400" />
            Nel Coins & Shop
          </span>
        </div>

        {/* Prominent Glowing "ENTER" Button */}
        <button
          type="button"
          onClick={handleEnterClick}
          className="group relative w-full sm:w-64 py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-base tracking-wider uppercase transition-all duration-300 shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-violet-400/50"
        >
          <span>Enter Dashboard</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <span className="text-[11px] text-zinc-400 mt-4 tracking-wide">
          Glassmorphic v2.5 &bull; No Ads &bull; Free Worldwide Streaming
        </span>
      </div>
    </div>
  );
};
