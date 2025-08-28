import { Question } from '../dataService';

function letterToIndex(letter: string): number {
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  return map[letter.toUpperCase()] ?? 0;
}

export const historyKZSeedKZ: Question[] = [
  {
    id: 'hist-kz-1',
    question: 'IV ғасырдың ортасында Рим империясының шекарасына дейін жеткендер',
    type: 'multiple_choice',
    options: ['қарлұқтар', 'ғұндар', 'қидандар', 'сақтар'],
    correct_answer: letterToIndex('B'),
    correctAnswer: letterToIndex('B'),
    explanation: 'IV ғасырдың ортасында ғұндар Ұлы қоныс аударуды бастап, Рим империясының шекарасына жетті.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-2',
    question: 'Шайқастарда ерекше, бірнеше мәрте ерлік көрсеткен жауынгерге берілген атақ',
    type: 'multiple_choice',
    options: ['«ақсақал»', '«тақсыр»', '«толұ батыр»', '«төре»'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: '«Толұ батыр» — бірнеше мәрте ерлік көрсеткен жауынгерге берілетін құрметті атақ.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-3',
    question: '60 мың әскерден құралған біріккен қол жоңғарларға қарсы соғысқан шайқас',
    type: 'multiple_choice',
    options: ['Бұланты', 'Орбұлақ', 'Аягөз', 'Аңырақай'],
    correct_answer: letterToIndex('D'),
    correctAnswer: letterToIndex('D'),
    explanation: '1729 жылы Аңырақай шайқасында үш жүздің біріккен 60 мыңдық әскері жоңғарларға күйрете соққы берді.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-4',
    question: 'XX ғасырдың басында салынған',
    type: 'multiple_choice',
    options: ['Орынбор-Ташкент теміржолы', 'Ертіс-Қарағанды су арнасы', 'Қапшағай электр станциясы', 'Шүлбі ГЭС-і'],
    correct_answer: letterToIndex('A'),
    correctAnswer: letterToIndex('A'),
    explanation: 'Орынбор-Ташкент теміржолы 1901–1906 жылдары салынып, экономикалық маңызы зор болды.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-5',
    question: '1956 жылы Сталиннің жеке басқа табынушылығын әшкерелеген',
    type: 'multiple_choice',
    options: ['XIX партия конференциясы', 'ҚКП ОК V пленумы', 'КПСС XXVII съезі', 'КПСС XX съезі'],
    correct_answer: letterToIndex('D'),
    correctAnswer: letterToIndex('D'),
    explanation: '1956 жылғы КПСС XX съезінде Сталиннің жеке басқа табынушылығы әшкереленіп, «жылымық» дәуірі басталды.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-6',
    question: 'Қырғыздың «Манас» эпосын жазып алған',
    type: 'multiple_choice',
    options: ['Абай Құнанбаев', 'Ыбырай Алтынсарин', 'Шоқан Уәлиханов', 'Әлихан Бөкейханов'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: 'Шоқан Уәлиханов қырғыздың «Манас» эпосын жазып алып, этнографияға зор үлес қосты.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-7',
    question: 'Кеш қола дәуіріндегі көшпелілер жетік меңгерген өнер',
    type: 'multiple_choice',
    options: ['бояу жасау құпиясы', 'тоған салу әдістері', 'металл қорыту өнері', 'фарфор жасау әдістері'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: 'Кеш қола дәуірінде көшпелілер мыс, қола және басқа да металдарды қорыту өнерін жетік меңгерді.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-8',
    question: 'Ақ Орда астанасы',
    type: 'multiple_choice',
    options: ['Отрар', 'Үзгент', 'Сығанақ', 'Ташкент'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: 'Сығанақ — Ақ Орданың астанасы, ірі саяси және сауда орталығы.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-9',
    question: '1824 жылғы Кіші жүз реформасының авторы',
    type: 'multiple_choice',
    options: ['О.Игельстром', 'П.Эссен', 'Н.Коншин', 'М.Сперанский'],
    correct_answer: letterToIndex('B'),
    correctAnswer: letterToIndex('B'),
    explanation: '1824 жылғы реформа авторы — генерал-губернатор П.Эссен, ол Кіші жүзде хандық билікті жойды.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  {
    id: 'hist-kz-10',
    question: 'Ұлы Отан соғысы жылдарында (1941–1945 жж.) Мәскеу түбіндегі шайқаста ерекше ерлік көрсеткен Кеңес Одағының Батыры',
    type: 'multiple_choice',
    options: ['С.Нұрмағамбетов', 'Н.Әбдіров', 'Б.Момышұлы', 'Ж.Елеусов'],
    correct_answer: letterToIndex('C'),
    correctAnswer: letterToIndex('C'),
    explanation: 'Бауыржан Момышұлы Мәскеу түбіндегі шайқаста ерекше әскери шеберлік танытты.',
    subject: 'history_kz',
    difficulty: 'medium',
    lang: 'kz'
  },
  // ... continue similarly up to 20
];


