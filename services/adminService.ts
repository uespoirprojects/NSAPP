import { db } from '@/lib/firebase';
import type { UserData, UserRole } from '@/services/authService';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';

// Category interfaces
export interface Category {
  id: string;
  name: {
    fr: string;
    ht: string;
    en: string;
    es: string;
  };
  icon: string; // Icon name from predefined list
  color: string; // Icon color (hex code)
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryInput {
  name: {
    fr: string;
    ht: string;
    en: string;
    es: string;
  };
  icon: string; // Icon name from predefined list
  color: string; // Icon color (hex code)
  order: number;
}

// Subject interfaces
export interface Subject {
  id: string;
  categoryId: string;
  playlistId: string; // Required
  quizSlug: string;
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
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubjectInput {
  categoryId: string;
  playlistId: string; // Required
  quizSlug: string;
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
  order: number;
}

// ==================== CATEGORIES ====================

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      return null;
    }
    
    return {
      id: categorySnap.id,
      ...categorySnap.data(),
    } as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CategoryInput): Promise<string> => {
  try {
    const now = Timestamp.now();
    const categoryRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    });
    
    return categoryRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  categoryId: string,
  categoryData: Partial<CategoryInput>
): Promise<void> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // Check if category has subjects
    const subjects = await getSubjectsByCategory(categoryId);
    if (subjects.length > 0) {
      throw new Error('Cannot delete category with existing subjects. Please remove subjects first.');
    }
    
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// ==================== SUBJECTS ====================

/**
 * Get all subjects
 */
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(subjectsRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

/**
 * Get subjects by category
 */
export const getSubjectsByCategory = async (categoryId: string): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[];
  } catch (error) {
    console.error('Error fetching subjects by category:', error);
    throw error;
  }
};

/**
 * Get a single subject by ID
 */
export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  try {
    const subjectRef = doc(db, 'subjects', subjectId);
    const subjectSnap = await getDoc(subjectRef);
    
    if (!subjectSnap.exists()) {
      return null;
    }
    
    return {
      id: subjectSnap.id,
      ...subjectSnap.data(),
    } as Subject;
  } catch (error) {
    console.error('Error fetching subject:', error);
    throw error;
  }
};

/**
 * Create a new subject
 */
