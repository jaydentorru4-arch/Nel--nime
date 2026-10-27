import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User, LogIn } from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { EpisodeComment } from '../types/anime';
import {
  subscribeToEpisodeComments,
  addEpisodeComment,
  deleteEpisodeComment,
} from '../services/firestoreService';

interface EpisodeCommentsProps {
  animeId: string;
  episodeNumber: number;
}

export const EpisodeComments: React.FC<EpisodeCommentsProps> = ({
  animeId,
  episodeNumber,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to real-time episode comments
  useEffect(() => {
    const unsubscribe = subscribeToEpisodeComments(
      animeId,
      episodeNumber,
      (updatedComments) => {
        setComments(updatedComments);
      },
      (err) => {
        console.warn('Comments subscription warning:', err);
      }
    );

    return () => unsubscribe();
  }, [animeId, episodeNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }

    if (!newComment.trim()) return;
    if (newComment.length > 500) {
      setErrorMsg('Comment exceeds 500 characters limit');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await addEpisodeComment({
        animeId,
        episodeNumber,
        userId: user.uid,
        userName: user.displayName || 'Anime Fan',
        userAvatar: user.photoURL || '',
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewComment('');
    } catch (err: unknown) {
      console.error('Failed to post comment', err);
      setErrorMsg('Could not publish comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteEpisodeComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="bg-[#14151a] rounded-2xl border border-zinc-800 p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <h3 className="text-base font-bold text-white">
            Episode Discussion ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-zinc-400">Spoiler-free zone</span>
      </div>

      {/* Input or Sign-In Prompt */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-start gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 mt-1">
                {user.displayName ? user.displayName.charAt(0) : 'U'}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this episode..."
                rows={2}
                maxLength={500}
                className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-violet-500 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-zinc-500">{newComment.length}/500</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg font-semibold transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
          {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-2">
          <p className="text-xs text-zinc-300">
            Sign in with Google to join the episode discussion and share reactions.
          </p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in to Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">
            No comments yet on this episode. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {c.userAvatar ? (
                    <img
                      src={c.userAvatar}
                      alt={c.userName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-zinc-200">
                    {c.userName}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {formatCommentDate(c.createdAt)}
                  </span>
                </div>

                {user && user.uid === c.userId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 pl-8 leading-relaxed">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
