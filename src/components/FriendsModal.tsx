import React, { useState } from 'react';
import { X, Users, UserPlus, Check, UserMinus, Eye, Radio } from 'lucide-react';
import { Friend, UserProfile } from '../types/anime';
import { SHOP_ITEMS } from '../services/userService';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onAddFriend: (username: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onOpenProfile: (user: Partial<UserProfile>) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  onAddFriend,
  onRemoveFriend,
  onOpenProfile,
}) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    onAddFriend(newFriendName.trim());
    setSuccessToast(`Friend request sent to ${newFriendName.trim()}!`);
    setNewFriendName('');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const getFrameClass = (frameId?: string) => {
    if (!frameId) return '';
    const item = SHOP_ITEMS.find((s) => s.id === frameId);
    return item?.previewClass || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14151a] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f1014] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/40 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Friends & Community</h2>
              <p className="text-xs text-zinc-400">
                {friends.length} anime companions &bull; {friends.filter((f) => f.status === 'online').length} online
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Friend Input Bar */}
        <div className="p-4 bg-zinc-950/50 border-b border-zinc-800">
          <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter username to send friend request..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!newFriendName.trim()}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {successToast && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">{successToast}</p>
          )}
        </div>

        {/* Friends List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {friends.map((friend) => {
            const frameClass = getFrameClass(friend.frame);

            return (
              <div
                key={friend.id}
                className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 transition-colors"
              >
                <div
                  onClick={() =>
                    onOpenProfile({
                      id: friend.id,
                      username: friend.username,
                      avatar: friend.avatar,
                      level: friend.level,
                      equippedBadge: friend.badge,
                      equippedFrame: friend.frame,
                    })
                  }
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      className={`w-10 h-10 rounded-full object-cover ${frameClass}`}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-zinc-950 ${
                        friend.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                        {friend.username}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] font-bold text-violet-300">
                        Lvl {friend.level}
                      </span>
                      {friend.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-bold">
                          [{friend.badge}]
                        </span>
                      )}
                    </div>
                    {friend.currentlyWatching && (
                      <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                        <Radio className="w-3 h-3 text-violet-400 flex-shrink-0" />
                        <span className="truncate">{friend.currentlyWatching}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProfile({
                        id: friend.id,
                        username: friend.username,
                        avatar: friend.avatar,
                        level: friend.level,
                        equippedBadge: friend.badge,
                        equippedFrame: friend.frame,
                      })
                    }
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="View Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFriend(friend.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove Friend"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {friends.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500">
              No friends added yet. Send requests using the bar above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
