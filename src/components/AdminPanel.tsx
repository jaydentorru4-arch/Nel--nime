import React, { useState } from 'react';
import {
  X,
  Shield,
  UserX,
  Clock,
  VolumeX,
  Coins,
  Send,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Search,
  Filter,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { UserProfile, BugReport } from '../types/anime';
import {
  loadUserDirectory,
  saveUserDirectory,
  loadBugReports,
  saveBugReports,
} from '../services/userService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateCurrentUser: (profile: Partial<UserProfile>) => void;
  onSendBroadcast: (message: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  onSendBroadcast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'broadcast' | 'bugs' | 'economy'>('users');
  const [users, setUsers] = useState<UserProfile[]>(() => loadUserDirectory());
  const [bugReports, setBugReports] = useState<BugReport[]>(() => loadBugReports());

  // Search filter
  const [userSearch, setUserSearch] = useState('');

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Selected target user for actions
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [coinAmount, setCoinAmount] = useState<number>(500);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  // 1. Ban / Unban user
  const handleToggleBan = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextBanned = !u.isBanned;
        return { ...u, isBanned: nextBanned };
      }
      return u;
    });
    setUsers(updated);
    saveUserDirectory(updated);

    if (currentUser.id === userId) {
      onUpdateCurrentUser({ isBanned: !currentUser.isBanned });
    }
    showToast(`Updated ban status for user.`);
  };

  // 2. Suspend account
  const handleSuspend = (userId: string, hours: number) => {
    const suspendDate = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, suspendedUntil: suspendDate };
      }
      return u;
    });
    setUsers(updated);
    saveUserDirectory(updated);

    if (currentUser.id === userId) {
      onUpdateCurrentUser({ suspendedUntil: suspendDate });
    }
    showToast(`Account suspended for ${hours >= 24 ? `${hours / 24} day(s)` : `${hours} hour(s)`}.`);
  };

  const handleLiftSuspension = (userId: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, suspendedUntil: null } : u));
    setUsers(updated);
    saveUserDirectory(updated);
    if (currentUser.id === userId) {
      onUpdateCurrentUser({ suspendedUntil: null });
    }
    showToast('Account suspension cleared.');
  };

  // 3. Chat Mute user (timed: 5 min, 15 min, 1 hr)
  const handleMute = (userId: string, minutes: number) => {
    const muteDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, chatMutedUntil: muteDate };
      }
      return u;
    });
    setUsers(updated);
    saveUserDirectory(updated);

    if (currentUser.id === userId) {
      onUpdateCurrentUser({ chatMutedUntil: muteDate });
    }
    showToast(`User muted from Global Chat for ${minutes} minutes.`);
  };

  const handleUnmute = (userId: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, chatMutedUntil: null } : u));
    setUsers(updated);
    saveUserDirectory(updated);
    if (currentUser.id === userId) {
      onUpdateCurrentUser({ chatMutedUntil: null });
    }
    showToast('User unmuted from Global Chat.');
  };

  // 4. Grant / Deduct Nel Coins
  const handleModifyCoins = (userId: string, delta: number) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const next = Math.max(0, (u.nelCoins || 0) + delta);
        return { ...u, nelCoins: next };
      }
      return u;
    });
    setUsers(updated);
    saveUserDirectory(updated);

    if (currentUser.id === userId) {
      onUpdateCurrentUser({ nelCoins: Math.max(0, currentUser.nelCoins + delta) });
    }
    showToast(`${delta > 0 ? `Granted +${delta}` : `Deducted ${delta}`} Nel Coins.`);
  };

  // 5. Send System Broadcast
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    onSendBroadcast(broadcastText.trim());
    setBroadcastText('');
    setBroadcastSuccess(true);
    showToast('Glowing system alert dispatched to Global Chat!');
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  // 6. Bug report status update
  const handleUpdateBugStatus = (reportId: string, status: 'Pending' | 'Investigating' | 'Resolved') => {
    const updated = bugReports.map((b) => (b.id === reportId ? { ...b, status } : b));
    setBugReports(updated);
    saveBugReports(updated);
    showToast(`Bug report marked as ${status}.`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#14151a] rounded-3xl border border-violet-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0f1014] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Owner & Admin Dashboard</h2>
                <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 text-[10px] font-bold uppercase">
                  Authorized: {currentUser.email}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live moderation, user controls, global economy, and bug tracking
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-[#0f1014] border-b border-zinc-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#14151a] text-violet-400 border-t-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Moderation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('economy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'economy'
                ? 'bg-[#14151a] text-violet-400 border-t-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Nel Coins Economy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-[#14151a] text-violet-400 border-t-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>System Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bugs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bugs'
                ? 'bg-[#14151a] text-violet-400 border-t-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Bug Reports ({bugReports.filter((b) => b.status === 'Pending').length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: USERS & MODERATION */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <span className="text-xs text-zinc-400">
                  {users.length} registered accounts in directory
                </span>
              </div>

              {/* User Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => {
                  const isCurrentBanned = u.isBanned;
                  const isSuspended = u.suspendedUntil && new Date(u.suspendedUntil) > new Date();
                  const isMuted = u.chatMutedUntil && new Date(u.chatMutedUntil) > new Date();

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        selectedUserId === u.id
                          ? 'bg-violet-950/30 border-violet-500'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-violet-500/40"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">{u.username}</span>
                            {u.role === 'ADMIN' && (
                              <span className="px-1.5 py-0.2 rounded bg-violet-600 text-[10px] font-black text-white">
                                [ADMIN]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                            <span>Lvl {u.level}</span>
                            <span>&bull;</span>
                            <span className="text-amber-400 font-semibold">{u.nelCoins} Coins</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                        {isCurrentBanned && (
                          <span className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/40 font-bold">
                            BANNED
                          </span>
                        )}
                        {isSuspended && (
                          <span className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/40 font-bold">
                            SUSPENDED
                          </span>
                        )}
                        {isMuted && (
                          <span className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/40 font-bold">
                            CHAT MUTED
                          </span>
                        )}
                        {!isCurrentBanned && !isSuspended && !isMuted && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Action Controls for this User */}
                      <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                        {/* Ban / Unban */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBan(u.id);
                            }}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isCurrentBanned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{isCurrentBanned ? 'Unban Account' : 'Ban User'}</span>
                          </button>

                          {/* Mute toggle */}
                          {isMuted ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnmute(u.id);
                              }}
                              className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                            >
                              Unmute Chat
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMute(u.id, 5);
                                }}
                                className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold cursor-pointer"
                                title="Mute for 5 minutes"
                              >
                                5m
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMute(u.id, 60);
                                }}
                                className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold cursor-pointer"
                                title="Mute for 1 hour"
                              >
                                1h
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Temporary Suspension controls */}
                        <div className="flex items-center gap-2">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLiftSuspension(u.id);
                              }}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Lift Suspension
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSuspend(u.id, 24);
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium cursor-pointer"
                              >
                                Suspend 24h
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSuspend(u.id, 168);
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium cursor-pointer"
                              >
                                Suspend 7d
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NEL COINS ECONOMY */}
          {activeTab === 'economy' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Economy Management</h3>
                    <p className="text-xs text-zinc-400">Add or deduct Nel Coins directly into user wallets</p>
                  </div>
                </div>

                {/* Target User Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Target Account
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.email}) - Current Balance: {u.nelCoins} Coins
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Coin Grant Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                    Quick Coin Adjustments
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleModifyCoins(selectedUserId, 100)}
                      className="py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      +100 Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModifyCoins(selectedUserId, 500)}
                      className="py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-600/30"
                    >
                      +500 Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModifyCoins(selectedUserId, 2000)}
                      className="py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-600/30"
                    >
                      +2,000 Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModifyCoins(selectedUserId, -500)}
                      className="py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      -500 Coins
                    </button>
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Custom amount"
                    className="w-40 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleModifyCoins(selectedUserId, coinAmount)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Grant Custom Coins
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Global Chat System Alert</h3>
                    <p className="text-xs text-zinc-400">
                      Dispatches a glowing [SYSTEM] notification to all online viewers in Global Chat
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBroadcastSubmit} className="space-y-4 pt-2">
                  <textarea
                    rows={4}
                    required
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="e.g., Attention Nel Anime streamers: Solo Leveling Episode 12 is now streaming in 1080p Ultra HD!"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />

                  {broadcastSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Broadcast alert delivered to Global Chat drawer!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Global Broadcast</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: BUG REPORTS */}
          {activeTab === 'bugs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Submitted User Bug Reports</h3>
                <span className="text-xs text-zinc-400">{bugReports.length} total reports filed</span>
              </div>

              <div className="space-y-3">
                {bugReports.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 text-[10px] font-bold">
                          {b.category}
                        </span>
                        <span className="text-xs text-zinc-400">By {b.userName}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="text-[11px] text-zinc-500">{b.timestamp}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200 mt-1">{b.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          b.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : b.status === 'Investigating'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateBugStatus(
                            b.id,
                            b.status === 'Resolved' ? 'Pending' : 'Resolved'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                      >
                        {b.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                ))}

                {bugReports.length === 0 && (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    No active bug reports filed.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action feedback toast */}
        {toastMessage && (
          <div className="absolute bottom-4 right-6 px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-xl animate-in fade-in duration-150 z-30">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
