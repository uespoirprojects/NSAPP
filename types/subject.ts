export interface Subject {
  id: string;
  playlistId: string;
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
  quizSlug: string;
  icon?: string;
  order: number;
}

export interface SubjectModule extends Subject {
  categoryId: string;
}