export const createSubject = async (subjectData: SubjectInput): Promise<string> => {
  try {
    // Validate playlistId is provided
    if (!subjectData.playlistId || subjectData.playlistId.trim() === '') {
      throw new Error('Playlist ID is required');
    }
    
    const now = Timestamp.now();
    const subjectRef = await addDoc(collection(db, 'subjects'), {
      ...subjectData,
      createdAt: now,
      updatedAt: now,
    });
    
    return subjectRef.id;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

/**
 * Update a subject
 */
export const updateSubject = async (
  subjectId: string,
  subjectData: Partial<SubjectInput>
): Promise<void> => {
  try {
    // Validate playlistId if being updated
    if (subjectData.playlistId !== undefined && subjectData.playlistId.trim() === '') {
      throw new Error('Playlist ID is required');
    }
    
    const subjectRef = doc(db, 'subjects', subjectId);
    await updateDoc(subjectRef, {
      ...subjectData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (subjectId: string): Promise<void> => {
  try {
    console.log('[adminService] Attempting to delete subject:', subjectId);
    const subjectRef = doc(db, 'subjects', subjectId);
    
    // Check if document exists first
    const subjectSnap = await getDoc(subjectRef);
    if (!subjectSnap.exists()) {
      throw new Error(`Subject with ID ${subjectId} does not exist`);
    }
    
    console.log('[adminService] Subject exists, deleting...');
    await deleteDoc(subjectRef);
    console.log('[adminService] Subject deleted successfully');
  } catch (error: any) {
    console.error('[adminService] Error deleting subject:', error);
    console.error('[adminService] Error code:', error?.code);
    console.error('[adminService] Error message:', error?.message);
    throw error;
  }
};

// ==================== STATISTICS ====================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<{
  categoriesCount: number;
  subjectsCount: number;
  usersCount: number;
}> => {
  try {
    const [categoriesSnapshot, subjectsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'subjects')),
      getDocs(collection(db, 'users')),
    ]);
    
    return {
      categoriesCount: categoriesSnapshot.size,
      subjectsCount: subjectsSnapshot.size,
      usersCount: usersSnapshot.size,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== MIGRATION ====================

/**
 * Test Firestore connection by creating a test category
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    const testCategory: CategoryInput = {
      name: {
        fr: 'Test',
        ht: 'Test',
        en: 'Test',
        es: 'Test',
      },
      icon: 'folder-outline',
      color: '#155DFC',
      order: 999,
    };
    
    const categoryId = await createCategory(testCategory);
    
    // Clean up test category
    await deleteCategory(categoryId);
    
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};

/**
 * Migrate hardcoded categories and subjects to Firestore
 */
export const migrateHardcodedData = async (): Promise<{
  categoriesMigrated: number;
  subjectsMigrated: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let categoriesMigrated = 0;
  let subjectsMigrated = 0;
  
  try {
    // Import hardcoded data
    const { subjectModules } = await import('@/constants/subjects');
    const { videoCategories } = await import('@/constants/videos');
    
    // Migrate categories one by one with error handling
    for (const category of videoCategories) {
      try {
        // Check if category already exists
        const existingCategory = await getCategoryById(category.id);
        
        if (!existingCategory) {
          // Map hardcoded category IDs to icons and colors
          const iconMap: Record<string, string> = {
            'computer': 'laptop-outline',
            'mathematics': 'calculator-outline',
            'physics': 'flask-outline',
            'languages': 'globe-outline',
          };
          const colorMap: Record<string, string> = {
            'computer': '#155DFC', // Blue
            'mathematics': '#4CAF50', // Green
            'physics': '#FF9800', // Orange
            'languages': '#9C27B0', // Purple
          };
          
          await createCategory({
            name: category.name,
            icon: iconMap[category.id] || 'folder-outline',
            color: colorMap[category.id] || '#155DFC',
            order: videoCategories.indexOf(category) + 1,
          });
          categoriesMigrated++;
        }
      } catch (error: any) {
        const errorMsg = `Failed to migrate category "${category.id}": ${error.message}`;
        console.error(errorMsg, error);
        errors.push(errorMsg);
      }
    }
    
    // Get all existing subjects once
    let allSubjects: Subject[] = [];
    try {
      allSubjects = await getSubjects();
    } catch (error: any) {
      console.warn('Could not fetch existing subjects, continuing anyway:', error);
    }
    
    // Migrate subjects one by one with error handling
    for (const subject of subjectModules) {
      try {
        // Check if subject already exists (by checking if any subject has same playlistId)
        const exists = allSubjects.some((s) => s.playlistId === subject.playlistId);
        
        if (!exists) {
          await createSubject({
            categoryId: subject.categoryId,
            playlistId: subject.playlistId,
            quizSlug: subject.quizSlug,
            title: subject.title,
            description: subject.description,
            order: subject.order,
          });
          subjectsMigrated++;
        }
      } catch (error: any) {
        const errorMsg = `Failed to migrate subject "${subject.id}": ${error.message}`;
        console.error(errorMsg, error);
        errors.push(errorMsg);
      }
    }
    
    return {
      categoriesMigrated,
      subjectsMigrated,
      errors,
    };
  } catch (error: any) {
    const errorMsg = `Migration failed: ${error.message}`;
    console.error(errorMsg, error);
    errors.push(errorMsg);
    throw new Error(errorMsg);
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Admin user type (extends UserData with id)
 */
export interface AdminUser extends UserData {
  id: string;
}

/**
 * Get all users
 */
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminUser[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Update a user's role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

