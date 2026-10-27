import React from 'react';
import { X, UserPlus, Shield, Tv, MessageSquare, Check, Coins } from 'lucide-react';
import { UserProfile } from '../types/anime';
import { SHOP_ITEMS } from '../services/userService';

interface PublicProfileModalProps {
  user: Partial<UserProfile> | null;
  onClose: () => void;
  onSendFriendRequest: (user: Partial<UserProfile>) => void;
  isAlreadyFriend: boolean;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  user,
  onClose,
  onSendFriendRequest,
  isAlreadyFriend,
}) => {
  if (!user) return null;

  const frameItem = SHOP_ITEMS.find((s) => s.id === user.equippedFrame);
  const frameClass = frameItem?.previewClass || '';

  const bannerItem = SHOP_ITEMS.find((s) => s.id === user.equippedBanner);
  const bannerUrl =
    bannerItem?.previewUrl ||
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Banner Area */}
        <div className="relative h-36 w-full bg-zinc-950 overflow-hidden">
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 -mt-12 relative z-10 space-y-4">
          <div className="flex items-end justify-between">
            {/* Avatar with Frame */}
            <div className="relative">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
                }
                alt={user.username}
                className={`w-20 h-20 rounded-2xl object-cover bg-zinc-900 ${frameClass}`}
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-violet-600 text-white font-black text-xs shadow-md">
                Lvl {user.level || 1}
              </span>
            </div>

            {/* Friend Action */}
            <div>
              {isAlreadyFriend ? (
                <span className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Friends
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSendFriendRequest(user)}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Friend</span>
                </button>
              )}
            </div>
          </div>

          {/* Username & Badges */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{user.username}</h3>
              {user.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-md bg-violet-600 text-white font-black text-[10px] uppercase">
                  [ADMIN]
                </span>
              )}
              {user.equippedBadge && user.role !== 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700 font-bold text-[10px]">
                  [{user.equippedBadge}]
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {user.bio || 'Anime enthusiast & community member on Nel Anime.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-2.5">
              <Tv className="w-4 h-4 text-violet-400" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Episodes Watched
                </span>
                <span className="text-sm font-black text-white">
                  {user.episodesWatched || Math.floor((user.level || 1) * 3.5)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-fuchsia-400" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Chat Activity
                </span>
                <span className="text-sm font-black text-white">
                  {user.chatCount || Math.floor((user.level || 1) * 2)} Messages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
