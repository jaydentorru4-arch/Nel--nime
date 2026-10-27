import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  VolumeX,
  Shield,
  Clock,
  Flame,
  Radio,
  Lock,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types/anime';
import {
  loadChatMessages,
  saveChatMessages,
  filterChatText,
  SHOP_ITEMS,
} from '../services/userService';

interface GlobalChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentUser: UserProfile;
  onOpenPublicProfile: (user: Partial<UserProfile>) => void;
  onAddXP: (amount: number) => void;
  onUpdateCurrentUser: (profile: Partial<UserProfile>) => void;
}

const SIMULATED_CHATTER_NAMES = [
  'GojoSensei',
  'TanjiroBlade',
  'MikasaAcker',
  'ZenitsuFlash',
  'SungJinwoo',
  'LeviHeichou',
  'MegumiShadow',
];

const SIMULATED_MESSAGES = [
  'Who else is hyped for the upcoming Solo Leveling arc?!',
  'The animation quality in modern shonen is getting out of hand!',
  'Just finished rewatching Attack on Titan. Masterpiece.',
  'Pro tip: claim the 24h daily streak reward in the top bar for easy Nel Coins!',
  'Demon Slayer infinity castle movie trilogy is going to break box office records.',
  'Anyone have recommendations similar to Jujutsu Kaisen?',
];

