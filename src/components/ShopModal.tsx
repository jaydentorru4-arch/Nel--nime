import React, { useState } from 'react';
import {
  X,
  Coins,
  Check,
  CheckCircle,
  Tag,
  ShoppingBag,
  SlidersHorizontal,
  Flame,
  Shield,
  Palette,
} from 'lucide-react';
import { UserProfile, ShopItem } from '../types/anime';
import { SHOP_ITEMS } from '../services/userService';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateCurrentUser: (profile: Partial<UserProfile>) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'frame' | 'banner' | 'badge' | 'color'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const isItemOwned = (itemId: string) => {
    return currentUser.inventory?.includes(itemId) || false;
  };

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'frame') return currentUser.equippedFrame === item.id;
    if (item.category === 'banner') return currentUser.equippedBanner === item.id;
    if (item.category === 'badge') return currentUser.equippedBadge === (item.badgeTag || item.id);
    if (item.category === 'color') return currentUser.equippedNameColor === item.id;
    return false;
  };

  const handlePurchase = (item: ShopItem) => {
    if (currentUser.nelCoins < item.price) {
      showToast('Insufficient Nel Coins! Watch episodes or claim daily rewards to earn more.');
      return;
    }

    const nextCoins = currentUser.nelCoins - item.price;
    const nextInventory = [...(currentUser.inventory || []), item.id];

    onUpdateCurrentUser({
      nelCoins: nextCoins,
      inventory: nextInventory,
    });

    showToast(`Purchased ${item.name}! Added to your inventory.`);
  };

  const handleEquip = (item: ShopItem) => {
    if (!isItemOwned(item.id)) return;

    if (item.category === 'frame') {
      onUpdateCurrentUser({ equippedFrame: item.id });
    } else if (item.category === 'banner') {
      onUpdateCurrentUser({ equippedBanner: item.id });
    } else if (item.category === 'badge') {
      onUpdateCurrentUser({ equippedBadge: item.badgeTag || item.id });
    } else if (item.category === 'color') {
      onUpdateCurrentUser({ equippedNameColor: item.id });
    }

    showToast(`Equipped ${item.name}!`);
  };

  const handleUnequip = (item: ShopItem) => {
    if (item.category === 'frame') {
      onUpdateCurrentUser({ equippedFrame: null });
    } else if (item.category === 'banner') {
      onUpdateCurrentUser({ equippedBanner: null });
    } else if (item.category === 'badge') {
      onUpdateCurrentUser({ equippedBadge: null });
    } else if (item.category === 'color') {
      onUpdateCurrentUser({ equippedNameColor: null });
    }

    showToast(`Unequipped ${item.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#14151a] rounded-3xl border border-violet-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0f1014] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Nel Customization Shop</h2>
              <p className="text-xs text-zinc-400">
                Decorate your profile, avatar, chat rank, and username colors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Balance Display */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm">
              <Coins className="w-4 h-4 fill-amber-400" />
              <span>{currentUser.nelCoins} Nel Coins</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 bg-[#0f1014] border-b border-zinc-800 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            All Items ({SHOP_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('frame')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'frame'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Avatar Frames
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('banner')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'banner'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Profile Banners
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('badge')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'badge'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Chat Badges
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('color')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'color'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Name Colors
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const owned = isItemOwned(item.id);
            const equipped = isItemEquipped(item);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  equipped
                    ? 'bg-violet-950/40 border-violet-500/80 shadow-lg shadow-violet-950/40'
                    : owned
                    ? 'bg-zinc-900/80 border-zinc-700/80'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Visual Preview */}
                <div className="relative h-28 rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden flex items-center justify-center mb-3">
                  {item.category === 'banner' && item.previewUrl && (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {item.category === 'frame' && (
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt="Preview"
                        className={`w-14 h-14 rounded-full object-cover ${item.previewClass}`}
                      />
                    </div>
                  )}

                  {item.category === 'badge' && item.badgeTag && (
                    <span className={`px-3 py-1 rounded-lg text-xs ${item.previewClass}`}>
                      [{item.badgeTag}]
                    </span>
                  )}

                  {item.category === 'color' && (
                    <span className={`text-base font-black ${item.previewClass}`}>
                      {currentUser.username}
                    </span>
                  )}

                  {equipped && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-violet-600 text-white text-[10px] font-bold">
                      EQUIPPED
                    </div>
                  )}
                  {owned && !equipped && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700">
                      OWNED
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-violet-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Coins className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.price} Coins</span>
                  </div>

                  {equipped ? (
                    <button
                      type="button"
                      onClick={() => handleUnequip(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Unequip
                    </button>
                  ) : owned ? (
                    <button
                      type="button"
                      onClick={() => handleEquip(item)}
                      className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-violet-600/30"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchase(item)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-violet-600/25 flex items-center gap-1"
                    >
                      <span>Buy</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="absolute bottom-4 right-6 px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-xl animate-in fade-in duration-150 z-30">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
