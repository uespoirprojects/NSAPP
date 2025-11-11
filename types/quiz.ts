export type QuizLanguage = 'fr' | 'ht' | 'en' | 'es';

export interface QuizQuestion {
  id: number | string;
  question: string;
  options: string[];
  answer?: string | string[] | null;
}

export interface QuizModule {
  title: string;
  questions: QuizQuestion[];
}