export const GlobalChatDrawer: React.FC<GlobalChatDrawerProps> = ({
  isOpen,
  onToggle,
  currentUser,
  onOpenPublicProfile,
  onAddXP,
  onUpdateCurrentUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages());
  const [inputText, setInputText] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [spamWarning, setSpamWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if current user is muted or banned
  const isMuted =
    currentUser.chatMutedUntil && new Date(currentUser.chatMutedUntil).getTime() > Date.now();
  const isBanned = currentUser.isBanned;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Periodic simulated community chatter (every 22 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomName =
        SIMULATED_CHATTER_NAMES[Math.floor(Math.random() * SIMULATED_CHATTER_NAMES.length)];
      const randomMsg =
        SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];

      const newMsg: ChatMessage = {
        id: `sim-${Date.now()}`,
        userId: `bot-${randomName.toLowerCase()}`,
        userName: randomName,
        userAvatar: `https://images.unsplash.com/photo-${1534528741775 + (Math.floor(Math.random() * 100))}?w=120&q=80`,
        text: randomMsg,
        timestamp: 'Just now',
        role: randomName === 'GojoSensei' ? 'VIP' : 'Member',
        level: Math.floor(Math.random() * 20) + 3,
        frame: 'frame-neon-violet',
        badge: randomName === 'GojoSensei' ? 'VIP' : undefined,
      };

      setMessages((prev) => {
        const next = [...prev, newMsg];
        saveChatMessages(next);
        return next;
      });
    }, 24000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSpamWarning(null);

    if (!inputText.trim()) return;

    if (isBanned) {
      setSpamWarning('Your account is banned and cannot send messages.');
      return;
    }

    if (isMuted) {
      setSpamWarning('You are currently muted from chat by an Administrator.');
      return;
    }

    // Anti-spam rule: at least 1.5s between messages
    const now = Date.now();
    if (now - lastMessageTime < 1500) {
      setSpamWarning('Please slow down! Anti-spam cooldown active.');
      return;
    }
    setLastMessageTime(now);

    // Auto-filter profanity
    const cleanText = filterChatText(inputText.trim());

    // Create user chat message
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username,
      userAvatar: currentUser.avatar,
      text: cleanText,
      timestamp: 'Just now',
      role: currentUser.role,
      level: currentUser.level,
      frame: currentUser.equippedFrame,
      nameColor: currentUser.equippedNameColor,
      badge: currentUser.equippedBadge || (currentUser.isAdmin ? 'ADMIN' : undefined),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveChatMessages(updated);
    setInputText('');

    // Award +5 XP for chatting!
    onAddXP(5);
    onUpdateCurrentUser({ chatCount: (currentUser.chatCount || 0) + 1 });
  };

  // Helper to get frame CSS
  const getFrameClass = (frameId?: string | null) => {
    if (!frameId) return '';
    const item = SHOP_ITEMS.find((s) => s.id === frameId);
    return item?.previewClass || '';
  };

  // Helper to get name color CSS
  const getNameColorClass = (colorId?: string | null) => {
    if (!colorId) return 'text-zinc-200';
    const item = SHOP_ITEMS.find((s) => s.id === colorId);
    return item?.previewClass || 'text-zinc-200';
  };

  return (
    <>
      {/* Floating Toggle Button (if drawer closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-xl shadow-violet-600/40 hover:scale-105 transition-all cursor-pointer flex items-center gap-2.5 border border-violet-400/40"
          title="Open Global Live Chat"
        >
          <MessageSquare className="w-5 h-5 fill-white" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            Global Chat
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </button>
      )}

      {/* Drawer Overlay Backdrop on Mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Persistent / Collapsible Chat Drawer Container */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-full sm:w-96 bg-[#111217]/95 border-l border-zinc-800/80 backdrop-blur-2xl z-40 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Drawer Header */}
        <div className="px-4 py-3.5 bg-[#0c0d10] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Global Chat
                </h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">+5 XP earned per message</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m) => {
            // System Broadcast styling
            if (m.isSystemBroadcast) {
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-violet-950/80 via-fuchsia-950/70 to-zinc-900 border border-violet-500/50 shadow-lg text-center space-y-1 my-2"
                >
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-violet-300 uppercase tracking-widest">
                    <Shield className="w-3.5 h-3.5 text-violet-400" />
                    <span>[SYSTEM BROADCAST]</span>
                  </div>
                  <p className="text-xs text-white font-medium leading-relaxed">{m.text}</p>
                  <span className="text-[10px] text-zinc-400 font-mono block">{m.timestamp}</span>
                </div>
              );
            }

            const frameClass = getFrameClass(m.frame);
            const nameColorClass = getNameColorClass(m.nameColor);

            return (
              <div
                key={m.id}
                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-800/40 transition-colors"
              >
                {/* Avatar with equipped decoration frame */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenPublicProfile({
                      id: m.userId,
                      username: m.userName,
                      avatar: m.userAvatar,
                      level: m.level,
                      role: m.role,
                      equippedFrame: m.frame,
                      equippedBadge: m.badge,
                    })
                  }
                  className="relative flex-shrink-0 cursor-pointer focus:outline-none"
                  title="Click to view public profile"
                >
                  <img
                    src={m.userAvatar}
                    alt={m.userName}
                    className={`w-8 h-8 rounded-full object-cover ${frameClass}`}
                  />
                  <div className="absolute -bottom-1 -right-1 px-1 rounded-sm bg-zinc-950 border border-zinc-700 text-[9px] font-black text-violet-300">
                    {m.level}
                  </div>
                </button>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Role / Badges */}
                    {m.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.2 rounded bg-violet-600 text-[9px] font-black text-white uppercase tracking-wider">
                        [ADMIN]
                      </span>
                    )}
                    {m.role === 'VIP' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-[9px] font-black text-black uppercase">
                        [VIP]
                      </span>
                    )}
                    {m.badge && m.role !== 'ADMIN' && m.role !== 'VIP' && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[9px] font-bold uppercase">
                        [{m.badge}]
                      </span>
                    )}

                    {/* Username clickable for public profile */}
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPublicProfile({
                          id: m.userId,
                          username: m.userName,
                          avatar: m.userAvatar,
                          level: m.level,
                          role: m.role,
                          equippedFrame: m.frame,
                          equippedBadge: m.badge,
                        })
                      }
                      className={`font-bold hover:underline cursor-pointer truncate max-w-[130px] ${nameColorClass}`}
                    >
                      {m.userName}
                    </button>

                    <span className="text-[10px] text-zinc-500 ml-auto font-mono">
                      {m.timestamp}
                    </span>
                  </div>

                  <p className="text-zinc-200 mt-1 break-words leading-relaxed text-[11px] sm:text-xs">
                    {m.text}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Spam or Mute Warning Banner */}
        {spamWarning && (
          <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-800 text-[11px] text-rose-300 flex items-center justify-between">
            <span>{spamWarning}</span>
            <button onClick={() => setSpamWarning(null)} className="text-rose-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Muted indicator banner */}
        {isMuted && (
          <div className="px-4 py-2 bg-purple-950/90 border-t border-purple-800 text-[11px] text-purple-200 flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>You are muted by Admin until {new Date(currentUser.chatMutedUntil!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>
          </div>
        )}

        {/* Input Box Footer */}
        <div className="p-3 bg-[#0c0d10] border-t border-zinc-800/80">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              disabled={isMuted || isBanned}
              placeholder={
                isBanned
                  ? 'Account banned from chat'
                  : isMuted
                  ? 'You are muted by Admin'
                  : 'Message community (+5 XP)...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700/80 focus:border-violet-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isMuted || isBanned || !inputText.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-violet-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
