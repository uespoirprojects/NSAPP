import type { QuizLanguage, QuizModule, QuizQuestion } from '@/types/quiz';

import frExcel from '@/assets/quizzes/excel/fr.json';
import htExcel from '@/assets/quizzes/excel/ht.json';
import frIntroComputer from '@/assets/quizzes/intro_computer/fr.json';
import htIntroComputer from '@/assets/quizzes/intro_computer/ht.json';
import frWord from '@/assets/quizzes/word/fr.json';
import htWord from '@/assets/quizzes/word/ht.json';

type SupportedLanguage = 'fr' | 'ht';
type SupportedSubject = 'excel' | 'word' | 'basic-computer';

export interface QuizQuestionWithMeta extends QuizQuestion {
  moduleTitle: string;
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';
const DEFAULT_SUBJECT: SupportedSubject = 'excel';

const normalizeQuizModules = (raw: unknown): QuizModule[] => {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw as QuizModule[];
  }

  if (typeof raw === 'object' && raw !== null) {
    const maybeRecord = raw as Record<string, unknown>;
    const quizArray = maybeRecord.quiz;

    if (Array.isArray(quizArray)) {
      return quizArray.map((section, sectionIndex) => {
        const sectionRecord = section as Record<string, unknown>;
        const questions = Array.isArray(sectionRecord.questions)
          ? sectionRecord.questions
          : [];

        return {
          title:
            (sectionRecord.title as string) ||
            (sectionRecord.section as string) ||
            `Section ${sectionIndex + 1}`,
          questions: questions.map((question, questionIndex) => {
            const questionRecord = question as Record<string, unknown>;
            const options = Array.isArray(questionRecord.options)
              ? (questionRecord.options as string[])
              : [];
            const answer = questionRecord.answer;

            return {
              id: questionRecord.id ?? `${sectionIndex + 1}-${questionIndex + 1}`,
              question: (questionRecord.question as string) || '',
              options,
              answer:
                typeof answer === 'string' || Array.isArray(answer)
                  ? (answer as string | string[])
                  : null,
            };
          }),
        };
      });
    }
  }

  return [];
};

const quizLibrary: Record<SupportedSubject, Record<SupportedLanguage, QuizModule[]>> = {
  excel: {
    fr: normalizeQuizModules(frExcel),
    ht: normalizeQuizModules(htExcel),
  },
  word: {
    fr: normalizeQuizModules(frWord),
    ht: normalizeQuizModules(htWord),
  },
  'basic-computer': {
    fr: normalizeQuizModules(frIntroComputer),
    ht: normalizeQuizModules(htIntroComputer),
  },
};

const supportedLanguages = new Set<SupportedLanguage>(['fr', 'ht']);

const normalizeLanguage = (language: QuizLanguage): SupportedLanguage => {
  if (supportedLanguages.has(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
};

const normalizeSubject = (subject?: string): SupportedSubject => {
  if (subject && subject in quizLibrary) {
    return subject as SupportedSubject;
  }
  return DEFAULT_SUBJECT;
};

const shuffleArray = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getQuizModules = (
  language: QuizLanguage,
  subject?: string,
): QuizModule[] => {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedSubject = normalizeSubject(subject);
  const subjectCollection = quizLibrary[normalizedSubject];
  return subjectCollection[normalizedLanguage] || subjectCollection[DEFAULT_LANGUAGE] || [];
};

export const getRandomQuizQuestions = (
  language: QuizLanguage,
  count = 10,
  subject?: string,
): QuizQuestionWithMeta[] => {
  const modules = getQuizModules(language, subject);
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

