/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube embed URL from video ID
 * Handles both video IDs and full YouTube URLs
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string, autoplay = false): string {
  // Extract video ID if a full URL is provided
  let videoId = videoIdOrUrl;
  const extractedId = extractYouTubeVideoId(videoIdOrUrl);
  if (extractedId) {
    videoId = extractedId;
  }

  // Clean the video ID (remove any extra characters)
  videoId = videoId.trim();

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    controls: '1',
    enablejsapi: '1',
    playsinline: '1',
    origin: 'https://www.youtube.com',
  });

  if (autoplay) {
    params.append('autoplay', '1');
    params.append('mute', '0');
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
