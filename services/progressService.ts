import { db } from '@/lib/firebase';
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';

export interface VideoProgress {
  videoId: string;
  subjectId?: string;
  categoryId?: string;
  completed: boolean;
  completedAt?: Timestamp;
  lastWatchedAt?: Timestamp;
  watchTime?: number; // in seconds
}

export interface QuizProgress {
  videoId: string;
  subjectId?: string;
  categoryId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: Timestamp;
  attempts: number;
}

export interface UserProgress {
  userId: string;
  videos: Record<string, VideoProgress>; // key: videoId
  quizzes: Record<string, QuizProgress[]>; // key: videoId, value: array of quiz attempts
  lastUpdated: Timestamp;
}

/**
 * Get user progress document from Firestore
 */
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data() as UserProgress;
    }
    
    // Return default progress structure if document doesn't exist
    return {
      userId,
      videos: {},
      quizzes: {},
      lastUpdated: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

/**
 * Initialize user progress document in Firestore
 */
export const initializeUserProgress = async (userId: string): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      const initialProgress: UserProgress = {
        userId,
        videos: {},
        quizzes: {},
        lastUpdated: Timestamp.now(),
      };
      await setDoc(progressRef, initialProgress);
    }
  } catch (error) {
    console.error('Error initializing user progress:', error);
    throw error;
  }
};

/**
 * Mark a video as completed
 */
export const markVideoAsComplete = async (
  userId: string,
  videoId: string,
  subjectId?: string,
  categoryId?: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    let progress: UserProgress;
    if (progressSnap.exists()) {
      progress = progressSnap.data() as UserProgress;
    } else {
      progress = {
        userId,
        videos: {},
        quizzes: {},
        lastUpdated: Timestamp.now(),
      };
    }
    
    // Update or create video progress
    progress.videos[videoId] = {
      videoId,
      subjectId,
      categoryId,
      completed: true,
      completedAt: Timestamp.now(),
      lastWatchedAt: Timestamp.now(),
    };
    
    progress.lastUpdated = Timestamp.now();
    
    await setDoc(progressRef, progress, { merge: true });
  } catch (error) {
    console.error('Error marking video as complete:', error);
    throw error;
  }
};

/**
 * Update video watch time
 */
export const updateVideoWatchTime = async (
  userId: string,
  videoId: string,
  watchTime: number,
  subjectId?: string,
  categoryId?: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    let progress: UserProgress;
    if (progressSnap.exists()) {
      progress = progressSnap.data() as UserProgress;
    } else {
      progress = {
        userId,
        videos: {},
        quizzes: {},
        lastUpdated: Timestamp.now(),
      };
    }
    
    // Update or create video progress
    const existingProgress = progress.videos[videoId];
    progress.videos[videoId] = {
      videoId,
      subjectId,
      categoryId,
      completed: existingProgress?.completed || false,
      completedAt: existingProgress?.completedAt,
      lastWatchedAt: Timestamp.now(),
      watchTime: (existingProgress?.watchTime || 0) + watchTime,
    };
    
    progress.lastUpdated = Timestamp.now();
    
    await setDoc(progressRef, progress, { merge: true });
  } catch (error) {
    console.error('Error updating video watch time:', error);
    throw error;
  }
};

/**
 * Save quiz result
 */
export const saveQuizResult = async (
  userId: string,
  videoId: string,
  score: number,
  totalQuestions: number,
  subjectId?: string,
  categoryId?: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    let progress: UserProgress;
    if (progressSnap.exists()) {
      progress = progressSnap.data() as UserProgress;
    } else {
      progress = {
        userId,
        videos: {},
        quizzes: {},
        lastUpdated: Timestamp.now(),
      };
    }
    
    // Get existing quiz attempts for this video
    const existingQuizzes = progress.quizzes[videoId] || [];
    const attempts = existingQuizzes.length + 1;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70; // Passing score threshold
    
    // Add new quiz result
    const newQuizResult: QuizProgress = {
      videoId,
      subjectId,
      categoryId,
      score,
      totalQuestions,
      percentage,
      passed,
      completedAt: Timestamp.now(),
      attempts,
    };
    
    progress.quizzes[videoId] = [...existingQuizzes, newQuizResult];
    progress.lastUpdated = Timestamp.now();
    
    await setDoc(progressRef, progress, { merge: true });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

/**
 * Get completed videos for a user
 */
export const getCompletedVideos = async (userId: string): Promise<string[]> => {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) return [];
    
    return Object.values(progress.videos)
      .filter((video) => video.completed)
      .map((video) => video.videoId);
  } catch (error) {
    console.error('Error getting completed videos:', error);
    return [];
  }
};

