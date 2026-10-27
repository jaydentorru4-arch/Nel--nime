import React from 'react';
import { X, Coins, CheckCircle, Lock, Calendar, Zap } from 'lucide-react';
import { UserProfile } from '../types/anime';
import {
  DAILY_STREAK_REWARDS,
  canClaimDailyReward,
} from '../services/userService';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onClaimReward: (coinAmount: number, xpAmount: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const currentStreak = currentUser.dailyStreak || 0;
  const canClaim = canClaimDailyReward(currentUser.lastDailyRewardDate);
  const nextDayIndex = currentStreak % 7;
  const todayRewardAmount = DAILY_STREAK_REWARDS[nextDayIndex];

  const handleClaim = () => {
    if (!canClaim) return;
    onClaimReward(todayRewardAmount, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900/90 rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Daily Rewards Streak</h2>
            <p className="text-xs text-zinc-400">Claim daily bonus Nel Coins & XP every 24 hours</p>
          </div>
        </div>

        {/* Current Streak Status */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Current Streak
              </span>
              <span className="text-lg font-black text-white">{currentStreak} Consecutive Days</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 block">Today's Reward</span>
            <span className="text-base font-black text-amber-400">+{todayRewardAmount} Coins</span>
          </div>
        </div>

        {/* 7-Day Streak Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {DAILY_STREAK_REWARDS.map((coins, index) => {
            const dayNum = index + 1;
            const isClaimed = index < nextDayIndex && !canClaim;
            const isToday = index === nextDayIndex && canClaim;
            const isLocked = index > nextDayIndex || (index === nextDayIndex && !canClaim);

            return (
              <div
                key={dayNum}
                className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[90px] transition-all ${
                  isToday
                    ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/30 animate-pulse'
                    : isClaimed
                    ? 'bg-zinc-950/80 border-emerald-500/40 opacity-80'
                    : 'bg-zinc-950/50 border-zinc-800'
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Day {dayNum}</span>
                <Coins
                  className={`w-4 h-4 my-1 ${
                    isToday ? 'text-amber-400' : isClaimed ? 'text-emerald-400' : 'text-zinc-600'
                  }`}
                />
                <span className="text-xs font-black text-white">+{coins}</span>
                {isClaimed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
                {isLocked && <Lock className="w-3 h-3 text-zinc-600 mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <button
          type="button"
          disabled={!canClaim}
          onClick={handleClaim}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
            canClaim
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/40 hover:scale-102 active:scale-98'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{canClaim ? `Claim +${todayRewardAmount} Nel Coins & +50 XP` : 'Next Reward in 24 Hours'}</span>
        </button>
      </div>
    </div>
  );
};
