export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  createdBy: string;
}

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'Что является столицей Казахстана?',
    options: ['Алматы', 'Нур-Султан', 'Шымкент', 'Караганда'],
    correctAnswer: 1,
    subject: 'География',
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'q2',
    question: 'Сколько будет 15 + 27?',
    options: ['40', '42', '45', '48'],
    correctAnswer: 1,
    subject: 'Математика',
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'q3',
    question: 'Кто написал роман "Война и мир"?',
    options: ['А.С. Пушкин', 'Л.Н. Толстой', 'Ф.М. Достоевский', 'И.С. Тургенев'],
    correctAnswer: 1,
    subject: 'Литература',
    difficulty: 'medium',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'q4',
    question: 'В каком году была принята Конституция Республики Казахстан?',
    options: ['1991', '1993', '1995', '1997'],
    correctAnswer: 2,
    subject: 'История',
    difficulty: 'medium',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'q5',
    question: 'Что такое квадратный корень из 64?',
    options: ['6', '7', '8', '9'],
    correctAnswer: 2,
    subject: 'Математика',
    difficulty: 'easy',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

export const SUBJECTS = [
  'Математика',
  'Литература',
  'География',
  'История',
  'Физика',
  'Химия',
  'Биология',
  'Информатика',
  'Английский язык',
  'Казахский язык'
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type UserAnswer = { questionId: string; selectedAnswer: number };
export type TestResult = {
  score: number;
  total: number;
  percentage: number;
  answers: Array<{ questionId: string; selectedAnswer: number; correct: boolean }>;
};

export const getDifficultyColor = (difficulty: string) =>
  difficulty === 'easy'
    ? 'bg-green-100 text-green-800'
    : difficulty === 'medium'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};