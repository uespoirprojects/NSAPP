import { SubjectModule } from '@/types/subject';

export const subjectModules: SubjectModule[] = [
  {
    id: 'excel',
    categoryId: 'computer',
    playlistId: 'PLClySGDbKZTRzwF7LI8paxadsacTVuV9r',
    quizSlug: 'excel',
    order: 1,
    title: {
      fr: 'Excel',
      ht: 'Excel',
      en: 'Excel',
      es: 'Excel',
    },
    description: {
      fr: 'Cours sur Excel pour maîtriser les bases et aller plus loin.',
      ht: 'Kou Excel pou metrize baz yo epi ale pi lwen.',
      en: 'Excel lessons covering core concepts and practical skills.',
      es: 'Clases de Excel que cubren conceptos básicos y habilidades prácticas.',
    },
  },
  {
    id: 'word',
    categoryId: 'computer',
    playlistId: '',
    quizSlug: 'word',
    order: 2,
    title: {
      fr: 'Word',
      ht: 'Word',
      en: 'Word',
      es: 'Word',
    },
  },
  {
    id: 'basic-computer',
    categoryId: 'computer',
    playlistId: '',
    quizSlug: 'basic-computer',
    order: 3,
    title: {
      fr: 'Informatique de base',
      ht: 'Informatik debaz',
      en: 'Basic Computer',
      es: 'Computación básica',
    },
  },
  {
    id: 'algorithm',
    categoryId: 'computer',
    playlistId: '',
    quizSlug: 'algorithm',
    order: 4,
    title: {
      fr: 'Algorithmie',
      ht: 'Algoritm',
      en: 'Algorithms',
      es: 'Algoritmos',
    },
  },
];

export const getSubjectById = (subjectId: string): SubjectModule | undefined =>
  subjectModules.find((subject) => subject.id === subjectId);

export const getSubjectsByCategory = (categoryId: string): SubjectModule[] =>
  subjectModules
    .filter((subject) => subject.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);

