import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Bookmark, WatchHistory, EpisodeComment } from '../types/anime';

const LOCAL_STORAGE_BOOKMARKS_KEY = 'nel_anime_local_bookmarks';
const LOCAL_STORAGE_HISTORY_KEY = 'nel_anime_local_history';

// Helper to get local bookmarks fallback
export function getLocalBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalBookmark(bookmark: Bookmark): void {
  try {
    const existing = getLocalBookmarks().filter(b => b.animeId !== bookmark.animeId);
    existing.unshift(bookmark);
    localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save bookmark locally', err);
  }
}

export function removeLocalBookmark(animeId: string): void {
  try {
    const existing = getLocalBookmarks().filter(b => b.animeId !== animeId);
    localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to delete bookmark locally', err);
  }
}

// Helper to get local watch history fallback
export function getLocalHistory(): WatchHistory[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalHistory(item: WatchHistory): void {
  try {
    const existing = getLocalHistory().filter(h => h.animeId !== item.animeId);
    existing.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save history locally', err);
  }
}

// ----------------------------------------------------------------------
// Firestore Bookmarks Service
// ----------------------------------------------------------------------

export async function addBookmark(userId: string, bookmark: Bookmark): Promise<void> {
  const path = `users/${userId}/bookmarks/${bookmark.animeId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'bookmarks', bookmark.animeId), {
      animeId: bookmark.animeId,
      userId: bookmark.userId,
      title: bookmark.title,
      poster: bookmark.poster,
      genres: bookmark.genres || '',
      rating: bookmark.rating || '',
      episodesCount: bookmark.episodesCount || 0,
      addedAt: bookmark.addedAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBookmark(userId: string, animeId: string): Promise<void> {
  const path = `users/${userId}/bookmarks/${animeId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', animeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToBookmarks(
  userId: string,
  onUpdate: (bookmarks: Bookmark[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/bookmarks`;
  const q = collection(db, 'users', userId, 'bookmarks');

  return onSnapshot(
    q,
    (snapshot) => {
      const bookmarks: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        bookmarks.push(docSnap.data() as Bookmark);
      });
      onUpdate(bookmarks);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

// ----------------------------------------------------------------------
// Firestore Watch History Progress Service
// ----------------------------------------------------------------------

export async function saveWatchProgress(userId: string, history: WatchHistory): Promise<void> {
  const path = `users/${userId}/history/${history.animeId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'history', history.animeId), {
      animeId: history.animeId,
      userId: history.userId,
      title: history.title,
      poster: history.poster || '',
      episodeNumber: history.episodeNumber,
      progressSeconds: Math.floor(history.progressSeconds),
      totalDurationSeconds: Math.floor(history.totalDurationSeconds || 0),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToWatchHistory(
  userId: string,
  onUpdate: (history: WatchHistory[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/history`;
  const q = collection(db, 'users', userId, 'history');

  return onSnapshot(
    q,
    (snapshot) => {
      const historyList: WatchHistory[] = [];
      snapshot.forEach((docSnap) => {
        historyList.push(docSnap.data() as WatchHistory);
      });
      historyList.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
      onUpdate(historyList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}

// ----------------------------------------------------------------------
// Firestore Episode Comments Service
// ----------------------------------------------------------------------

export async function addEpisodeComment(comment: Omit<EpisodeComment, 'id'>): Promise<string> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `comments/${commentId}`;
  try {
    await setDoc(doc(db, 'comments', commentId), {
      animeId: comment.animeId,
      episodeNumber: comment.episodeNumber,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar || '',
      content: comment.content,
      createdAt: comment.createdAt || new Date().toISOString(),
    });
    return commentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteEpisodeComment(commentId: string): Promise<void> {
  const path = `comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToEpisodeComments(
  animeId: string,
  episodeNumber: number,
  onUpdate: (comments: EpisodeComment[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const collectionPath = 'comments';
  const q = query(
    collection(db, 'comments'),
    where('animeId', '==', animeId),
    where('episodeNumber', '==', episodeNumber),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: EpisodeComment[] = [];
      snapshot.forEach((docSnap) => {
        comments.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<EpisodeComment, 'id'>),
        });
      });
      // Sort newest first
      comments.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      onUpdate(comments);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, collectionPath);
    }
  );
}
