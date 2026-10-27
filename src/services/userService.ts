import {
  UserProfile,
  ShopItem,
  ChatMessage,
  Friend,
  FriendRequest,
  BugReport,
} from '../types/anime';

export const MASTER_ADMIN_EMAIL = 'jaydentorru4@gmail.com';
export const MASTER_ADMIN_PASS = '1352467890jJ';

// Available Shop Items for Nel Shop
export const SHOP_ITEMS: ShopItem[] = [
  // PFP Frames / Decorations
  {
    id: 'frame-neon-violet',
    name: 'Neon Violet Ring',
    description: 'A vibrant pulsating violet electric energy ring around your avatar.',
    category: 'frame',
    price: 250,
    previewClass: 'ring-3 ring-violet-500 ring-offset-2 ring-offset-black shadow-lg shadow-violet-500/50',
  },
  {
    id: 'frame-shadow-monarch',
    name: 'Shadow Monarch Aura',
    description: 'Dark purple and black ethereal mist radiating dominant monarch power.',
    category: 'frame',
    price: 600,
    previewClass: 'ring-3 ring-purple-600 ring-offset-2 ring-offset-zinc-950 shadow-xl shadow-purple-900/80 animate-pulse',
  },
  {
    id: 'frame-crimson-flame',
    name: 'Nichirin Flame',
    description: 'Blazing crimson fire border inspired by Sun Breathing masters.',
    category: 'frame',
    price: 450,
    previewClass: 'ring-3 ring-rose-500 ring-offset-2 ring-offset-zinc-950 shadow-lg shadow-rose-600/60',
  },
  {
    id: 'frame-cyber-cyan',
    name: 'Cyberpunk Grid',
    description: 'High-tech translucent neon cyan holographic border.',
    category: 'frame',
    price: 350,
    previewClass: 'ring-3 ring-cyan-400 ring-offset-2 ring-offset-zinc-950 shadow-lg shadow-cyan-500/50',
  },
  {
    id: 'frame-golden-mythic',
    name: 'Golden Champion',
    description: 'Luxurious 24K pure gold border reserved for elite anime connoisseurs.',
    category: 'frame',
    price: 1200,
    previewClass: 'ring-3 ring-amber-400 ring-offset-2 ring-offset-zinc-950 shadow-xl shadow-amber-500/60',
  },

  // Profile Banners
  {
    id: 'banner-neo-tokyo',
    name: 'Neo Tokyo Rain',
    description: 'Cyberpunk drenched skyscraper panorama with neon kanji reflections.',
    category: 'banner',
    price: 400,
    previewUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80',
  },
  {
    id: 'banner-domain-expansion',
    name: 'Void Horizon',
    description: 'Deep cosmic void realm with infinite dimensional fractal waves.',
    category: 'banner',
    price: 500,
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
  },
  {
    id: 'banner-fuji-cherry',
    name: 'Mount Fuji Blossom',
    description: 'Serene twilight view of Mount Fuji surrounded by falling sakura petals.',
    category: 'banner',
    price: 300,
    previewUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  },
  {
    id: 'banner-shadow-gates',
    name: 'Dungeon Monarch Gate',
    description: 'Ominous S-rank blue gate erupting with ethereal shadow soldiers.',
    category: 'banner',
    price: 750,
    previewUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80',
  },

  // Chat Badges
  {
    id: 'badge-vip',
    name: '[VIP] Patron',
    description: 'Distinguished VIP tag displayed beside your name in Global Chat.',
    category: 'badge',
    price: 500,
    badgeTag: 'VIP',
    previewClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold',
  },
  {
    id: 'badge-monarch',
    name: '[MONARCH]',
    description: 'Legendary shadow sovereign rank badge in Global Chat.',
    category: 'badge',
    price: 800,
    badgeTag: 'MONARCH',
    previewClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-sm',
  },
  {
    id: 'badge-otaku',
    name: '[OTAKU PRIME]',
    description: 'Badge for true hardcore anime aficionados.',
    category: 'badge',
    price: 200,
    badgeTag: 'OTAKU',
    previewClass: 'bg-violet-950 text-violet-300 border border-violet-700 font-bold',
  },
  {
    id: 'badge-slayer',
    name: '[HASHIRA]',
    description: 'Elite swordmaster title with glowing red font.',
    category: 'badge',
    price: 650,
    badgeTag: 'HASHIRA',
    previewClass: 'bg-rose-950 text-rose-300 border border-rose-700 font-bold',
  },

  // Name Colors
  {
    id: 'color-neon-violet',
    name: 'Neon Violet Text',
    description: 'Display your username in glowing vibrant violet in Chat and Profile.',
    category: 'color',
    price: 150,
    colorHex: '#a855f7',
    previewClass: 'text-purple-400 font-bold',
  },
  {
    id: 'color-crimson-flame',
    name: 'Crimson Flame Text',
    description: 'Fiery blazing crimson color for your username.',
    category: 'color',
    price: 200,
    colorHex: '#f43f5e',
    previewClass: 'text-rose-400 font-bold',
  },
  {
    id: 'color-cyan-glow',
    name: 'Electric Cyan Text',
    description: 'Futuristic electric blue text highlight.',
    category: 'color',
    price: 180,
    colorHex: '#06b6d4',
    previewClass: 'text-cyan-400 font-bold',
  },
  {
    id: 'color-pure-gold',
    name: 'Imperial Gold Text',
    description: 'Opulent shimmering gold username typography.',
    category: 'color',
    price: 500,
    colorHex: '#eab308',
    previewClass: 'text-amber-300 font-bold',
  },
];

