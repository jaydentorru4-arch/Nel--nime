import React, { useState } from 'react';
import { X, Shield, Lock, Mail, CheckCircle, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASS } from '../services/userService';
import { UserProfile } from '../types/anime';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (profile: Partial<UserProfile>) => void;
  currentUser: UserProfile;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  currentUser,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleQuickFillMasterAdmin = () => {
    setEmail(MASTER_ADMIN_EMAIL);
    setPassword(MASTER_ADMIN_PASS);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() && cleanPass === MASTER_ADMIN_PASS) {
      setSuccess('Master Admin access granted! Unlocking Owner privileges...');
      setTimeout(() => {
        onAdminLoginSuccess({
          email: MASTER_ADMIN_EMAIL,
          username: 'Jayden [Owner]',
          role: 'ADMIN',
          isAdmin: true,
          equippedBadge: 'ADMIN',
        });
        onClose();
      }, 700);
    } else {
      setError('Invalid credentials. Check email and password or use the Quick-Fill button.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900/90 rounded-3xl border border-violet-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/40 text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Owner & Admin Access</h2>
            <p className="text-xs text-zinc-400">Master authentication override portal</p>
          </div>
        </div>

        {/* Master Rule Info Card */}
        <div className="p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200 space-y-1.5 mb-5">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-violet-300">
              <KeyRound className="w-3.5 h-3.5" />
              Master Admin Override
            </span>
            <button
              type="button"
              onClick={handleQuickFillMasterAdmin}
              className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
            >
              Quick-Fill Master
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            Authorized Account: <code className="text-violet-300 font-mono">{MASTER_ADMIN_EMAIL}</code>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jaydentorru4@gmail.com"
                className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Verify & Log In as Admin</span>
          </button>
        </form>

        <p className="text-[11px] text-zinc-400 text-center mt-5">
          Grants permanent [ADMIN] rank tag, moderation tools, economy overrides, and the exclusive Admin Dashboard.
        </p>
      </div>
    </div>
  );
};
