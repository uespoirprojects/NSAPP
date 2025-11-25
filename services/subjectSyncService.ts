import { subjectModules } from '@/constants/subjects';
import { videoCategories } from '@/constants/videos';
import { getCategories, getSubjects, type Category, type Subject } from '@/services/adminService';
import type { SubjectModule } from '@/types/subject';
import type { VideoCategory } from '@/types/video';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_CATEGORIES = '@akademix_categories_cache';
const CACHE_KEY_SUBJECTS = '@akademix_subjects_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Get categories from Firestore with caching and fallback
 */
export const getCategoriesSync = async (): Promise<VideoCategory[]> => {
  try {
    // Try to get from cache first
    const cached = await AsyncStorage.getItem(CACHE_KEY_CATEGORIES);
    if (cached) {
      const parsed: CachedData<Category[]> = JSON.parse(cached);
      const now = Date.now();
      
      // Use cache if less than 24 hours old
      if (now - parsed.timestamp < CACHE_EXPIRY) {
        return convertCategoriesToVideoCategories(parsed.data);
      }
    }

    // Fetch from Firestore
    const categories = await getCategories();
    
    // Cache the data
    const cacheData: CachedData<Category[]> = {
      data: categories,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(cacheData));
    
    return convertCategoriesToVideoCategories(categories);
  } catch (error) {
    console.error('Error fetching categories from Firestore, using fallback:', error);
    
    // Fallback to hardcoded categories
    return videoCategories;
  }
};

/**
 * Get subjects from Firestore with caching and fallback
 */
export const getSubjectsSync = async (): Promise<SubjectModule[]> => {
  try {
    // Try to get from cache first
    const cached = await AsyncStorage.getItem(CACHE_KEY_SUBJECTS);
    if (cached) {
      const parsed: CachedData<Subject[]> = JSON.parse(cached);
      const now = Date.now();
      
      // Use cache if less than 24 hours old
      if (now - parsed.timestamp < CACHE_EXPIRY) {
        return convertSubjectsToSubjectModules(parsed.data);
      }
    }

    // Fetch from Firestore
    const subjects = await getSubjects();
    
    // Cache the data
    const cacheData: CachedData<Subject[]> = {
      data: subjects,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY_SUBJECTS, JSON.stringify(cacheData));
    
    return convertSubjectsToSubjectModules(subjects);
  } catch (error) {
    console.error('Error fetching subjects from Firestore, using fallback:', error);
    
    // Fallback to hardcoded subjects
    return subjectModules;
  }
};

/**
 * Get subjects by category
 */
export const getSubjectsByCategorySync = async (categoryId: string): Promise<SubjectModule[]> => {
  const subjects = await getSubjectsSync();
  return subjects
    .filter((subject) => subject.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get category by ID
 */
export const getCategoryByIdSync = async (categoryId: string): Promise<VideoCategory | undefined> => {
  const categories = await getCategoriesSync();
  return categories.find((cat) => cat.id === categoryId);
};

/**
 * Convert Firestore Category to VideoCategory format
 */
const convertCategoriesToVideoCategories = (categories: Category[]): VideoCategory[] => {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    videos: [], // Categories don't have videos in Firestore, they're in separate collection
  }));
};

/**
 * Convert Firestore Subject to SubjectModule format
 */
const convertSubjectsToSubjectModules = (subjects: Subject[]): SubjectModule[] => {
  return subjects.map((subject) => {
    const converted = {
      id: subject.id,
      categoryId: subject.categoryId,
      playlistId: subject.playlistId,
      quizSlug: subject.quizSlug,
      title: subject.title,
      description: subject.description,
      order: subject.order,
    };
    
    // Debug logging for playlistId
    if (!converted.playlistId) {
      console.warn('[subjectSyncService] Subject missing playlistId:', subject.id, subject);
    } else {
      console.log('[subjectSyncService] Converted subject:', {
        id: converted.id,
        playlistId: converted.playlistId,
        playlistIdLength: converted.playlistId.length,
      });
    }
    
    return converted;
  });
};

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export const clearCache = async (): Promise<void> => {
  await AsyncStorage.multiRemove([CACHE_KEY_CATEGORIES, CACHE_KEY_SUBJECTS]);
};