// Default initial guest/user profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_main',
  email: 'viewer@nelanime.tv',
  username: 'AnimeMaster',
  bio: 'Living one episode at a time. Shonen & dark fantasy enthusiast!',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  role: 'Member',
  isAdmin: false,
  nelCoins: 350,
  level: 1,
  xp: 45,
  episodesWatched: 6,
  chatCount: 4,
  lastDailyRewardDate: null,
  dailyStreak: 0,
  equippedFrame: 'frame-neon-violet',
  equippedBanner: 'banner-neo-tokyo',
  equippedNameColor: 'color-neon-violet',
  equippedBadge: null,
  inventory: ['frame-neon-violet', 'banner-neo-tokyo', 'color-neon-violet'],
  isBanned: false,
  suspendedUntil: null,
  chatMutedUntil: null,
};

// Initial simulated chat messages
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    userId: 'bot-1',
    userName: 'GojoSensei',
    userAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&q=80',
    text: 'That latest Jujutsu Kaisen episode animation was genuinely cinematic masterpiece!',
    timestamp: '2 mins ago',
    role: 'VIP',
    level: 14,
    frame: 'frame-shadow-monarch',
    badge: 'VIP',
    nameColor: 'color-cyan-glow',
  },
  {
    id: 'msg-2',
    userId: 'bot-2',
    userName: 'TanjiroBlade',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    text: 'Anyone started the new Solo Leveling season yet? Jinwoo goes absolutely insane!',
    timestamp: '1 min ago',
    role: 'Member',
    level: 8,
    frame: 'frame-crimson-flame',
    badge: 'HASHIRA',
    nameColor: 'color-crimson-flame',
  },
  {
    id: 'msg-3',
    userId: 'admin-broadcast',
    userName: 'SYSTEM',
    userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
    text: 'Welcome to Nel Anime! Claim your 24h streak Daily Rewards in the top bar to earn Nel Coins.',
    timestamp: 'Just now',
    role: 'ADMIN',
    level: 99,
    badge: 'ADMIN',
    isSystemBroadcast: true,
  },
];

// Initial Friends
export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f-1',
    username: 'GojoSensei',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&q=80',
    level: 14,
    status: 'online',
    currentlyWatching: 'Jujutsu Kaisen Season 2 Ep 9',
    badge: 'VIP',
    frame: 'frame-shadow-monarch',
  },
  {
    id: 'f-2',
    username: 'TanjiroBlade',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    level: 8,
    status: 'online',
    currentlyWatching: 'Demon Slayer Season 4 Ep 4',
    badge: 'HASHIRA',
    frame: 'frame-crimson-flame',
  },
  {
    id: 'f-3',
    username: 'MikasaAcker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    level: 21,
    status: 'offline',
    currentlyWatching: 'Attack on Titan Final Season',
    badge: 'MONARCH',
    frame: 'frame-golden-mythic',
  },
];

