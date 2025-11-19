import { SubjectModule } from '@/types/subject';

export const subjectModules: SubjectModule[] = [
  {
    id: 'excel',
    categoryId: 'computer',
    playlistId: 'PLClySGDbKZTRzwF7LI8paxadsacTVuV9r',
    quizSlug: 'excel',
    order: 1,
    title: {
      fr: 'Introduction à Microsoft Excel',
      ht: 'Entwodiksyon nan Microsoft Excel',
      en: 'Introduction to Microsoft Excel',
      es: 'Introducción a Microsoft Excel',
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
    playlistId: 'PLClySGDbKZTTSDanXKN4RhhHoB5bEUcJz',
    quizSlug: 'word',
    order: 2,
    title: {
      fr: 'Introduction à Microsoft Word',
      ht: 'Entwodiksyon nan Microsoft Word',
      en: 'Introduction to Microsoft Word',
      es: 'Introducción a Microsoft Word',
    },
  },
  {
    id: 'basic-computer',
    categoryId: 'computer',
    playlistId: 'PLClySGDbKZTTGGcBR0ZzXmIxKbTQTTQhU',
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
    playlistId: 'PLClySGDbKZTRy-sYzq5HRfaUwllJ8HGEX',
    quizSlug: 'algorithm',
    order: 4,
    title: {
      fr: 'introduction à l\'algorithmique',
      ht: 'Entwodiksyon nan algoritmik',
      en: 'Introduction to Algorithms',
      es: 'Introducción a los Algoritmos',
    },
  },
  {
    id: 'intro-html',
    categoryId: 'computer',
    playlistId: 'PLClySGDbKZTSYh57CgGG-G5jjmFITfv9h',
    quizSlug: 'intro-html',
    order: 5,
    title: {
      fr: 'Introduction HTML',
      ht: 'Entwodiksyon HTML',
      en: 'Intro HTML',
      es: 'Introducción HTML',
    },
    description: {
      fr: 'Apprenez les bases du HTML pour créer des pages web.',
      ht: 'Aprann baz HTML yo pou kreye paj entènèt.',
      en: 'Learn the basics of HTML to create web pages.',
      es: 'Aprende los conceptos básicos de HTML para crear páginas web.',
    },
  },
];

export const getSubjectById = (subjectId: string): SubjectModule | undefined =>
  subjectModules.find((subject) => subject.id === subjectId);

export const getSubjectsByCategory = (categoryId: string): SubjectModule[] =>
  subjectModules
    .filter((subject) => subject.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);

