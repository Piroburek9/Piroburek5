import { Question } from '../dataService';

function letterToIndex(letter: string): number {
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  return map[letter.toUpperCase()] ?? 0;
}

export const mathLiteracySeed: Question[] = [
  {
    id: 'ml-ru-1',
    question: 'Если x = 2¹²¹⁷, тогда 2¹²²⁰=?',
    type: 'multiple_choice',
    options: ['3x', '1220x', '8x', '1217'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: '2¹²²⁰ = 2¹²¹⁷ × 2³ = 8x.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  },
  {
    id: 'ml-ru-2',
    question: 'По данным таблицы значение a·b·c равно (данные: a=8, b=4).',
    type: 'multiple_choice',
    options: ['32', '8', '6', '4'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: 'a·b·c = 8 × 4 × 1 = 32.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  },
  {
    id: 'ml-ru-3',
    question: 'Вычислите среднее арифметическое чисел: 2; 6; 11; 13; 2; 11; 2; 13; 3; 2',
    type: 'multiple_choice',
    options: ['10', '7,5', '6,5', '8'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: 'Сумма 65, 65/10 = 6,5.',
    subject: 'math_literacy',
    difficulty: 'easy',
    lang: 'ru'
  },
  {
    id: 'ml-ru-4',
    question: 'В корзине 9 красных, 5 синих и 6 желтых шариков. Вероятность выбрать синий?',
    type: 'multiple_choice',
    options: ['0,25', '0,3', '0,75', '0,6'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: '5/20 = 0,25.',
    subject: 'math_literacy',
    difficulty: 'easy',
    lang: 'ru'
  },
  {
    id: 'ml-ru-5',
    question: 'Прямоугольник разбит на четыре. Периметры A=25, B=29, C=18. Найдите периметр четвертого прямоугольника.',
    type: 'multiple_choice',
    options: ['13', '14', '11', '16'],
    correct_answer: letterToIndex('B'),
    correctAnswer: letterToIndex('B'),
    explanation: 'По системе уравнений периметр равен 14.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  },
  {
    id: 'ml-ru-6',
    question: 'По диаграмме продаж: найдите долю холодильников (известны 20%, 24%, 14%).',
    type: 'multiple_choice',
    options: ['22%', '20%', '18%', '16%'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: 'Оставшиеся проценты до 100% дают 22%.',
    subject: 'math_literacy',
    difficulty: 'easy',
    lang: 'ru'
  },
  {
    id: 'ml-ru-7',
    question: 'Сколькими способами выбрать 5 ложек из 7 и 10 вилок из 12?',
    type: 'multiple_choice',
    options: ['1386', '1380', '1340', '1250'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: 'C(7,5)·C(12,10) = 21·66 = 1386.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  },
  {
    id: 'ml-ru-8',
    question: 'Среднее арифметическое оценок (5:5 шт, 4:10 шт, 3:12 шт). Округлите до сотых.',
    type: 'multiple_choice',
    options: ['3,65', '3,74', '4,01', '3,71'],
    correct_answer: letterToIndex('B'),
    correctAnswer: letterToIndex('B'),
    explanation: '(25+40+36)/27 = 101/27 ≈ 3,74.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  },
  {
    id: 'ml-ru-9',
    question: 'Заработок официанта — 10% от заказа. Найдите заработок за день по таблице.',
    type: 'multiple_choice',
    options: ['5400 тенге', '5200 тенге', '5600 тенге', '4400 тенге'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: 'Сумма 10% по позициям = 5400 тг.',
    subject: 'math_literacy',
    difficulty: 'easy',
    lang: 'ru'
  },
  {
    id: 'ml-ru-10',
    question: 'Фигура из кубов со стороной 3. Найдите площадь полной поверхности.',
    type: 'multiple_choice',
    options: ['172', '180', '216', '198'],
    correct_answer: letterToIndex('B'),
    correctAnswer: letterToIndex('B'),
    explanation: 'Итог 180 после учета перекрытий.',
    subject: 'math_literacy',
    difficulty: 'medium',
    lang: 'ru'
  }
];


