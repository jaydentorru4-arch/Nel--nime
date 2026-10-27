export interface Episode {
  id: string;
  number: number;
  seasonNumber?: number;
  title: string;
  thumbnail: string;
  duration: string; // e.g., "24:15"
  durationSeconds: number;
  synopsis: string;
  videoUrl: string;
  embedUrl?: string;
  introStart?: number; // e.g., 65
  introEnd?: number;   // e.g., 150
}

export interface Season {
  seasonNumber: number;
  title: string;
  year?: number;
  episodesCount?: number;
  episodes: Episode[];
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle?: string;
  poster: string;
  banner: string;
  synopsis: string;
  score: string; // e.g., "9.1" - numerical score (no star icon)
  scorePercent: number; // e.g. 96%
  rankedNumber?: number; // e.g. 1
  type: 'TV' | 'Movie' | 'OVA';
  status: 'Airing' | 'Completed' | 'Upcoming';
  year: number;
  season?: 'Winter' | 'Spring' | 'Summer' | 'Fall';
  episodesCount: number;
  episodes: Episode[];
  seasons?: Season[];
  genres: string[];
  studio: string;
  ageRating: 'PG-13' | 'TV-14' | 'TV-MA' | 'R-17+';
  audio: ('SUB' | 'DUB')[];
  quality: '4K' | '1080p' | '720p';
  isTrending?: boolean;
  isPopular?: boolean;
  isRecent?: boolean;
  isFeatured?: boolean;
  featuredTagline?: string;
  trailerEmbedUrl?: string;
}

export interface Bookmark {
  animeId: string;
  userId: string;
  title: string;
  poster: string;
  genres: string;
  rating: string;
  episodesCount: number;
  addedAt: string;
}

export interface WatchHistory {
  animeId: string;
  userId: string;
  title: string;
  poster?: string;
  episodeNumber: number;
  seasonNumber?: number;
  progressSeconds: number;
  totalDurationSeconds?: number;
  updatedAt: string;
}

export interface EpisodeComment {
  id: string;
  animeId: string;
  episodeNumber: number;
  seasonNumber?: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface FilterState {
  genre: string;
  type: string;
  status: string;
  sortBy: 'popular' | 'score' | 'title' | 'recent';
  searchQuery: string;
}