/**
 * Get in-progress videos (started but not completed)
 */
export const getInProgressVideos = async (userId: string): Promise<VideoProgress[]> => {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) return [];
    
    return Object.values(progress.videos)
      .filter((video) => !video.completed && video.lastWatchedAt)
      .sort((a, b) => {
        // Sort by last watched date, most recent first
        const aTime = a.lastWatchedAt?.toMillis() || 0;
        const bTime = b.lastWatchedAt?.toMillis() || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error('Error getting in-progress videos:', error);
    return [];
  }
};

/**
 * Get all completed videos with details
 */
export const getCompletedVideosWithDetails = async (userId: string): Promise<VideoProgress[]> => {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) return [];
    
    return Object.values(progress.videos)
      .filter((video) => video.completed)
      .sort((a, b) => {
        // Sort by completion date, most recent first
        const aTime = a.completedAt?.toMillis() || 0;
        const bTime = b.completedAt?.toMillis() || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error('Error getting completed videos with details:', error);
    return [];
  }
};

/**
 * Get quiz results for a specific video
 */
export const getQuizResultsForVideo = async (
  userId: string,
  videoId: string
): Promise<QuizProgress[]> => {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) return [];
    
    return progress.quizzes[videoId] || [];
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return [];
  }
};

/**
 * Get best quiz score for a video
 */
export const getBestQuizScore = async (
  userId: string,
  videoId: string
): Promise<QuizProgress | null> => {
  try {
    const quizResults = await getQuizResultsForVideo(userId, videoId);
    if (quizResults.length === 0) return null;
    
    // Return the quiz with the highest percentage
    return quizResults.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  } catch (error) {
    console.error('Error getting best quiz score:', error);
    return null;
  }
};

/**
 * Get progress statistics for a subject/category
 */
export interface SubjectProgress {
  subjectId?: string;
  categoryId?: string;
  totalVideos: number;
  completedVideos: number;
  progressPercentage: number;
  completedQuizzes: number;
  totalQuizzes: number;
}

export const getSubjectProgress = async (
  userId: string,
  subjectId?: string,
  categoryId?: string
): Promise<SubjectProgress> => {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) {
      return {
        subjectId,
        categoryId,
        totalVideos: 0,
        completedVideos: 0,
        progressPercentage: 0,
        completedQuizzes: 0,
        totalQuizzes: 0,
      };
    }
    
    // Filter videos by subject/category
    const relevantVideos = Object.values(progress.videos).filter((video) => {
      if (subjectId && video.subjectId !== subjectId) return false;
      if (categoryId && video.categoryId !== categoryId) return false;
      return true;
    });
    
    const completedVideos = relevantVideos.filter((v) => v.completed).length;
    const totalVideos = relevantVideos.length;
    const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    // Count quizzes
    const relevantQuizzes = Object.entries(progress.quizzes)
      .filter(([videoId]) => {
        const video = progress.videos[videoId];
        if (!video) return false;
        if (subjectId && video.subjectId !== subjectId) return false;
        if (categoryId && video.categoryId !== categoryId) return false;
        return true;
      })
      .flatMap(([, quizzes]) => quizzes);
    
    const completedQuizzes = relevantQuizzes.filter((q) => q.passed).length;
    const totalQuizzes = relevantQuizzes.length;
    
    return {
      subjectId,
      categoryId,
      totalVideos,
      completedVideos,
      progressPercentage,
      completedQuizzes,
      totalQuizzes,
    };
  } catch (error) {
    console.error('Error getting subject progress:', error);
    return {
      subjectId,
      categoryId,
      totalVideos: 0,
      completedVideos: 0,
      progressPercentage: 0,
      completedQuizzes: 0,
      totalQuizzes: 0,
    };
  }
};

