import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://youtube.googleapis.com/youtube/v3/playlistItems';
const CACHE_PREFIX = '@youtube_playlist_cache:';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_RESULTS = 50;

export interface PlaylistVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  position: number;
  publishedAt: string;
  thumbnailUrl?: string;
}

interface PlaylistCacheEntry {
  fetchedAt: number;
  videos: PlaylistVideo[];
}

const getApiKey = (): string => {
  const apiKey =
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    '';

  if (!apiKey) {
    console.warn(
      '[youtubeService] Missing YouTube API key. Set EXPO_PUBLIC_YOUTUBE_API_KEY in your environment.',
    );
  }

  return apiKey;
};

const buildRequestUrl = (playlistId: string, pageToken?: string) => {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: MAX_RESULTS.toString(),
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  if (apiKey) {
    params.append('key', apiKey);
  }

  return `${API_BASE_URL}?${params.toString()}`;
};

const mapPlaylistItems = (items: any[]): PlaylistVideo[] =>
  items
    .map((item) => {
      const snippet = item.snippet || {};
      const contentDetails = item.contentDetails || {};
      const thumbnails = snippet.thumbnails || {};
      const thumbnail =
        thumbnails.maxres?.url ||
        thumbnails.standard?.url ||
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url;

      return {
        id: item.id,
        videoId: contentDetails.videoId || '',
        title: snippet.title || '',
        description: snippet.description || '',
        position: snippet.position ?? 0,
        publishedAt: snippet.publishedAt || '',
        thumbnailUrl: thumbnail,
      } as PlaylistVideo;
    })
    .filter((video) => Boolean(video.videoId))
    .sort((a, b) => a.position - b.position);

const fetchPlaylistFromApi = async (playlistId: string): Promise<PlaylistVideo[]> => {
  let nextPageToken: string | undefined;
  const collected: any[] = [];

  do {
    const url = buildRequestUrl(playlistId, nextPageToken);
    const response = await fetch(url);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `[youtubeService] Failed to fetch playlist ${playlistId}: ${response.status} ${response.statusText} - ${message}`,
      );
    }

    const data = await response.json();
    console.log('[youtubeService] fetched', {
      status: response.status,
      items: Array.isArray(data.items) ? data.items.length : 'none',
      nextPageToken: data.nextPageToken,
      error: data.error?.message,
    });
    console.log('[youtubeService] request URL', buildRequestUrl(playlistId));
    if (Array.isArray(data.items)) {
      collected.push(...data.items);
    }
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return mapPlaylistItems(collected);
};

const getCacheKey = (playlistId: string) => `${CACHE_PREFIX}${playlistId}`;

const getCachedPlaylist = async (playlistId: string): Promise<PlaylistVideo[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(playlistId));
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as PlaylistCacheEntry;
    const isExpired = Date.now() - cached.fetchedAt > CACHE_TTL;
    return isExpired ? null : cached.videos;
  } catch (error) {
    console.warn('[youtubeService] Failed to read playlist cache:', error);
    return null;
  }
};

const savePlaylistToCache = async (playlistId: string, videos: PlaylistVideo[]) => {
  try {
    const payload: PlaylistCacheEntry = {
      fetchedAt: Date.now(),
      videos,
    };
    await AsyncStorage.setItem(getCacheKey(playlistId), JSON.stringify(payload));
  } catch (error) {
    console.warn('[youtubeService] Failed to write playlist cache:', error);
  }
};

export const getPlaylistVideos = async (
  playlistId: string,
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<PlaylistVideo[]> => {
  if (!playlistId) {
    return [];
  }

  if (!forceRefresh) {
    const cached = await getCachedPlaylist(playlistId);
    if (cached) {
      return cached;
    }
  }

  const videos = await fetchPlaylistFromApi(playlistId);
  await savePlaylistToCache(playlistId, videos);
  return videos;
};

