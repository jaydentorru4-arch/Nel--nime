import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle, UploadCloud, Paperclip } from 'lucide-react';
import { BugReport, UserProfile } from '../types/anime';
import { loadBugReports, saveBugReports } from '../services/userService';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [category, setCategory] = useState<BugReport['category']>('Playback');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport: BugReport = {
      id: `rep-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username,
      category,
      description: description.trim(),
      screenshotUrl: screenshotUrl || undefined,
      timestamp: 'Just now',
      status: 'Pending',
    };

    const existing = loadBugReports();
    const updated = [newReport, ...existing];
    saveBugReports(updated);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      setScreenshotUrl('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
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
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Report a Bug / Issue</h2>
            <p className="text-xs text-zinc-400">Directly alerts Nel Anime engineering & admin</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Report Filed Successfully!</h3>
            <p className="text-xs text-zinc-400">
              Thank you for helping keep Nel Anime lightning fast and bug-free.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Playback">Video Playback / Stream Mirror Issue</option>
                <option value="UI/Display">UI / Glassmorphic Display Bug</option>
                <option value="Audio/Sub">Audio Track / Subtitle Timing</option>
                <option value="Account/Coins">Account / Nel Coins & Shop</option>
                <option value="Other">Other Suggestion or Glitch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Description of the Issue
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, anime episode #, or any glitch you observed..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Screenshot URL / Reference (Optional)
              </label>
              <div className="relative">
                <Paperclip className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://... image link"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Bug Report to Admin</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
