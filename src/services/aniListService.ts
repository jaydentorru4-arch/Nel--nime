import { Anime, Episode } from '../types/anime';

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];

// Helper to strip HTML tags from AniList descriptions
export function cleanDescription(desc: string | null | undefined): string {
  if (!desc) return 'No synopsis available for this title.';
  return desc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// Convert AniList media object into application Anime model
export function mapAniListToAnime(media: any, index: number = 0): Anime {
  const title = media.title?.english || media.title?.romaji || media.title?.native || 'Unknown Anime';
  const japaneseTitle = media.title?.native || media.title?.romaji || '';
  const scoreRaw = media.averageScore ? (media.averageScore / 10).toFixed(1) : '8.5';
  const scorePercent = media.averageScore || 85;
  const episodesCount = media.episodes || 12;

  const poster =
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png';

  const banner =
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg';

  const studio =
    media.studios?.nodes?.[0]?.name || 'Animation Studio';

  const format = media.format === 'MOVIE' ? 'Movie' : media.format === 'OVA' ? 'OVA' : 'TV';

  // Generate realistic seasons & episode list
  const epLimit = Math.min(Math.max(episodesCount, 1), 24);
  const s1Count = Math.min(epLimit, 12);
  const s1Episodes: Episode[] = Array.from({ length: s1Count }).map((_, i) => {
    const epNum = i + 1;
    return {
      id: `${media.id}-s1-ep-${epNum}`,
      number: epNum,
      seasonNumber: 1,
      title: epNum === 1 ? 'Episode 1: The Beginning' : `Episode ${epNum}: Chapter ${epNum}`,
      thumbnail: banner || poster,
      duration: '24:00',
      durationSeconds: 1440,
      synopsis: `Episode ${epNum} of ${title}. Streaming in high-definition with Japanese audio and English subtitles.`,
      videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
      introStart: 45,
      introEnd: 135,
    };
  });

  const s2Count = format === 'TV' && epLimit > 12 ? Math.min(epLimit - 12, 12) : 8;
  const s2Episodes: Episode[] = Array.from({ length: s2Count }).map((_, i) => {
    const epNum = i + 1;
    return {
      id: `${media.id}-s2-ep-${epNum}`,
      number: epNum,
      seasonNumber: 2,
      title: `S2 Ep ${epNum}: Continuing the Legacy`,
      thumbnail: banner || poster,
      duration: '24:00',
      durationSeconds: 1440,
      synopsis: `Season 2 Episode ${epNum} of ${title}. Full HD streaming with multi-language audio.`,
      videoUrl: SAMPLE_VIDEOS[(i + 1) % SAMPLE_VIDEOS.length],
      introStart: 45,
      introEnd: 135,
    };
  });

  const seasons = format === 'Movie'
    ? [{ seasonNumber: 1, title: 'Theatrical Film', year: media.seasonYear || 2024, episodesCount: 1, episodes: s1Episodes }]
    : [
        { seasonNumber: 1, title: 'Season 1', year: media.seasonYear || 2023, episodesCount: s1Count, episodes: s1Episodes },
        { seasonNumber: 2, title: 'Season 2', year: (media.seasonYear || 2023) + 1, episodesCount: s2Count, episodes: s2Episodes }
      ];

  return {
    id: `al-${media.id}`,
    title,
    japaneseTitle,
    poster,
    banner,
    synopsis: cleanDescription(media.description),
    score: scoreRaw,
    scorePercent,
    rankedNumber: index + 1,
    type: format as 'TV' | 'Movie' | 'OVA',
    status: media.status === 'RELEASING' ? 'Airing' : media.status === 'NOT_YET_RELEASED' ? 'Upcoming' : 'Completed',
    year: media.seasonYear || 2024,
    episodesCount: media.episodes || s1Episodes.length,
    episodes: s1Episodes,
    seasons,
    genres: (media.genres && media.genres.length > 0) ? media.genres : ['Action', 'Fantasy'],
    studio,
    ageRating: 'TV-14',
    audio: ['SUB', 'DUB'],
    quality: '1080p',
    isTrending: index < 10,
    isPopular: true,
    isRecent: media.seasonYear && media.seasonYear >= 2023,
    isFeatured: index < 5,
  };
}

// Search AniList Global Database (Access to virtually every anime in existence!)
export async function searchGlobalAniList(searchTerm: string, limit: number = 20): Promise<Anime[]> {
  if (!searchTerm.trim()) return [];

  const query = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, isAdult: false) {
          id
          title { english romaji native }
          coverImage { extraLarge large }
          bannerImage
          description
          episodes
          seasonYear
          status
          format
          genres
          averageScore
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: searchTerm, perPage: limit },
      }),
    });

    const data = await res.json();
    const mediaList = data?.data?.Page?.media || [];
    return mediaList.map((m: any, idx: number) => mapAniListToAnime(m, idx));
  } catch (error) {
    console.error('Error querying AniList API:', error);
    return [];
  }
}

// Fetch live Trending anime from AniList
export async function fetchTrendingFromAniList(limit: number = 20): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: [TRENDING_DESC], type: ANIME, isAdult: false) {
          id
          title { english romaji native }
          coverImage { extraLarge large }
          bannerImage
          description
          episodes
          seasonYear
          status
          format
          genres
          averageScore
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { perPage: limit },
      }),
    });

    const data = await res.json();
    const mediaList = data?.data?.Page?.media || [];
    return mediaList.map((m: any, idx: number) => mapAniListToAnime(m, idx));
  } catch (error) {
    console.error('Error fetching trending anime from AniList:', error);
    return [];
  }
}
