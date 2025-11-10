import type { QuizLanguage, QuizModule, QuizQuestion } from '@/types/quiz';

import frExcel from '@/assets/quizzes/excel/fr.json';
import htExcel from '@/assets/quizzes/excel/ht.json';

type SupportedLanguage = 'fr' | 'ht';

export interface QuizQuestionWithMeta extends QuizQuestion {
  moduleTitle: string;
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

const excelQuizzes: Record<SupportedLanguage, QuizModule[]> = {
  fr: frExcel as QuizModule[],
  ht: htExcel as QuizModule[],
};

const supportedLanguages = new Set<SupportedLanguage>(['fr', 'ht']);

const normalizeLanguage = (language: QuizLanguage): SupportedLanguage => {
  if (supportedLanguages.has(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
};

const shuffleArray = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getQuizModules = (language: QuizLanguage): QuizModule[] => {
  const normalizedLanguage = normalizeLanguage(language);
  return excelQuizzes[normalizedLanguage] || excelQuizzes[DEFAULT_LANGUAGE];
};

export const getRandomQuizQuestions = (
  language: QuizLanguage,
  count = 10,
): QuizQuestionWithMeta[] => {
  const modules = getQuizModules(language);
  const allQuestions: QuizQuestionWithMeta[] = modules.flatMap((module) =>
    module.questions.map((question) => ({
      ...question,
      moduleTitle: module.title,
    })),
  );

  if (allQuestions.length === 0) {
    return [];
  }

  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

