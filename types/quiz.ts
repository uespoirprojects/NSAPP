export type QuizLanguage = 'fr' | 'ht' | 'en' | 'es';

export interface QuizQuestion {
  id: number | string;
  question: string;
  options: string[];
  answer: string;
}

export interface QuizModule {
  title: string;
  questions: QuizQuestion[];
}

