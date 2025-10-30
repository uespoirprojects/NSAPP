export type VideoPlatform = 'youtube' | 'vimeo' | 'custom';

export interface Video {
  id: string;
  categoryId: string;
  videoId: string;
  platform: VideoPlatform;
  title: {
    fr: string;
    ht: string;
    en: string;
    es: string;
  };
  description?: {
    fr: string;
    ht: string;
    en: string;
    es: string;
  };
  duration?: string;
  order: number;
}

export interface VideoCategory {
  id: string;
  name: {
    fr: string;
    ht: string;
    en: string;
    es: string;
  };
  videos: Video[];
}