// Directory of all users for Admin Panel to manage
export const INITIAL_USER_DIRECTORY: UserProfile[] = [
  {
    ...DEFAULT_USER_PROFILE,
  },
  {
    id: 'user-jayden-admin',
    email: MASTER_ADMIN_EMAIL,
    username: 'Jayden [Owner]',
    bio: 'Founder and Lead Administrator of Nel Anime.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    role: 'ADMIN',
    isAdmin: true,
    nelCoins: 99999,
    level: 99,
    xp: 99999,
    episodesWatched: 120,
    chatCount: 85,
    lastDailyRewardDate: null,
    dailyStreak: 30,
    equippedFrame: 'frame-golden-mythic',
    equippedBanner: 'banner-domain-expansion',
    equippedNameColor: 'color-pure-gold',
    equippedBadge: 'ADMIN',
    inventory: ['frame-golden-mythic', 'banner-domain-expansion', 'color-pure-gold', 'badge-monarch'],
    isBanned: false,
    suspendedUntil: null,
    chatMutedUntil: null,
  },
  {
    id: 'user-spammer',
    email: 'troll@example.com',
    username: 'AnimeSpammer99',
    bio: 'Just posting random links everywhere.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    role: 'Member',
    isAdmin: false,
    nelCoins: 50,
    level: 2,
    xp: 60,
    episodesWatched: 1,
    chatCount: 42,
    lastDailyRewardDate: null,
    dailyStreak: 1,
    equippedFrame: null,
    equippedBanner: null,
    equippedNameColor: null,
    equippedBadge: null,
    inventory: [],
    isBanned: false,
    suspendedUntil: null,
    chatMutedUntil: null,
  },
];

// Helper storage functions
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem('nel_user_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure master admin check
      if (parsed.email === MASTER_ADMIN_EMAIL) {
        parsed.isAdmin = true;
        parsed.role = 'ADMIN';
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Error reading user profile from localStorage', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem('nel_user_profile', JSON.stringify(profile));
    // Also sync into directory
    const dir = loadUserDirectory();
    const updatedDir = dir.map((u) => (u.id === profile.id || u.email === profile.email ? profile : u));
    if (!updatedDir.some((u) => u.id === profile.id)) {
      updatedDir.push(profile);
    }
    saveUserDirectory(updatedDir);
  } catch (err) {
    console.warn('Error saving user profile to localStorage', err);
  }
}

export function loadUserDirectory(): UserProfile[] {
  try {
    const raw = localStorage.getItem('nel_user_directory');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error loading user directory', err);
  }
  return INITIAL_USER_DIRECTORY;
}

export function saveUserDirectory(users: UserProfile[]): void {
  try {
    localStorage.setItem('nel_user_directory', JSON.stringify(users));
  } catch (err) {
    console.warn('Error saving user directory', err);
  }
}

export function loadChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem('nel_chat_messages');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error loading chat messages', err);
  }
  return INITIAL_CHAT_MESSAGES;
}

export function saveChatMessages(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem('nel_chat_messages', JSON.stringify(msgs.slice(-100)));
  } catch (err) {
    console.warn('Error saving chat messages', err);
  }
}

export function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem('nel_friends');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error loading friends', err);
  }
  return INITIAL_FRIENDS;
}

export function saveFriends(friends: Friend[]): void {
  try {
    localStorage.setItem('nel_friends', JSON.stringify(friends));
  } catch (err) {
    console.warn('Error saving friends', err);
  }
}

export function loadBugReports(): BugReport[] {
  try {
    const raw = localStorage.getItem('nel_bug_reports');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error loading bug reports', err);
  }
  return [
    {
      id: 'bug-1',
      userId: 'user-sample',
      userName: 'AnimeFan99',
      category: 'Playback',
      description: 'Stream mirrored 720p audio was slightly delayed on episode 2.',
      timestamp: '1 hour ago',
      status: 'Pending',
    },
  ];
}

export function saveBugReports(reports: BugReport[]): void {
  try {
    localStorage.setItem('nel_bug_reports', JSON.stringify(reports));
  } catch (err) {
    console.warn('Error saving bug reports', err);
  }
}

// XP & Leveling logic
// Level n requires n * 100 XP
export function calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; xpForNextLevel: number; progressPercent: number } {
  let level = 1;
  let remainingXP = totalXP;
  let xpForNext = 100;

  while (remainingXP >= xpForNext) {
    remainingXP -= xpForNext;
    level += 1;
    xpForNext = level * 100;
  }

  const progressPercent = Math.min(100, Math.round((remainingXP / xpForNext) * 100));

  return {
    level,
    currentLevelXP: remainingXP,
    xpForNextLevel: xpForNext,
    progressPercent,
  };
}

// Daily Reward Streaks
export const DAILY_STREAK_REWARDS = [50, 100, 150, 200, 300, 450, 700];

export function canClaimDailyReward(lastClaimDate: string | null): boolean {
  if (!lastClaimDate) return true;
  const last = new Date(lastClaimDate).getTime();
  const now = Date.now();
  const diffHours = (now - last) / (1000 * 60 * 60);
  return diffHours >= 20; // 20 hours window for daily cadence
}

// Auto-filter inappropriate language in chat
const PROFANITY_LIST = ['spam', 'scam', 'badword', 'abuse', 'hate'];
export function filterChatText(input: string): string {
  let filtered = input;
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
}
