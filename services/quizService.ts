import type { QuizLanguage, QuizModule, QuizQuestion } from '@/types/quiz';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback imports (used if cPanel fetch fails)
import frAlgorithm from '@/assets/quizzes/algorithm/fr.json';
import htAlgorithm from '@/assets/quizzes/algorithm/ht.json';
import frExcel from '@/assets/quizzes/excel/fr.json';
import htExcel from '@/assets/quizzes/excel/ht.json';
import frHtml from '@/assets/quizzes/html/fr.json';
import htHtml from '@/assets/quizzes/html/ht.json';
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
// Note: Keys should match the folder names in assets/quizzes (with underscores) or database quizSlug values
const fallbackQuizLibrary: Record<string, Record<SupportedLanguage, QuizModule[]>> = {
  excel: {
    fr: normalizeQuizModules(frExcel),
    ht: normalizeQuizModules(htExcel),
  },
  word: {
    fr: normalizeQuizModules(frWord),
    ht: normalizeQuizModules(htWord),
  },
  // Add underscore version to match database quizSlug
  'intro_computer': {
    fr: normalizeQuizModules(frIntroComputer),
    ht: normalizeQuizModules(htIntroComputer),
  },
  algorithm: {
    fr: normalizeQuizModules(frAlgorithm),
    ht: normalizeQuizModules(htAlgorithm),
  },
  html: {
    fr: normalizeQuizModules(frHtml),
    ht: normalizeQuizModules(htHtml),
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
  } catch (error: any) {
    // Check if it's a CORS error (common in web development)
    const isCorsError = error?.message?.includes('CORS') || 
                        error?.message?.includes('Failed to fetch') ||
                        error?.name === 'TypeError';
    
    if (isCorsError) {
      // CORS errors are expected in web development - fallback will be used
      console.log(`[quizService] CORS error fetching from ${url} (expected in web dev), using fallback`);
    } else {
      console.error(`[quizService] Error fetching quiz from ${url}:`, error);
    }
    throw error;
  }
};

/**
 * Check if an error is a network-related error
 */
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  
  return (
    name === 'typeerror' ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('cors') ||
    message.includes('offline') ||
    message.includes('connection') ||
    message.includes('timeout')
  );
};

/**
 * Get quiz modules from cPanel with caching and fallback
 * Always tries to fetch from server first to ensure up-to-date content
 * Only uses cache if network error occurs
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
    // Always try to fetch from server first to get latest version
    const modules = await fetchQuizFromUrl(normalizedSlug, normalizedLanguage);
    
    if (modules.length > 0) {
      console.log('[quizService] Successfully fetched from server:', normalizedSlug, normalizedLanguage);
      return modules;
    }

    // Server returned empty, try fallback
    console.warn('[quizService] Server returned empty, trying fallback');
    return getFallbackQuizModules(language, normalizedSlug);
  } catch (error: any) {
    // Network error: try cache as fallback
    if (isNetworkError(error)) {
      console.log('[quizService] Network error, checking cache:', normalizedSlug, normalizedLanguage);
      const cached = await getCachedQuiz(normalizedSlug, normalizedLanguage);
      if (cached && cached.length > 0) {
        console.log('[quizService] Using cached quiz due to network error:', normalizedSlug, normalizedLanguage);
        return cached;
      }
    } else {
      // Non-network error (e.g., 404, invalid JSON)
      console.warn('[quizService] Server error (non-network):', error.message);
    }
    
    // Final fallback: use local assets
    console.warn('[quizService] Using local fallback:', normalizedSlug);
    return getFallbackQuizModules(language, normalizedSlug);
  }
};

/**
 * Get fallback quiz modules from local assets
 * Only uses exact matches from the fallbackQuizLibrary based on quizSlug
 */
const getFallbackQuizModules = (
  language: QuizLanguage,
  quizSlug: string,
): QuizModule[] => {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedSlug = quizSlug.toLowerCase().trim();
  
  // Only use exact match from fallbackQuizLibrary
  const fallback = fallbackQuizLibrary[normalizedSlug];
  
  if (fallback) {
    return fallback[normalizedLanguage] || fallback[DEFAULT_LANGUAGE] || [];
  }
  
  // If no exact match found, return empty array
  // This ensures we only use quizzes that match the exact quizSlug structure
  console.warn(`[quizService] No local fallback found for quizSlug: "${normalizedSlug}"`);
  return [];
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

/**
 * Prefetch all quizzes for all available quiz slugs
 * This is called on app start to ensure all quizzes are up-to-date
 * Always fetches from server (ignores cache) to get latest versions
 */
export const prefetchAllQuizzes = async (quizSlugs: string[]): Promise<void> => {
  if (!quizSlugs || quizSlugs.length === 0) {
    console.log('[quizService] No quiz slugs provided for prefetching');
    return;
  }

  const languages: SupportedLanguage[] = ['fr', 'ht'];
  const prefetchPromises: Promise<void>[] = [];

  console.log(`[quizService] Refreshing ${quizSlugs.length} quizzes for ${languages.length} languages from server...`);

  for (const quizSlug of quizSlugs) {
    if (!quizSlug || quizSlug.trim() === '') continue;

    const normalizedSlug = quizSlug.toLowerCase().trim();

    for (const language of languages) {
      // Always fetch from server (force refresh) to ensure we have the latest version
      // This will update the cache with fresh data
      prefetchPromises.push(
        fetchQuizFromUrl(normalizedSlug, language)
          .then((modules) => {
            if (modules.length > 0) {
              console.log(`[quizService] ✓ Refreshed ${normalizedSlug} (${language}) - ${modules.length} module(s)`);
            } else {
              console.warn(`[quizService] ⚠ Quiz ${normalizedSlug} (${language}) returned empty from server`);
            }
          })
          .catch((error) => {
            // Check if it's a network error
            if (isNetworkError(error)) {
              // Network error: check if we have cached version
              getCachedQuiz(normalizedSlug, language)
                .then((cached) => {
                  if (cached && cached.length > 0) {
                    console.log(`[quizService] ⚠ Network error for ${normalizedSlug} (${language}), using cached version`);
                  } else {
                    console.warn(`[quizService] ✗ Network error for ${normalizedSlug} (${language}), no cache available`);
                  }
                })
                .catch(() => {
                  console.warn(`[quizService] ✗ Failed to check cache for ${normalizedSlug} (${language})`);
                });
            } else {
              // Non-network error (e.g., 404, invalid JSON)
              console.warn(`[quizService] ✗ Failed to refresh ${normalizedSlug} (${language}):`, error.message);
            }
          })
      );
    }
  }

  // Wait for all prefetches to complete (or fail)
  const results = await Promise.allSettled(prefetchPromises);
  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const total = quizSlugs.length * languages.length;
  console.log(`[quizService] Quiz refresh completed: ${successful}/${total} successful`);
};

