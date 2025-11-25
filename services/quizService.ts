import type { QuizLanguage, QuizModule, QuizQuestion } from '@/types/quiz';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback imports (used if cPanel fetch fails)
import frExcel from '@/assets/quizzes/excel/fr.json';
import htExcel from '@/assets/quizzes/excel/ht.json';
import frIntroComputer from '@/assets/quizzes/intro_computer/fr.json';
import htIntroComputer from '@/assets/quizzes/intro_computer/ht.json';
import frWord from '@/assets/quizzes/word/fr.json';
import htWord from '@/assets/quizzes/word/ht.json';

type SupportedLanguage = 'fr' | 'ht';

export interface QuizQuestionWithMeta extends QuizQuestion {
  moduleTitle: string;
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

// Base URL for quiz files on cPanel
const QUIZ_BASE_URL = 'https://ns.uespoir.edu.ht/app/quizzes';
const CACHE_PREFIX = '@quiz_cache:';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface QuizCacheEntry {
  fetchedAt: number;
  modules: QuizModule[];
}

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
              id: (typeof questionRecord.id === 'string' || typeof questionRecord.id === 'number')
                ? questionRecord.id
                : `${sectionIndex + 1}-${questionIndex + 1}`,
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

// Fallback quiz library (used if cPanel fetch fails)
const fallbackQuizLibrary: Record<string, Record<SupportedLanguage, QuizModule[]>> = {
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
  'intro-computer': {
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

const shuffleArray = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Get cache key for a quiz
 */
const getCacheKey = (quizSlug: string, language: SupportedLanguage): string => {
  return `${CACHE_PREFIX}${quizSlug}_${language}`;
};

/**
 * Get cached quiz modules
 */
const getCachedQuiz = async (
  quizSlug: string,
  language: SupportedLanguage,
): Promise<QuizModule[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(quizSlug, language));
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as QuizCacheEntry;
    const isExpired = Date.now() - cached.fetchedAt > CACHE_TTL;
    return isExpired ? null : cached.modules;
  } catch (error) {
    console.warn('[quizService] Failed to read quiz cache:', error);
    return null;
  }
};

/**
 * Save quiz modules to cache
 */
const saveQuizToCache = async (
  quizSlug: string,
  language: SupportedLanguage,
  modules: QuizModule[],
): Promise<void> => {
  try {
    const cacheEntry: QuizCacheEntry = {
      fetchedAt: Date.now(),
      modules,
    };
    await AsyncStorage.setItem(getCacheKey(quizSlug, language), JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('[quizService] Failed to write quiz cache:', error);
  }
};

/**
 * Fetch quiz from cPanel
 */
const fetchQuizFromUrl = async (
  quizSlug: string,
  language: SupportedLanguage,
): Promise<QuizModule[]> => {
  const url = `${QUIZ_BASE_URL}/${quizSlug}/${language}.json`;
  
  try {
    console.log('[quizService] Fetching quiz from:', url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const modules = normalizeQuizModules(data);
    
    // Cache the result
    await saveQuizToCache(quizSlug, language, modules);
    
    return modules;
  } catch (error) {
    console.error(`[quizService] Error fetching quiz from ${url}:`, error);
    throw error;
  }
};

/**
 * Get quiz modules from cPanel with caching and fallback
 */
export const getQuizModules = async (
  language: QuizLanguage,
  quizSlug?: string,
): Promise<QuizModule[]> => {
  if (!quizSlug || quizSlug.trim() === '') {
    console.warn('[quizService] No quizSlug provided, using fallback');
    return getFallbackQuizModules(language, 'excel');
  }

  const normalizedLanguage = normalizeLanguage(language);
  const normalizedSlug = quizSlug.toLowerCase().trim();

  try {
    // Try to get from cache first
    const cached = await getCachedQuiz(normalizedSlug, normalizedLanguage);
    if (cached) {
      console.log('[quizService] Using cached quiz:', normalizedSlug, normalizedLanguage);
      return cached;
    }

    // Fetch from cPanel
    const modules = await fetchQuizFromUrl(normalizedSlug, normalizedLanguage);
    
    if (modules.length === 0) {
      console.warn('[quizService] No modules found, trying fallback');
      return getFallbackQuizModules(language, normalizedSlug);
    }

    return modules;
  } catch (error) {
    console.error('[quizService] Error fetching quiz, using fallback:', error);
    // Fallback to local assets
    return getFallbackQuizModules(language, normalizedSlug);
  }
};

/**
 * Get fallback quiz modules from local assets
 */
const getFallbackQuizModules = (
  language: QuizLanguage,
  quizSlug: string,
): QuizModule[] => {
  const normalizedLanguage = normalizeLanguage(language);
  const fallback = fallbackQuizLibrary[quizSlug];
  
  if (fallback) {
    return fallback[normalizedLanguage] || fallback[DEFAULT_LANGUAGE] || [];
  }
  
  // If quizSlug doesn't match, try to find a similar one
  const similarSlug = Object.keys(fallbackQuizLibrary).find(
    (key) => key.includes(quizSlug) || quizSlug.includes(key)
  );
  
  if (similarSlug) {
    const similarFallback = fallbackQuizLibrary[similarSlug];
    return similarFallback[normalizedLanguage] || similarFallback[DEFAULT_LANGUAGE] || [];
  }
  
  // Default to excel if nothing matches
  const defaultFallback = fallbackQuizLibrary['excel'];
  return defaultFallback[normalizedLanguage] || defaultFallback[DEFAULT_LANGUAGE] || [];
};

/**
 * Get random quiz questions
 */
export const getRandomQuizQuestions = async (
  language: QuizLanguage,
  count = 10,
  quizSlug?: string,
): Promise<QuizQuestionWithMeta[]> => {
  const modules = await getQuizModules(language, quizSlug);
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

