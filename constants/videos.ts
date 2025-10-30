import { Video, VideoCategory } from '@/types/video';

const computerVideos: Video[] = [
  {
    id: '1',
    categoryId: 'computer',
    videoId: 'py0gOWtjQJI',
    platform: 'youtube',
    title: {
      fr: 'Algorithme #1 - Introduction à l\'algorithme',
      ht: 'Algoritm #1 - Entwodiksyon nan algoritm',
      en: 'Algorithm #1 - Introduction to Algorithms',
      es: 'Algoritmo #1 - Introducción a los Algoritmos',
    },
    description: {
      fr: 'Introduction aux concepts de base des algorithmes',
      ht: 'Entwodiksyon nan konsèp debaz algoritm yo',
      en: 'Introduction to basic algorithm concepts',
      es: 'Introducción a los conceptos básicos de algoritmos',
    },
    order: 1,
  },
  {
    id: '2',
    categoryId: 'computer',
    videoId: 'dIPl-oKGizI',
    platform: 'youtube',
    title: {
      fr: 'Algorithme #2 - Les Variables',
      ht: 'Algoritm #2 - Varyab yo',
      en: 'Algorithm #2 - Variables',
      es: 'Algoritmo #2 - Las Variables',
    },
    description: {
      fr: 'Comprendre le concept de variables dans les algorithmes',
      ht: 'Konprann konsèp varyab nan algoritm yo',
      en: 'Understanding the concept of variables in algorithms',
      es: 'Entender el concepto de variables en algoritmos',
    },
    order: 2,
  },
  {
    id: '3',
    categoryId: 'computer',
    videoId: 'WVyszzfKlNM',
    platform: 'youtube',
    title: {
      fr: 'Algorithme #3 - Instruction d\'affectation',
      ht: 'Algoritm #3 - Enstriksyon afektasyon',
      en: 'Algorithm #3 - Assignment Instruction',
      es: 'Algoritmo #3 - Instrucción de Asignación',
    },
    description: {
      fr: 'Apprendre les instructions d\'affectation en algorithmes',
      ht: 'Aprann enstriksyon afektasyon nan algoritm',
      en: 'Learning assignment instructions in algorithms',
      es: 'Aprendiendo instrucciones de asignación en algoritmos',
    },
    order: 3,
  },
  {
    id: '4',
    categoryId: 'computer',
    videoId: 'sWPh9NzxOJM',
    platform: 'youtube',
    title: {
      fr: 'Algorithme #4 - Ordre des Instructions',
      ht: 'Algoritm #4 - Lòd Enstriksyon yo',
      en: 'Algorithm #4 - Order of Instructions',
      es: 'Algoritmo #4 - Orden de las Instrucciones',
    },
    description: {
      fr: 'Comprendre l\'ordre et la séquence des instructions',
      ht: 'Konprann lòd ak sekans enstriksyon yo',
      en: 'Understanding the order and sequence of instructions',
      es: 'Entender el orden y secuencia de instrucciones',
    },
    order: 4,
  },
  {
    id: '5',
    categoryId: 'computer',
    videoId: '3A4wrhFxDxA',
    platform: 'youtube',
    title: {
      fr: 'Algorithme #5 - Exercice I',
      ht: 'Algoritm #5 - Egzèsis I',
      en: 'Algorithm #5 - Exercise I',
      es: 'Algoritmo #5 - Ejercicio I',
    },
    description: {
      fr: 'Exercice pratique sur les concepts appris',
      ht: 'Egzèsis pratik sou konsèp yo aprann',
      en: 'Practical exercise on learned concepts',
      es: 'Ejercicio práctico sobre conceptos aprendidos',
    },
    order: 5,
  },
];

// Placeholder videos for other categories (empty for now)
const mathematicsVideos: Video[] = [];
const physicsVideos: Video[] = [];
const languagesVideos: Video[] = [];

export const videoCategories: VideoCategory[] = [
  {
    id: 'computer',
    name: {
      fr: 'Informatique',
      ht: 'Enfòmatik',
      en: 'Computer',
      es: 'Informática',
    },
    videos: computerVideos,
  },
  {
    id: 'mathematics',
    name: {
      fr: 'Mathématiques',
      ht: 'Matematik',
      en: 'Mathematics',
      es: 'Matemáticas',
    },
    videos: mathematicsVideos,
  },
  {
    id: 'physics',
    name: {
      fr: 'Physique',
      ht: 'Fizik',
      en: 'Physics',
      es: 'Física',
    },
    videos: physicsVideos,
  },
  {
    id: 'languages',
    name: {
      fr: 'Langues',
      ht: 'Lang',
      en: 'Languages',
      es: 'Idiomas',
    },
    videos: languagesVideos,
  },
];

/**
 * Get all videos for a specific category
 */
export function getVideosByCategory(categoryId: string): Video[] {
  const category = videoCategories.find((cat) => cat.id === categoryId);
  return category?.videos || [];
}

/**
 * Get a single video by ID
 */
export function getVideoById(videoId: string): Video | undefined {
  for (const category of videoCategories) {
    const video = category.videos.find((v) => v.id === videoId);
    if (video) return video;
  }
  return undefined;
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): VideoCategory | undefined {
  return videoCategories.find((cat) => cat.id === categoryId);
}
