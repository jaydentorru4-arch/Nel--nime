import React from 'react';
import { X, Trophy, Coins, Zap, Check, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  bonusCoins?: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  bonusCoins = 100,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-zinc-900/95 rounded-3xl border border-violet-500/60 p-6 sm:p-8 shadow-[0_0_80px_rgba(139,92,246,0.5)] backdrop-blur-2xl text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level Up Trophy / Badge Icon */}
        <div className="relative mb-4 mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-600/60 ring-4 ring-violet-500/30 animate-bounce duration-1000">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-violet-500/30 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Heading */}
        <span className="text-xs font-black uppercase tracking-widest text-violet-400 mb-1">
          Rank Promotion
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          LEVEL UP!
        </h2>
        <p className="text-xs text-zinc-300 mt-1">
          You have ascended to <strong className="text-violet-400 font-bold">Level {newLevel}</strong>
        </p>

        {/* Level Transition Pill */}
        <div className="my-5 flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-violet-950/50 border border-violet-500/40">
          <span className="text-lg font-bold text-zinc-400">Lvl {newLevel - 1}</span>
          <ArrowRight className="w-4 h-4 text-violet-400" />
          <span className="text-2xl font-black text-white bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Lvl {newLevel}
          </span>
        </div>

        {/* Reward Bonus Pill */}
        <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 mb-6 text-amber-300 font-bold text-sm">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>Reward: +{bonusCoins} Nel Coins</span>
        </div>

        {/* Claim / Continue Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl shadow-violet-600/40 hover:scale-102 active:scale-98 cursor-pointer"
        >
          Claim Promotion
        </button>
      </div>
    </div>
  );
};
