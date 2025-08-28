// Simple data service for the educational platform
import { getTopicTranslation, detectTopicFromQuestion, getTopicCodeFromMeta } from './topicTranslations';
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'tutor';
  tests_completed?: number;
  average_score?: number;
  study_streak?: number;
  total_study_time?: number;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit?: number;
  questions: Question[];
  created_by?: string;
  created_at?: string;
}

export interface Question {
  id: string;
  question: string;
  type:
    | 'multiple_choice'
    | 'multi_select'
    | 'numeric'
    | 'matching'
    | 'true_false'
    | 'text'
    | 'image'
    | 'latex';
  options?: string[]; // for multiple_choice/multi_select
  correct_answer: number | string | number[] | Record<string, string>;
  // Provide camelCase alias for UI components that expect it
  correctAnswer?: number;
  // Optional metadata used by UI
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  lang?: 'ru' | 'kz';
  explanation?: string;
  imageUrl?: string; // for image questions
  // Optional metadata for classification (domain/topic/context, etc.)
  meta?: Record<string, any>;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  answers: any[];
  score: number;
  time_spent: number;
  completed_at: string;
  attempt_id?: string;
}

export interface UserStats {
  testsCompleted: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  studyTime: number;
  streak: number;
  rank: string;
  achievements: string[];
  recentTests: Array<{
    subject: string;
    score: number;
    total: number;
    percentage: number;
    completedAt: string;
  }>;
}

// Mock data storage
class MockDataService {
  private users: Map<string, User> = new Map();
  private tests: Map<string, Test> = new Map();
  private customQuestionsBySubject: Record<string, Question[]> = {};
  private results: Map<string, TestResult> = new Map();
  private lastAnalysisByUser: Map<string, any> = new Map();
  private generatedAttempts: Map<string, { id: string; subjectKey: string; title: string; language: 'ru'|'kz'|'en'; questions: Question[]; created_at: string } > = new Map();

  // Expose generated attempts for teacher reports
  getAttempts(): Array<{ id: string; subjectKey: string; title: string; language: 'ru'|'kz'|'en'; questions: Question[]; created_at: string } > {
    return Array.from(this.generatedAttempts.values()).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  }

  getAttemptById(id: string) {
    return this.generatedAttempts.get(id);
  }
  private currentUser: User | null = null;
  private authToken: string | null = null;

  // Image URLs for questions
  private mathImages = [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop'
  ];

  private physicsImages = [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  ];

  constructor() {
    this.initializeMockData();
    // Try to load auth token from localStorage
    this.authToken = localStorage.getItem('auth_token');
    // Seed imported history if not present
    import('./seeds/historyKZSeed')
      .then(mod => {
        this.customQuestionsBySubject['history_kz'] = [
          ...(this.customQuestionsBySubject['history_kz'] || []),
          ...mod.historyKZSeed
        ];
      })
      .catch(() => {});
    import('./seeds/historyKZSeed_kz')
      .then(mod => {
        this.customQuestionsBySubject['history_kz'] = [
          ...(this.customQuestionsBySubject['history_kz'] || []),
          ...mod.historyKZSeedKZ
        ];
      })
      .catch(() => {});
    import('./seeds/mathLiteracySeed')
      .then(mod => {
        this.customQuestionsBySubject['math_literacy'] = [
          ...(this.customQuestionsBySubject['math_literacy'] || []),
          ...mod.mathLiteracySeed
        ];
      })
      .catch(() => {});
    import('./seeds/mathLiteracySeed_kz')
      .then(mod => {
        this.customQuestionsBySubject['math_literacy'] = [
          ...(this.customQuestionsBySubject['math_literacy'] || []),
          ...mod.mathLiteracySeedKZ
        ];
      })
      .catch(() => {});
  }

  // Helper methods to get random images
  private getRandomMathImage(): string {
    const randomIndex = Math.floor(Math.random() * this.mathImages.length);
    return this.mathImages[randomIndex];
  }

  private getRandomPhysicsImage(): string {
    const randomIndex = Math.floor(Math.random() * this.physicsImages.length);
    return this.physicsImages[randomIndex];
  }

  private initializeMockData() {
    // Sample tests
    const sampleTests: Test[] = [
      {
        id: 'test-1',
        title: 'Математика - Алгебра',
        subject: 'mathematics',
        difficulty: 'medium',
        time_limit: 1800, // 30 minutes
        questions: [
          {
            id: 'q1',
            question: 'Решите уравнение: 2x + 5 = 13',
            type: 'multiple_choice',
            options: ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
            correct_answer: 0,
            explanation: '2x + 5 = 13, значит 2x = 8, откуда x = 4'
          },
          {
            id: 'q2',
            question: 'Найдите значение выражения: (3 + 2) × 4',
            type: 'multiple_choice',
            options: ['20', '18', '14', '16'],
            correct_answer: 0,
            explanation: 'Сначала вычисляем в скобках: 3 + 2 = 5, затем 5 × 4 = 20'
          },
          {
            id: 'q3',
            question: 'Что больше: 0.5 или 1/3?',
            type: 'multiple_choice',
            options: ['0.5', '1/3', 'Равны', 'Невозможно определить'],
            correct_answer: 0,
            explanation: '0.5 = 1/2 = 3/6, а 1/3 = 2/6. Значит 0.5 > 1/3'
          }
        ]
      },
      {
        id: 'test-2',
        title: 'История России - 19 век',
        subject: 'history',
        difficulty: 'easy',
        time_limit: 1200, // 20 minutes
        questions: [
          {
            id: 'q1',
            question: 'В каком году была отменена крепостное право в России?',
            type: 'multiple_choice',
            options: ['1861', '1860', '1862', '1859'],
            correct_answer: 0,
            explanation: 'Крепостное право было отменено Александром II в 1861 году'
          },
          {
            id: 'q2',
            question: 'Кто был императором России в начале 19 века?',
            type: 'multiple_choice',
            options: ['Александр I', 'Николай I', 'Александр II', 'Павел I'],
            correct_answer: 0,
            explanation: 'Александр I правил с 1801 по 1825 год'
          }
        ]
      },
      {
        id: 'test-3',
        title: 'Физика - Механика',
        subject: 'physics',
        difficulty: 'hard',
        time_limit: 2400, // 40 minutes
        questions: [
          {
            id: 'q1',
            question: 'Второй закон Ньютона формулируется как:',
            type: 'multiple_choice',
            options: ['F = ma', 'F = mv', 'F = mg', 'F = ma²'],
            correct_answer: 0,
            explanation: 'Второй закон Ньютона: сила равна произведению массы на ускорение'
          },
          {
            id: 'q2',
            question: 'Единица измерения силы в СИ:',
            type: 'multiple_choice',
            options: ['Ньютон', 'Джоуль', 'Ватт', 'Паскаль'],
            correct_answer: 0,
            explanation: 'Сила измеряется в ньютонах (Н) в системе СИ'
          }
        ]
      }
    ];

    sampleTests.forEach(test => this.tests.set(test.id, test));
  }

  // Helper method to check if backend is available
  private async isBackendAvailable(): Promise<boolean> {
    try {
      // Allow forcing local-only mode to avoid 404s in dev
      const useBackendFlag = localStorage.getItem('use_backend');
      if (useBackendFlag === '0') return false;
      const response = await fetch('/api/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<User> {
    try {
      // Try backend first
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          this.currentUser = data.user as User;
          this.authToken = data.token;
          localStorage.setItem('auth_token', this.authToken!);
          return data.user as User;
        }
      }
    } catch (error) {
      console.log('Backend login failed, using local auth');
    }

    // Fallback to local auth
    // Demo credentials
    if (email === 'demo@example.com' && password === 'password123') {
      const user: User = {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'student',
        tests_completed: 3,
        average_score: 85,
        study_streak: 5,
        total_study_time: 180 // minutes
      };
      this.currentUser = user;
      this.users.set(user.id, user);
      return user;
    }

    // Allow any email for demo purposes
    const user: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'student',
      tests_completed: 0,
      average_score: 0,
      study_streak: 0,
      total_study_time: 0
    };
    this.currentUser = user;
    this.users.set(user.id, user);
    return user;
  }

  async register(email: string, password: string, name: string, role: string): Promise<User> {
    try {
      // Try backend first
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role })
        });

        if (response.ok) {
          const data = await response.json();
          this.currentUser = data.user as User;
          return data.user as User;
        }
      }
    } catch (error) {
      console.log('Backend registration failed, using local auth');
    }

    // Fallback to local registration
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      role: role as 'student' | 'teacher' | 'tutor',
      tests_completed: 0,
      average_score: 0,
      study_streak: 0,
      total_study_time: 0
    };
    this.currentUser = user;
    this.users.set(user.id, user);
    return user;
  }

  async logout(): Promise<void> {
    try {
      if (this.authToken && await this.isBackendAvailable()) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          }
        });
      }
    } catch (error) {
      console.log('Backend logout failed');
    }

    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Test methods
  async getTests(): Promise<Test[]> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/tests');
        if (response.ok) {
          return await response.json();
        }
        if (response.status === 404) throw new Error('Backend /api/tests not found');
      }
    } catch (error) {
      console.log('Backend tests failed, using local data');
    }

    return Array.from(this.tests.values());
  }

  async getTest(id: string): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test> {
    const test: Test = {
      ...testData,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.tests.set(test.id, test);
    return test;
  }

  // Question management methods
  async getQuestions(): Promise<Question[]> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/questions');
        if (response.ok) {
          return await response.json();
        }
        // If endpoint not found, gracefully fall back to local data
        if (response.status === 404) throw new Error('Backend /api/questions not found');
      }
    } catch (error) {
      console.log('Backend questions failed, using local data');
    }

    // Return questions from all tests + custom imported
    const allQuestions: Question[] = [];
    this.tests.forEach(test => {
      test.questions.forEach(question => {
        allQuestions.push({
          ...question,
          subject: test.subject,
          difficulty: test.difficulty,
          explanation: question.explanation,
          // normalize for UI components
          correctAnswer: typeof question.correct_answer === 'number' ? (question.correct_answer as number) : 0,
        });
      });
    });
    // Append custom questions grouped by ENT subject keys
    Object.entries(this.customQuestionsBySubject).forEach(([subject, list]) => {
      list.forEach(q => {
        allQuestions.push({
          ...q,
          subject,
          correctAnswer: typeof q.correct_answer === 'number' ? (q.correct_answer as number) : 0,
        });
      });
    });
    return allQuestions;
  }

  async generateQuiz(subject: string, difficulty: string, count: number): Promise<{ questions: Question[]; isDemo: boolean }> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/ai/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ subject, difficulty, count })
        });

        if (response.ok) {
          const data = await response.json();
          return { questions: data.questions, isDemo: false };
        }
        if (response.status === 404) throw new Error('Backend /api/ai/generate-quiz not found');
      }
    } catch (error) {
      console.error('AI quiz generation error:', error);
    }

    // Fallback to demo quiz generation
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation time

    const demoQuestions: Question[] = [
      {
        id: 'ai-q1',
        question: `Вопрос по теме "${subject}" (сложность: ${difficulty})`,
        type: 'multiple_choice',
        options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
        correct_answer: 0,
        explanation: 'Это демонстрационный вопрос, сгенерированный ИИ.'
      },
      {
        id: 'ai-q2',
        question: `Ещё один вопрос по "${subject}"`,
        type: 'multiple_choice',
        options: ['Ответ A', 'Ответ B', 'Ответ C', 'Ответ D'],
        correct_answer: 1,
        explanation: 'Демо-объяснение для второго вопроса.'
      }
    ];

    return { questions: demoQuestions.slice(0, count), isDemo: true };
  }

  /**
   * Generate a Math Literacy (Математическая грамотность) test strictly per spec:
   * - 10 questions, multiple_choice, one correct answer
   * - Difficulty distribution A/B/C = 50%/30%/20% (easy/medium/hard)
   * - Coverage across domains and topic codes 01..10
   */
  async generateMathLiteracySpecTest(): Promise<{ questions: Question[]; isDemo: boolean }> {
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const makeMC = (q: string, options: (string|number)[], correctIdx: number, expl: string, topicCode: string, diff: 'easy'|'medium'|'hard', imageUrl?: string): Question => {
      // Map Math Literacy numeric codes → canonical keys used in TOPIC_TRANSLATIONS
      const ML_MAP: Record<string, string> = {
        '01': 'numerical_reasoning',
        '02': 'text_problems',
        '03': 'percentages_diagrams',
        '04': 'statistics_measures',
        '05': 'probability_combinatorics',
        '06': 'proportional_dependence',
        '07': 'sequences_tables',
        '08': 'geometric_logic',
        '09': 'area_perimeter',
        '10': 'surface_area_solids',
      };
      const mlKey = ML_MAP[String(topicCode)] || 'numerical_reasoning';
      const topicTranslation = getTopicTranslation(mlKey, 'ru');
      const topicTranslationKz = getTopicTranslation(mlKey, 'kz');
      const fullTopicCode = `mathlit_${String(topicCode)}`;

      return {
        id: `ml-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        question: q,
        type: 'multiple_choice',
        options: options.map(String),
        correct_answer: correctIdx,
        correctAnswer: correctIdx,
        explanation: expl,
        subject: 'math_literacy',
        difficulty: diff,
        lang: 'ru',
        imageUrl: imageUrl,
        meta: { 
          // Preserve two-digit domain for legacy checks while storing canonical code
          domain: String(topicCode).slice(0,2),
          topicCode: fullTopicCode,
          detectedTopic: mlKey,
          topicTranslation,
          topicCodeKz: topicTranslationKz,
          topicCodeRu: topicTranslation
        }
      };
    };

    // 01: логические задания с числовыми значениями
    const gen01 = (diff: 'easy'|'medium'|'hard'): Question => {
      const a = randomInt(10, diff==='hard'?99:49);
      const b = randomInt(5, diff==='hard'?97:43);
      const sum = a + b;
      const opts = shuffle([sum, sum+randomInt(1,3), sum- randomInt(1,3), a*b]).map(String);
      const idx = opts.indexOf(String(sum));
      return makeMC(`Чему равно ${a} + ${b}?`, opts, idx, `Сумма чисел ${a}+${b}=${sum}`, '01', diff);
    };

    // 02: текстовые задачи с уравнениями (включая квадратные)
    const gen02 = (diff: 'easy'|'medium'|'hard'): Question => {
      if (diff === 'hard') {
        // Quadratic equation example: x² + 4x - 5 = 0
        const a = 1;
        const b = 4;
        const c = -5;
        const discriminant = b*b - 4*a*c;
        const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
        const correct = Math.round(x1); // Positive root
        const options = shuffle([correct, Math.round(x2), correct+1, correct-1]);
        const idx = options.indexOf(correct);
        return makeMC(
          `Решите квадратное уравнение: x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0. Найдите положительный корень.`, 
          options, 
          idx, 
          `x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0; D = ${b}² - 4·1·${c} = ${discriminant}; x = ${correct}`, 
          '02', 
          diff
        );
      } else {
        // Linear equation
        const x = randomInt(2, diff==='medium'?15:10);
        const total = x*2 + 5;
        const opts = shuffle([x, x+1, x-1, x+2]);
        const idx = opts.indexOf(x);
        return makeMC(`Сумма двух одинаковых чисел и 5 равна ${total}. Найдите число x.`, opts, idx, `2x+5=${total} ⇒ x=${x}`, '02', diff);
      }
    };

    // 03: проценты и диаграммы (проценты)
    const gen03 = (diff: 'easy'|'medium'|'hard'): Question => {
      const price = randomInt(500, diff==='hard'?20000:8000);
      const discount = [5,10,15,20,25][randomInt(0, diff==='hard'?4:3)];
      const correct = Math.round(price*(1-discount/100));
      const options = shuffle([correct, correct+randomInt(50,200), Math.round(price*discount/100), correct-randomInt(50,200)]);
      const idx = options.indexOf(correct);
      return makeMC(`Товар стоит ${price} тг. Скидка ${discount}%. Какова новая цена?`, options, idx, `Новая цена = ${price}×(1-${discount}/100) = ${correct} тг`, '03', diff);
    };

    // 04: среднее, размах, медиана, мода
    const gen04 = (diff: 'easy'|'medium'|'hard'): Question => {
      const n = diff==='hard'?7:5;
      const arr = Array.from({length:n},()=>randomInt(1,20)).sort((a,b)=>a-b);
      const mean = Math.round(arr.reduce((s,v)=>s+v,0)/arr.length);
      const options = shuffle([mean, mean+1, Math.max(0, mean-1), mean+2]);
      const idx = options.indexOf(mean);
      return makeMC(`Найдите среднее арифметическое чисел: [${arr.join(', ')}]`, options, idx, `Среднее = сумма/количество = ${mean}`, '04', diff);
    };

    // 05: вероятности/комбинаторика/таблицы частот (простейшее)
    const gen05 = (diff: 'easy'|'medium'|'hard'): Question => {
      const red = randomInt(2,5); const blue = randomInt(2,5);
      const total = red+blue; const correct = `${red}/${total}`;
      const options = shuffle([correct, `${blue}/${total}`, `${total}/${red}`, `${red}/${blue}`]);
      const idx = options.indexOf(correct);
      return makeMC(`В коробке ${red} красных и ${blue} синих шаров. Вероятность достать красный шар:`, options, idx, `P(красный)=${red}/${total}`, '05', diff);
    };

    // 06: зависимость одной величины от другой (пропорции)
    const gen06 = (diff: 'easy'|'medium'|'hard'): Question => {
      const speed = randomInt(30, diff==='hard'?90:60);
      const time = randomInt(1, diff==='hard'?4:3);
      const dist = speed*time;
      const options = shuffle([dist, dist+randomInt(5,15), Math.max(0, dist-randomInt(5,15)), dist+10]);
      const idx = options.indexOf(dist);
      return makeMC(`Автомобиль едет со скоростью ${speed} км/ч ${time} ч. Какое расстояние пройдено?`, options, idx, `S=vt=${speed}·${time}=${dist} км`, '06', diff);
    };

    // 07: последовательности / анализ таблиц
    const gen07 = (diff: 'easy'|'medium'|'hard'): Question => {
      const a1 = randomInt(1,10);
      const d = randomInt(1,5);
      const n = diff==='hard'?6:5;
      const seq = Array.from({length:n}, (_,i)=>a1+i*d);
      const next = a1+n*d;
      const options = shuffle([next, next+d, next-d, next+2*d]);
      const idx = options.indexOf(next);
      return makeMC(`Арифметическая прогрессия: ${seq.join(', ')}. Найдите следующее число.`, options, idx, `a(n+1)=a1+${n}·${d}=${next}`, '07', diff);
    };

    // 08: геометрическая логика
    const gen08 = (diff: 'easy'|'medium'|'hard'): Question => {
      const a = randomInt(3, 12); const b = randomInt(3, 12);
      const diag2 = a*a + b*b; // прямоугольный треугольник катеты a,b — диагональ прямоугольника
      const c = Math.sqrt(diag2);
      const corr = Number(c.toFixed(2));
      const options = shuffle([corr, corr+1, Math.max(0, corr-1), corr+2]).map(String);
      const idx = options.indexOf(String(corr));
      return makeMC(`Прямоугольник ${a}×${b}. Длина диагонали (см):`, options, idx, `d=√(${a}²+${b}²)=${corr}`, '08', diff);
    };

    // 09: площадь и периметр
    const gen09 = (diff: 'easy'|'medium'|'hard'): Question => {
      const w = randomInt(3,12); const h = randomInt(3,12);
      const area = w*h;
      const options = shuffle([area, area+2, area-2, 2*(w+h)]);
      const idx = options.indexOf(area);
      return makeMC(`Найдите площадь прямоугольника ${w}×${h}.`, options, idx, `S=wh=${area}`, '09', diff);
    };

    // 10: площадь поверхности тел (куб)
    const gen10 = (diff: 'easy'|'medium'|'hard'): Question => {
      const a = randomInt(2,10);
      const s = 6*a*a;
      const options = shuffle([s, s+6, Math.max(0, s-6), 4*a*a]);
      const idx = options.indexOf(s);
      return makeMC(`Куб со стороной ${a} см. Площадь поверхности:`, options, idx, `S=6a²=6·${a}²=${s} см²`, '10', diff);
    };

    // Difficulty schedule: 5 easy, 3 medium, 2 hard
    const diffs: Array<'easy'|'medium'|'hard'> = ['easy','easy','easy','easy','easy','medium','medium','medium','hard','hard'];
    const gens = [gen01, gen02, gen03, gen04, gen05, gen06, gen07, gen08, gen09, gen10];
    const questions: Question[] = diffs.map((d, i) => {
      const question = gens[i](d);
      // Add images to some questions (about 30% of questions)
      if (i % 3 === 0) {
        return { ...question, imageUrl: this.getRandomMathImage() };
      }
      return question;
    });
    // Persist as attempt for teacher reports
    const id = `attempt-${Date.now()}`;
    this.generatedAttempts.set(id, { id, subjectKey: 'math_literacy', title: 'Математическая грамотность — спецификация (10)', language: 'ru', questions, created_at: new Date().toISOString() });
    return { questions, isDemo: true };
  }

  /**
   * Generate a History of Kazakhstan test per spec (20 questions, with part context-based).
   * Difficulty A/B/C ≈ 50%/30%/20%.
   */
  async generateHistoryKZSpecTest(): Promise<{ questions: Question[]; isDemo: boolean }> {
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T,>(arr: T[]) => arr[randomInt(0, arr.length - 1)];
    const makeMC = (q: string, options: string[], correctIdx: number, expl: string, topic: string, diff: 'easy'|'medium'|'hard', meta?: Record<string, any>): Question => ({
      id: `hkz-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      question: q,
      type: 'multiple_choice',
      options,
      correct_answer: correctIdx,
      correctAnswer: correctIdx,
      explanation: expl,
      subject: 'history_kz',
      difficulty: diff,
      meta: { topic, ...(meta||{}) }
    });

    const bankEasy = [
      () => makeMC('Кто из правителей основал Казахское ханство?', ['Жанибек и Керей','Абылай','Кенесары','Тауке'], 0, 'Основатели — Жанибек и Керей.', '11', 'easy'),
      () => makeMC('Столицей Казахстана с 1997 года является', ['Астана','Алматы','Кызылорда','Шымкент'], 0, 'Столица — Астана (Нур‑Султан).', '47', 'easy'),
      () => makeMC('В какой век относится эпоха ранних кочевников (саки, сарматы)?', ['I тысячелетие до н.э.','XVIII век','XIX век','XIII век'], 0, 'Ранние кочевники — I тыс. до н.э.', '02', 'easy'),
    ];
    const bankMedium = [
      () => makeMC('Какое государство возникло в VI веке?', ['Великий Тюркский каганат','Золотая Орда','Ногайская Орда','Караханиды'], 0, 'В VI веке возник Великий Тюркский каганат.', '03', 'medium'),
      () => makeMC('Какая битва связана с объединением казахских сил против джунгар в XVIII веке?', ['Анракайская','Орбулакская','Атлахская','Конрэт'], 0, 'Анракайская битва — ключевое сражение XVIII века.', '19', 'medium'),
      () => makeMC('Когда была принята Конституция РК текущей редакции?', ['1995','1993','1991','1998'], 0, 'Действующая Конституция — 1995 года.', '47', 'medium'),
    ];
    const bankHard = [
      () => makeMC('Какая орда образовалась на территории Казахстана в XIII–XIV вв.?', ['Ак Орда','Кимакский каганат','Карлукский каганат','Уйсунь'], 0, 'Ак Орда — XIII–XIV вв.', '08', 'hard'),
      () => makeMC('Кто руководил национально‑освободительным движением 1837–1847 гг.?', ['Кенесары Касымов','Сырым Датулы','Жанқожа Нурмухамедов','Есет Котибаров'], 0, 'Кенесары — лидер восстания 1837–1847.', '27', 'hard'),
    ];

    // Context-based (two short texts) — 5 tasks
    const makeContext = (titleA: string, factA: string, titleB: string, factB: string, question: string, correct: string, opts: string[], topic: string, diff: 'medium'|'hard') =>
      makeMC(`${titleA}: ${factA}\n\n${titleB}: ${factB}\n\n${question}`, opts, opts.indexOf(correct), `Ответ: ${correct}`, topic, diff, { context: [titleA, titleB] });

    const contexts: Question[] = [
      makeContext('Источник А', 'Сообщает о переносе столицы в конце 1990‑х.', 'Источник Б', 'Упоминает строительство Астаны.', 'О каком событии идет речь?', 'Перенос столицы в Астану', ['Перенос столицы в Астану','Открытие Карлага','Отмена крепостного права','Освоение целины'], '47', 'medium'),
      makeContext('Источник А', 'Описывает походы Чингисхана.', 'Источник Б', 'Упоминает образование империи монголов.', 'О каком явлении речь?', 'Монгольские завоевания', ['Монгольские завоевания','Атлахская битва','Золотая Орда','Карлуки'], '08', 'hard'),
      makeContext('Документ А', 'Говорит о «Жеты жаргы».', 'Документ Б', 'Описывает деятельность биев.', 'О каком правителе идет речь?', 'Тауке хан', ['Тауке хан','Абылай хан','Кенесары','Хакназар'], '17', 'medium'),
      makeContext('Источник А', 'Рассказ о сражениях против джунгар.', 'Источник Б', 'Упоминание Анракайской битвы.', 'Какое событие?', 'Казахско-джунгарские войны', ['Казахско-джунгарские войны','Гражданская война','Атлахская битва','Восстание 1916'], '19', 'medium'),
      makeContext('Документ А', 'Содержит тезисы движения «Алаш».', 'Документ Б', 'Указывает на создание «Алаш-Орды».', 'О чем речь?', 'Движение Алаш', ['Движение Алаш','Перестройка','Оттепель','Джадидизм'], '35', 'hard'),
    ];

    // Difficulty distribution ~ 10 easy, 6 medium, 4 hard
    const easyQ = Array.from({length:10}, ()=> pick(bankEasy)());
    const mediumQ = Array.from({length:6}, ()=> pick(bankMedium)());
    const hardQ = Array.from({length:4}, ()=> pick(bankHard)());
    // Replace 5 medium/hard with context questions
    const out: Question[] = [];
    out.push(...contexts);
    out.push(...easyQ.slice(0,10 - 0));
    out.push(...mediumQ.slice(0,6 - 3));
    out.push(...hardQ.slice(0,4 - 2));
    const questions = out.slice(0,20);
    const id = `attempt-${Date.now()}`;
    this.generatedAttempts.set(id, { id, subjectKey: 'history_kz', title: 'Қазақстан тарихы — спецификация (20)', language: 'kz', questions, created_at: new Date().toISOString() });
    return { questions, isDemo: true };
  }

  /**
   * Generate questions with language switching support and image support
   */
  async generateQuestionsWithLanguage(subject: string, language: 'ru' | 'kz', count: number = 10): Promise<{ questions: Question[]; isDemo: boolean }> {
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const makeMC = (q: string, options: (string|number)[], correctIdx: number, expl: string, topicKey: string, diff: 'easy'|'medium'|'hard', imageUrl?: string): Question => {
      const detectedTopic = detectTopicFromQuestion(q, language);
      const topicTranslation = getTopicTranslation(detectedTopic, language);
      
      return {
        id: `${subject}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        question: q,
        type: 'multiple_choice',
        options: options.map(String),
        correct_answer: correctIdx,
        correctAnswer: correctIdx,
        explanation: expl,
        subject: subject,
        difficulty: diff,
        lang: language,
        imageUrl: imageUrl,
        meta: { 
          detectedTopic,
          topicTranslation,
          topicCodeKz: getTopicTranslation(detectedTopic, 'kz'),
          topicCodeRu: getTopicTranslation(detectedTopic, 'ru')
        }
      };
    };

    const questions: Question[] = [];

    if (subject === 'mathematics') {
      // Generate math questions with quadratic equations and images
      for (let i = 0; i < count; i++) {
        const diff = i < count * 0.5 ? 'easy' : i < count * 0.8 ? 'medium' : 'hard';
        
        // Add images to some questions (about 30% of questions)
        const shouldHaveImage = i % 3 === 0;
        const imageUrl = shouldHaveImage ? this.getRandomMathImage() : undefined;
        
        if (diff === 'hard' && i % 3 === 0) {
          // Quadratic equation: x² + 4x - 5 = 0
          const a = 1;
          const b = 4;
          const c = -5;
          const discriminant = b*b - 4*a*c;
          const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
          const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
          const correct = Math.round(x1);
          const options = shuffle([correct, Math.round(x2), correct+1, correct-1]);
          const idx = options.indexOf(correct);
          
          const questionText = language === 'ru' 
            ? `Решите квадратное уравнение: x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0. Найдите положительный корень.`
            : `Квадраттық теңдеуді шешіңіз: x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0. Оң түбірді табыңыз.`;
          
          const explanation = language === 'ru'
            ? `x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0; D = ${b}² - 4·1·${c} = ${discriminant}; x = ${correct}`
            : `x² + ${b}x ${c >= 0 ? '+' : ''}${c} = 0; D = ${b}² - 4·1·${c} = ${discriminant}; x = ${correct}`;
          
          questions.push(makeMC(questionText, options, idx, explanation, 'quadratic_equations', diff, imageUrl));
        } else if (diff === 'medium' && i % 4 === 0) {
          // Geometry question with image
          const side = randomInt(3, 12);
          const area = side * side;
          const perimeter = 4 * side;
          const options = shuffle([area, perimeter, area + perimeter, area - perimeter]);
          const idx = options.indexOf(area);
          
          const questionText = language === 'ru'
            ? `Найдите площадь квадрата со стороной ${side} см.`
            : `${side} см қабырғасы бар шаршының ауданын табыңыз.`;
          
          const explanation = language === 'ru'
            ? `S = a² = ${side}² = ${area} см²`
            : `S = a² = ${side}² = ${area} см²`;
          
          questions.push(makeMC(questionText, options, idx, explanation, 'geometry_triangles', diff, imageUrl));
        } else {
          // Linear equation
          const x = randomInt(2, 15);
          const total = x*2 + 5;
          const opts = shuffle([x, x+1, x-1, x+2]);
          const idx = opts.indexOf(x);
          
          const questionText = language === 'ru'
            ? `Сумма двух одинаковых чисел и 5 равна ${total}. Найдите число x.`
            : `Екі бірдей санның қосындысы мен 5-тің қосындысы ${total}. x санын табыңыз.`;
          
          const explanation = language === 'ru'
            ? `2x+5=${total} ⇒ x=${x}`
            : `2x+5=${total} ⇒ x=${x}`;
          
          questions.push(makeMC(questionText, opts, idx, explanation, 'linear_equations', diff, imageUrl));
        }
      }
    }

    if (subject === 'physics') {
      // Generate physics questions with images
      for (let i = 0; i < count; i++) {
        const diff = i < count * 0.5 ? 'easy' : i < count * 0.8 ? 'medium' : 'hard';
        
        // Add images to some questions (about 40% of physics questions)
        const shouldHaveImage = i % 2 === 0;
        const imageUrl = shouldHaveImage ? this.getRandomPhysicsImage() : undefined;
        
        if (diff === 'hard' && i % 3 === 0) {
          // Newton's law question
          const mass = randomInt(2, 10);
          const acceleration = randomInt(2, 8);
          const force = mass * acceleration;
          const options = shuffle([force, force + mass, force - acceleration, mass + acceleration]);
          const idx = options.indexOf(force);
          
          const questionText = language === 'ru'
            ? `Тело массой ${mass} кг движется с ускорением ${acceleration} м/с². Найдите силу, действующую на тело.`
            : `${mass} кг массасы бар дене ${acceleration} м/с² үдеумен қозғалады. Денеге әсер ететін күшті табыңыз.`;
          
          const explanation = language === 'ru'
            ? `F = ma = ${mass} × ${acceleration} = ${force} Н`
            : `F = ma = ${mass} × ${acceleration} = ${force} Н`;
          
          questions.push(makeMC(questionText, options, idx, explanation, 'mechanics_dynamics', diff, imageUrl));
        } else if (diff === 'medium' && i % 4 === 0) {
          // Kinematics question
          const v0 = randomInt(5, 20);
          const t = randomInt(2, 8);
          const a = randomInt(1, 5);
          const distance = v0 * t + 0.5 * a * t * t;
          const options = shuffle([Math.round(distance), Math.round(distance) + 5, Math.round(distance) - 3, v0 * t]);
          const idx = options.indexOf(Math.round(distance));
          
          const questionText = language === 'ru'
            ? `Тело движется с начальной скоростью ${v0} м/с и ускорением ${a} м/с² в течение ${t} с. Найдите пройденное расстояние.`
            : `Дене ${v0} м/с бастапқы жылдамдықпен және ${a} м/с² үдеумен ${t} с қозғалады. Жүрілген қашықтықты табыңыз.`;
          
          const explanation = language === 'ru'
            ? `S = v₀t + at²/2 = ${v0}×${t} + ${a}×${t}²/2 = ${Math.round(distance)} м`
            : `S = v₀t + at²/2 = ${v0}×${t} + ${a}×${t}²/2 = ${Math.round(distance)} м`;
          
          questions.push(makeMC(questionText, options, idx, explanation, 'mechanics_kinematics', diff, imageUrl));
        } else {
          // Simple physics question
          const power = randomInt(100, 1000);
          const voltage = randomInt(110, 220);
          const current = Math.round(power / voltage);
          const options = shuffle([current, current + 1, current - 1, Math.round(power / 100)]);
          const idx = options.indexOf(current);
          
          const questionText = language === 'ru'
            ? `Электрический прибор мощностью ${power} Вт работает при напряжении ${voltage} В. Найдите силу тока.`
            : `${power} Вт қуаты бар электр құрылғысы ${voltage} В кернеуде жұмыс істейді. Ток күшін табыңыз.`;
          
          const explanation = language === 'ru'
            ? `I = P/U = ${power}/${voltage} = ${current} А`
            : `I = P/U = ${power}/${voltage} = ${current} А`;
          
          questions.push(makeMC(questionText, options, idx, explanation, 'electricity', diff, imageUrl));
        }
      }
    }

    return { questions, isDemo: true };
  }

  /**
   * Generate an ENT-style quiz according to the current ENT template
   * for the math/physics tracks. Falls back to a local rule-based generator.
   */
  async generateENTQuiz(
    track: 'math' | 'physics',
    opts?: { maxPerSection?: number }
  ): Promise<{ questions: Question[]; isDemo: boolean }> {
    try {
      if (await this.isBackendAvailable()) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
        const response = await fetch('/api/ai/generate-ent-quiz', {
          method: 'POST',
          headers,
          body: JSON.stringify({ track })
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure camelCase alias exists for UI
          const normalized = (data.questions || []).map((q: any) => ({
            ...q,
            correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
          }));
          return { questions: normalized, isDemo: false };
        }
      }
    } catch (error) {
      console.warn('ENT generator API failed, using local generator');
    }

    // Local rule-based generator aligned with ENT sections
    const { loadEntTemplate } = await import('./entTemplates');
    const template = loadEntTemplate();
    const sectionList = template.tracks[track].sections;
    const maxPerSection = Math.max(1, opts?.maxPerSection ?? Number.POSITIVE_INFINITY);

    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const makeMC = (
      prompt: string,
      options: string[],
      correctIdx: number,
      expl?: string,
      subject?: string
    ): Question => ({
      id: `ent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      question: prompt,
      type: 'multiple_choice',
      options,
      correct_answer: correctIdx,
      correctAnswer: correctIdx,
      explanation: expl,
      subject,
      difficulty: 'medium',
    });

    const genHistoryKZ = (count: number): Question[] => {
      const bank = [
        makeMC(
          'Когда была принята первая Конституция Республики Казахстан?',
          ['1991', '1993', '1995', '1998'],
          1,
          'Первая Конституция независимого Казахстана была принята в 1993 году.',
          'history_kz'
        ),
        makeMC(
          'Столицей Казахстана с 1997 года является:',
          ['Алматы', 'Астана (Нур-Султан)', 'Шымкент', 'Караганда'],
          1,
          'Столица была перенесена из Алматы в Акмолу (ныне Астана) в 1997 году.',
          'history_kz'
        ),
        makeMC(
          'Кто является автором гимна Республики Казахстан (слова, 2006)?',
          ['Н. Назарбаев и Ж. Нажмеденов', 'А. Байтұрсынұлы', 'М. Әуезов', 'А. Кунаев'],
          0,
          'Слова современного гимна написали Н. Назарбаев и Ж. Нажмеденов.',
          'history_kz'
        ),
      ];
      const out: Question[] = [];
      while (out.length < count) out.push(bank[out.length % bank.length]);
      return out;
    };

    const genMathLiteracy = (count: number): Question[] => {
      const withMlMeta = (q: Question, twoDigit: string, key: string): Question => {
        const topicRu = getTopicTranslation(key, 'ru');
        const topicKz = getTopicTranslation(key, 'kz');
        return {
          ...q,
          meta: {
            ...(q.meta || {}),
            domain: twoDigit,
            topicCode: `mathlit_${twoDigit}`,
            detectedTopic: key,
            topicTranslation: topicRu,
            topicCodeKz: topicKz,
            topicCodeRu: topicRu,
          }
        } as Question;
      };

      const makePercentProblem = () => {
        const price = randomInt(2000, 10000);
        const discount = [5, 10, 15, 20][randomInt(0, 3)];
        const correct = Math.round(price * (1 - discount / 100));
        const distractors = [
          correct + randomInt(50, 250),
          correct - randomInt(50, 250),
          Math.round(price * (discount / 100)),
        ];
        const options = shuffle([correct, ...distractors]).map(String);
        const correctIdx = options.indexOf(String(correct));
        const base = makeMC(
          `Товар стоит ${price} тг. Скидка ${discount}%. Какова новая цена?`,
          options,
          correctIdx,
          `Новая цена = ${price} × (1 − ${discount}/100) = ${correct} тг`,
          'math_literacy'
        );
        return withMlMeta(base, '03', 'percentages_diagrams');
      };
      const makeRatioProblem = () => {
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const total = randomInt(20, 60);
        const sum = a + b;
        const partA = Math.round((a / sum) * total);
        const options = shuffle([
          partA,
          partA + 1,
          Math.max(0, partA - 1),
          partA + 2,
        ]).map(String);
        const idx = options.indexOf(String(partA));
        const base = makeMC(
          `В классе соотношение мальчиков и девочек ${a}:${b}. Всего ${total} учеников. Сколько мальчиков?`,
          options,
          idx,
          `Доля мальчиков = ${a}/(${a}+${b}) · ${total} = ${partA}.`,
          'math_literacy'
        );
        return withMlMeta(base, '06', 'proportional_dependence');
      };
      // New: median/mode explicit (topic 04)
      const makeMedianMode = () => {
        const arr = shuffle([2,2,3,4,4,4,5,6]);
        const median = (arr[3]+arr[4])/2;
        const mode = 4;
        const askMedian = Math.random()<0.5;
        if (askMedian) {
          const options = shuffle([median, median+1, median-1, mode]).map(String);
          const idx = options.indexOf(String(median));
          const base = makeMC(`Медиана выборки [${arr.join(', ')}]`, options, idx, `Медиана = среднее двух центральных элементов = ${median}`, 'math_literacy');
          return withMlMeta(base, '04', 'statistics_measures');
        }
        const options = shuffle([mode, 3, 5, 2]).map(String);
        const idx = options.indexOf(String(mode));
        const base = makeMC(`Мода выборки [${arr.join(', ')}]`, options, idx, `Мода — наиболее частое значение = ${mode}`, 'math_literacy');
        return withMlMeta(base, '04', 'statistics_measures');
      };
      // New: dependency/linear model (topic 06)
      const makeDepend = () => {
        const k = randomInt(2,6), b = randomInt(0,5), x = randomInt(2,8);
        const y = k*x + b;
        const options = shuffle([y, y+1, y-1, k*x]).map(String);
        const idx = options.indexOf(String(y));
        const base = makeMC(`y=${k}x+${b}. Найдите y при x=${x}`, options, idx, `Подставим: y=${k}·${x}+${b}=${y}`, 'math_literacy');
        return withMlMeta(base, '06', 'proportional_dependence');
      };
      const generators = [makePercentProblem, makeRatioProblem];
      generators.push(makeMedianMode, makeDepend);
      return Array.from({ length: count }, () => generators[randomInt(0, generators.length - 1)]());
    };

    const genMathProfile = (count: number): Question[] => {
      const makeLinearEq = () => {
        const m = randomInt(2, 7);
        const b = randomInt(-9, 9);
        const rhs = randomInt(-10, 20);
        // m·x + b = rhs → x = (rhs - b)/m
        const x = (rhs - b) / m;
        const correct = Number.isInteger(x) ? x : +(x.toFixed(2));
        const distractors = [correct + 1, correct - 1, correct + 2].map(v => String(v));
        const options = shuffle([String(correct), ...distractors]);
        const correctIdx = options.indexOf(String(correct));
        return makeMC(
          `Решите уравнение: ${m}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${rhs}`,
          options,
          correctIdx,
          `x = (${rhs} − ${b}) / ${m} = ${correct}`,
          'math_profile'
        );
      };
      // New: fractional rational eq
      const makeRationalEq = () => {
        const a = randomInt(1,5), b = randomInt(2,6);
        const x = randomInt(1,9);
        const lhsNum = a*x + b;
        // (a x + b)/b = ? with x unknown -> solve (a x + b) = b*k choose k to be randomInt(2,5)
        const rhs = randomInt(2,5);
        const correct = (rhs*b - b)/a;
        const opts = shuffle([correct, correct+1, correct-1, correct+2]).map(String);
        const idx = opts.indexOf(String(correct));
        return makeMC(`Решите уравнение: ( ${a}x + ${b} ) / ${b} = ${rhs}`, opts, idx, `(${a}x+${b})=${rhs}·${b} ⇒ x = (${rhs*b}-${b})/${a} = ${correct}`, 'math_profile');
      };
      // New: trig basics
      const makeTrig = () => {
        const angle = [30,45,60][randomInt(0,2)];
        const table: Record<number, string[]> = {30:['1/2','√3/2','√3/3','0.5'],45:['√2/2','1/2','√3/2','0.707'],60:['√3/2','1/2','√2/2','0.866']};
        const sin = table[angle][0];
        const options = shuffle([sin, ...table[angle].slice(1)]);
        const idx = options.indexOf(sin);
        return makeMC(`sin(${angle}°) = ?`, options, idx, `Значение из триг. таблицы: sin(${angle}°) = ${sin}`, 'math_profile');
      };
      const makeQuadraticRoots = () => {
        const r1 = randomInt(-5, 5);
        const r2 = randomInt(-5, 5);
        const a = 1;
        const b = -(r1 + r2);
        const c = r1 * r2;
        const prompt = `Найдите корни уравнения: x^2 ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`;
        const correct = `{${Math.min(r1, r2)}; ${Math.max(r1, r2)}}`;
        const opts = shuffle([
          correct,
          `{${r1}; ${r1}}`,
          `{${r2}; ${r2}}`,
          '{0; 0}',
        ]);
        const idx = opts.indexOf(correct);
        return makeMC(prompt, opts, idx, 'Коэффициенты соответствуют (x − r1)(x − r2) = 0.', 'math_profile');
      };
      const makeDerivativeConcept = () =>
        makeMC(
          'Производная функции в точке — это:',
          [
            'Предел отношения приращений функции и аргумента',
            'Средняя скорость изменения функции',
            'Интеграл функции',
            'Значение функции в точке'
          ],
          0,
          'Определение производной через предел отношения приращений.',
          'math_profile'
        );
      // Multi-select generators (6 вариантов, 1-3 правильных)
      const makeMultiSelectBasics = () => {
        const correctCount = randomInt(1, 3);
        const base = ['верно A', 'верно B', 'верно C', 'неверно D', 'неверно E', 'неверно F'];
        const options = [...base];
        const correctIdxs: number[] = [];
        while (correctIdxs.length < correctCount) {
          const idx = randomInt(0, 2); // among first three as correct
          if (!correctIdxs.includes(idx)) correctIdxs.push(idx);
        }
        return {
          id: `ent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          question: 'Выберите все верные утверждения (демо)',
          type: 'multi_select' as const,
          options,
          correct_answer: correctIdxs,
          correctAnswer: 0,
          explanation: '1–3 верных утверждений среди первых трёх пунктов.',
          subject: 'math_profile',
          difficulty: 'hard'
        } as Question;
      };
      const singleGenerators = [makeLinearEq, makeQuadraticRoots, makeDerivativeConcept];
      // enrich with more algebra/trig/rational
      singleGenerators.push(makeRationalEq, makeTrig);
      const multiGenerators = [makeMultiSelectBasics];
      const singlesNeeded = Math.min(30, count);
      const multisNeeded = Math.max(0, count - singlesNeeded);
      const singles = Array.from({ length: singlesNeeded }, () => singleGenerators[randomInt(0, singleGenerators.length - 1)]());
      const multis = Array.from({ length: multisNeeded }, () => multiGenerators[randomInt(0, multiGenerators.length - 1)]());
      return [...singles, ...multis];
    };

    const genPhysicsProfile = (count: number): Question[] => {
      const makeNewton2 = () =>
        makeMC(
          'Второй закон Ньютона формулируется как:',
          ['F = ma', 'F = mv', 'F = mg', 'F = ma²'],
          0,
          'Сила равна произведению массы на ускорение.',
          'physics_profile'
        );
      const makeUnit = () =>
        makeMC(
          'Единица измерения энергии в СИ:',
          ['Джоуль', 'Ньютон', 'Ватт', 'Паскаль'],
          0,
          'Энергия измеряется в Джоулях (J).',
          'physics_profile'
        );
      const makeKinematics = () => {
        const v = randomInt(5, 20);
        const t = randomInt(2, 10);
        const s = v * t;
        const opts = shuffle([s, s + randomInt(1, 5), Math.max(0, s - randomInt(1, 5)), s + 2]).map(String);
        const idx = opts.indexOf(String(s));
        return makeMC(
          `Тело движется равномерно со скоростью ${v} м/с в течение ${t} с. Какой путь пройден?`,
          opts,
          idx,
          `s = v·t = ${v}·${t} = ${s} м`,
          'physics_profile'
        );
      };
      const makeMultiSelectPhys = () => {
        const options = ['Вакуум проводит ток', 'Закон Ома: I = U/R', 'Единица мощности — Вт', 'Энергия в Н', 'Сопротивление в Ом', 'W = U·I'];
        const correctIdxs = [1, 2, 4]; // 1-3 правильных
        return {
          id: `ent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          question: 'Выберите все верные утверждения (демо, физика)',
          type: 'multi_select' as const,
          options,
          correct_answer: correctIdxs,
          correctAnswer: 0,
          explanation: 'Выберите корректные утверждения из списка.',
          subject: 'physics_profile',
          difficulty: 'hard'
        } as Question;
      };
      const singleGenerators = [makeNewton2, makeUnit, makeKinematics];
      const multiGenerators = [makeMultiSelectPhys];
      const singlesNeeded = Math.min(30, count);
      const multisNeeded = Math.max(0, count - singlesNeeded);
      const singles = Array.from({ length: singlesNeeded }, () => singleGenerators[randomInt(0, singleGenerators.length - 1)]());
      const multis = Array.from({ length: multisNeeded }, () => multiGenerators[randomInt(0, multiGenerators.length - 1)]());
      return [...singles, ...multis];
    };

    const questions: Question[] = [];
    for (const section of sectionList) {
      const count = Math.min(section.numQuestions, maxPerSection);
      if (section.key === 'history_kz') {
        const custom = (this.customQuestionsBySubject['history_kz'] || []).slice(0, count);
        questions.push(...(custom.length ? custom : genHistoryKZ(count)));
      } else if (section.key === 'math_literacy') {
        const custom = (this.customQuestionsBySubject['math_literacy'] || []).slice(0, count);
        questions.push(...(custom.length ? custom : genMathLiteracy(count)));
      } else if (section.key === 'math_profile') {
        const custom = (this.customQuestionsBySubject['math_profile'] || []).slice(0, count);
        questions.push(...(custom.length ? custom : genMathProfile(count)));
      } else if (section.key === 'physics_profile') {
        const custom = (this.customQuestionsBySubject['physics_profile'] || []).slice(0, count);
        questions.push(...(custom.length ? custom : genPhysicsProfile(count)));
      }
    }

    return { questions, isDemo: true };
  }

  /**
   * Import custom questions mapped to an ENT subject key (e.g. 'history_kz').
   * Existing items for the key are appended.
   */
  async importENTQuestions(subjectKey: 'history_kz' | 'math_literacy' | 'math_profile' | 'physics_profile', questions: Question[]): Promise<number> {
    if (!this.customQuestionsBySubject[subjectKey]) this.customQuestionsBySubject[subjectKey] = [];
    const normalized = questions.map(q => {
      const base: Question = {
        ...q,
        correctAnswer: typeof q.correct_answer === 'number' ? (q.correct_answer as number) : 0,
        subject: subjectKey,
      };
      // Enrich Math Literacy imports with topic labels if missing
      if (subjectKey === 'math_literacy') {
        const meta = base.meta || {};
        const hasLabel = typeof meta.topicTranslation === 'string' || typeof meta.topicCodeKz === 'string';
        if (!hasLabel) {
          const detected = detectTopicFromQuestion(base.question || '', 'ru');
          meta.detectedTopic = detected;
          meta.topicTranslation = getTopicTranslation(detected, 'ru');
          meta.topicCodeKz = getTopicTranslation(detected, 'kz');
          base.meta = meta;
        }
      }
      return base;
    });
    this.customQuestionsBySubject[subjectKey].push(...normalized);
    return this.customQuestionsBySubject[subjectKey].length;
  }

  async submitTest(testData: {
    answers: any[];
    score: number;
    total: number;
    timeSpent: number;
    subject: string;
    difficulty: string;
    attemptId?: string;
  }): Promise<void> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch('/api/tests/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(testData)
        });

        if (response.ok) {
          return;
        }
        if (response.status === 404) throw new Error('Backend /api/tests/submit not found');
      }
    } catch (error) {
      console.log('Backend submit failed, storing locally');
    }

    // Store locally as fallback
    if (this.currentUser) {
      const result: TestResult = {
        id: `result-${Date.now()}`,
        user_id: this.currentUser.id,
        test_id: `test-${testData.subject}`,
        answers: testData.answers,
        score: (testData.score / testData.total) * 100,
        time_spent: testData.timeSpent,
        completed_at: new Date().toISOString(),
        attempt_id: testData.attemptId
      };
      
      this.results.set(result.id, result);
      
      // Update user stats
      const user = this.users.get(this.currentUser.id);
      if (user) {
        user.tests_completed = (user.tests_completed || 0) + 1;
        user.average_score = user.tests_completed > 1 
          ? Math.round(((user.average_score || 0) * (user.tests_completed - 1) + (testData.score / testData.total) * 100) / user.tests_completed)
          : Math.round((testData.score / testData.total) * 100);
        user.total_study_time = (user.total_study_time || 0) + Math.round(testData.timeSpent / 60);
        this.users.set(user.id, user);
        this.currentUser = user;
      }
    }
  }

  // Results methods
  async submitTestResult(testId: string, answers: any[], score: number, timeSpent: number): Promise<TestResult> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const result: TestResult = {
      id: `result-${Date.now()}`,
      user_id: this.currentUser.id,
      test_id: testId,
      answers,
      score,
      time_spent: timeSpent,
      completed_at: new Date().toISOString()
    };

    this.results.set(result.id, result);

    // Update user stats
    const user = this.users.get(this.currentUser.id);
    if (user) {
      user.tests_completed = (user.tests_completed || 0) + 1;
      user.average_score = user.tests_completed > 1 
        ? Math.round(((user.average_score || 0) * (user.tests_completed - 1) + score) / user.tests_completed)
        : score;
      user.total_study_time = (user.total_study_time || 0) + Math.round(timeSpent / 60);
      this.users.set(user.id, user);
      this.currentUser = user;
    }

    return result;
  }

  async getResults(userId?: string): Promise<TestResult[]> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return [];

    return Array.from(this.results.values())
      .filter(result => result.user_id === targetUserId);
  }

  // Analysis persistence (latest only per user)
  async saveLastAnalysis(analysis: any): Promise<void> {
    if (!this.currentUser) return;
    this.lastAnalysisByUser.set(this.currentUser.id, analysis);
  }

  async getLastAnalysis(userId?: string): Promise<any | null> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return null;
    return this.lastAnalysisByUser.get(targetUserId) || null;
  }

  // User stats method
  async getUserStats(): Promise<UserStats> {
    const user = this.currentUser;
    const results = await this.getResults();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Calculate stats from results
    const testsCompleted = results.length;
    const averageScore = testsCompleted > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / testsCompleted)
      : 0;
    
    // Calculate total questions and correct answers
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    results.forEach(result => {
      if (result.answers && Array.isArray(result.answers)) {
        totalQuestions += result.answers.length;
        correctAnswers += result.answers.filter(answer => answer.correct).length;
      }
    });

    // Calculate study time
    const studyTime = results.reduce((sum, result) => sum + result.time_spent, 0);

    // Calculate streak (consecutive successful tests >= 60%)
    let streak = 0;
    const sortedResults = results
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    
    for (const result of sortedResults) {
      if (result.score >= 60) {
        streak++;
      } else {
        break;
      }
    }

    // Determine rank based on average score
    let rank = 'Начинающий';
    if (averageScore >= 90) rank = 'Эксперт';
    else if (averageScore >= 80) rank = 'Продвинутый';
    else if (averageScore >= 70) rank = 'Средний';
    else if (averageScore >= 60) rank = 'Развивающийся';

    // Generate achievements
    const achievements: string[] = [];
    if (testsCompleted >= 1) achievements.push('Первый тест');
    if (testsCompleted >= 5) achievements.push('Активный ученик');
    if (testsCompleted >= 10) achievements.push('Настойчивый');
    if (streak >= 3) achievements.push('Серия побед');
    if (averageScore >= 90) achievements.push('Отличник');
    if (studyTime >= 3600) achievements.push('Час изучения');

    // Recent tests
    const recentTests = sortedResults.slice(0, 5).map(result => ({
      subject: result.test_id.replace('test-', ''),
      score: Math.round((result.score / 100) * 10), // Assuming score is percentage
      total: 10, // Mock total questions
      percentage: Math.round(result.score),
      completedAt: result.completed_at
    }));

    return {
      testsCompleted,
      averageScore,
      totalQuestions,
      correctAnswers,
      studyTime,
      streak,
      rank,
      achievements,
      recentTests
    };
  }

  // Analytics
  async getAnalytics(userId?: string) {
    const results = await this.getResults(userId);
    const user = this.currentUser;

    if (!results.length) {
      return {
        totalTests: 0,
        averageScore: 0,
        recentActivity: [],
        progressTrend: [],
        studyStreak: user?.study_streak || 0,
        totalStudyTime: user?.total_study_time || 0
      };
    }

    const totalTests = results.length;
    const averageScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalTests);

    // Recent activity (last 10 results)
    const recentActivity = results
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 10);

    // Progress trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentResults = results.filter(result => 
      new Date(result.completed_at) >= thirtyDaysAgo
    );

    const progressTrend = recentResults.map(result => ({
      date: result.completed_at.split('T')[0],
      score: result.score,
      attempt_id: result.attempt_id,
      subject: result.test_id.replace('test-','')
    }));

    return {
      totalTests,
      averageScore,
      recentActivity,
      progressTrend,
      studyStreak: user?.study_streak || 0,
      totalStudyTime: user?.total_study_time || 0
    };
  }

  // AI Chat methods
  async sendAIMessage(
    message: string,
    context?: string,
    language?: 'ru' | 'kz'
  ): Promise<{ response: string; isDemo: boolean }> {
    try {
      // Try backend API first
      if (await this.isBackendAvailable()) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
        const deepseekKey = localStorage.getItem('deepseek_api_key');
        if (deepseekKey) headers['x-deepseek-api-key'] = deepseekKey;
        const geminiKey = localStorage.getItem('gemini_api_key');
        if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
        const openrouterKey = localStorage.getItem('openrouter_api_key');
        if (openrouterKey) headers['x-openrouter-api-key'] = openrouterKey;

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message, context, language })
        });

        if (response.ok) {
          const data = await response.json();
          return { response: data.response, isDemo: false };
        }
        // If DeepSeek returns payment required, gracefully fall back to local demo
        if (response.status === 402) {
          return await this._generateLocalAIResponse(message, context, language);
        }
      }
    } catch (error) {
      console.error('AI chat error:', error);
    }

    // Fallback to local AI responses
    return this._generateLocalAIResponse(message, context, language);
  }

  // Alias for backwards compatibility
  async chatWithAI(
    message: string,
    context?: string,
    language?: 'ru' | 'kz'
  ): Promise<{ response: string; isDemo: boolean }> {
    return this.sendAIMessage(message, context, language);
  }

  // Private method for local AI responses
  private async _generateLocalAIResponse(
    message: string,
    context?: string,
    language?: 'ru' | 'kz'
  ): Promise<{ response: string; isDemo: boolean }> {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lang: 'ru' | 'kz' = language || this._detectLanguageFromText(message);
    const responsesRu = [
      'Давайте упростим: назовите тему и вашу цель (например, «квадратные уравнения, цель 80%»).',
      'Предлагаю алгоритм: 1) краткая теория, 2) 5 задач с разбором, 3) мини‑тест → разбор ошибок.',
      'Если застряли: пришлите условие задачи и ваш ход решения — укажу, где проседает логика.',
      'Для роста на +10%: 20–30 минут в день по слабым темам, раз в 3 дня — контрольный мини‑тест.',
      'Определим фокус: напишите 2 темы, которые даются труднее всего — соберу план практики.'
    ];
    const responsesKz = [
      'Қарапайым бастайық: тақырып пен мақсатты жазыңыз (мысалы, «квадрат теңдеулер, мақсат 80%»).',
      'Алгоритм ұсынамын: 1) қысқа теория, 2) 5 есеп пен талдау, 3) мини‑тест → қателерді талдау.',
      'Егер тұрып қалсаңыз: есептің шартын және шешу жолын жіберіңіз — әлсіз жерді көрсетемін.',
      '+10% прогресс үшін: күніне 20–30 минут әлсіз тақырыптарға, әр 3 күнде — бақылау мини‑тест.',
      'Фокусты анықтайық: қиын саналатын 2 тақырыпты жазыңыз — тәжірибе жоспарын құрастырамын.'
    ];

    // Simple keyword matching for more relevant responses
    const lowerMessage = message.toLowerCase();
    let response = '';

    // If we got an analysis context, generate a structured analysis in the target language
    const analysisPrefix = 'ANALYZE_TEST_RESULTS:';
    if (context && context.includes(analysisPrefix)) {
      try {
        const json = context.substring(context.indexOf(analysisPrefix) + analysisPrefix.length).trim();
        const data = JSON.parse(json);
        const header = lang === 'kz' ? 'Тест нәтижелерінің талдауы' : 'Анализ результатов теста';
        const strongLabel = lang === 'kz' ? 'Күшті жақтары' : 'Сильные стороны';
        const weakLabel = lang === 'kz' ? 'Әлсіз жақтары' : 'Слабые стороны';
        const homeworkLabel = lang === 'kz' ? 'Үй жұмысы' : 'Домашнее задание';
        const topicsLabel = lang === 'kz' ? 'Ұсынылатын тақырыптар' : 'Рекомендуемые темы';
        const scoreLine = lang === 'kz'
          ? `Ұпай: ${data.percentage}% (${data.correct}/${data.total})`
          : `Баллы: ${data.percentage}% (${data.correct}/${data.total})`;
        const timeLine = data.timeSpent
          ? (lang === 'kz' ? `Уақыт: ${Math.round(data.timeSpent / 60)} мин` : `Время: ${Math.round(data.timeSpent / 60)} мин`)
          : '';
        const bullets = (arr: string[]) => arr.map(i => `- ${i}`).join('\n');
        response = `${header}\n${scoreLine}${timeLine ? `\n${timeLine}` : ''}\n\n${strongLabel}:\n${bullets(data.strengths || [])}\n\n${weakLabel}:\n${bullets(data.weaknesses || [])}\n\n${homeworkLabel}:\n${bullets(data.homework || [])}\n\n${topicsLabel}:\n${bullets(data.topics || [])}`;
        return { response, isDemo: true };
      } catch {}
    }

    if (lowerMessage.includes('математика') || lowerMessage.includes('алгебра')) {
      response = lang === 'kz'
        ? 'Математика бойынша: 1) 10 минут теория, 2) 20 минут есептер, 3) 5 минут талдау. Тақырыпты атаңыз — жоспар құрып беремін.'
        : 'Для математики: 10 мин теория + 20 мин задачи + 5 мин разбор. Назовите тему — соберу план на сегодня.';
    } else if (lowerMessage.includes('физика') || lowerMessage.includes('физика')) {
      response = lang === 'kz'
        ? 'Физика: қысқа формула парағын жасаңыз + 5 есеп. Тақырыпты айтыңыз — мақсатты мини‑жоспар ұсынамын.'
        : 'Физика: сделайте мини‑шпаргалку по формулам + 5 задач. Уточните тему — пришлю мини‑план.';
    } else if (lowerMessage.includes('история') || lowerMessage.includes('тарих')) {
      response = lang === 'kz'
        ? 'Тарих: уақыт сызығын құрыңыз (оқиға → жыл → тұлға). Тақырыпты жазыңыз — 10 факт пен 1 мини‑тест беремін.'
        : 'История: составьте таймлайн (событие → год → личность). Напишите тему — пришлю 10 фактов и мини‑тест.';
    } else if (
      lowerMessage.includes('как') || lowerMessage.includes('помощь') || lowerMessage.includes('совет') ||
      lowerMessage.includes('қалай') || lowerMessage.includes('көмек') || lowerMessage.includes('кеңес')
    ) {
      response = lang === 'kz'
        ? 'Көмек беруге әрқашан дайынмын! Нақты мәселені сипаттаңыз, бірге шешім табамыз.'
        : 'Я всегда готов помочь! Опишите конкретную проблему, и мы найдём решение вместе.';
    } else if (context && this.currentUser) {
      const base = lang === 'kz'
        ? `${this.currentUser.name}, прогрессіңізге қарағанда (${this.currentUser.tests_completed || 0} тест, орташа ұпай ${this.currentUser.average_score || 0}%), жақсы алға жылжып жатырсыз!`
        : `${this.currentUser.name}, судя по вашему прогрессу (${this.currentUser.tests_completed || 0} тестов, средний балл ${this.currentUser.average_score || 0}%), вы хорошо продвигаетесь в обучении!`;
      const pool = lang === 'kz' ? responsesKz : responsesRu;
      response = `${base} ${pool[Math.floor(Math.random() * pool.length)]}`;
    } else {
      const pool = lang === 'kz' ? responsesKz : responsesRu;
      response = pool[Math.floor(Math.random() * pool.length)];
    }

    return { response, isDemo: true };
  }

  private _detectLanguageFromText(text: string): 'ru' | 'kz' {
    const kzChars = /[әғқңөұүһі]/i;
    const kzWords = /(сәлем|қалай|ия|жоқ|үй|тапсырма|талдау)/i;
    if (kzChars.test(text) || kzWords.test(text)) return 'kz';
    return 'ru';
  }

  // Build and send explanation prompt helper
  async explainProblem(
    lang: 'ru' | 'kz',
    params: {
      subject?: string;
      problem: string;
      options?: string[];
      studentAnswer?: string;
      correctAnswer?: string;
      contextNotes?: string;
      mode?: 'concise' | 'step_by_step' | 'socratic';
      showCommonMistakes?: boolean;
    }
  ): Promise<{ response: string; isDemo: boolean }>{
    const { buildExplainProblemPrompt } = await import('./prompts');
    const prompt = buildExplainProblemPrompt(lang, {
      subject: params.subject,
      problem: params.problem,
      options: params.options,
      studentAnswer: params.studentAnswer,
      correctAnswer: params.correctAnswer,
      contextNotes: params.contextNotes,
      mode: params.mode || 'step_by_step',
      showCommonMistakes: params.showCommonMistakes ?? true,
      targetTimeSeconds: 90,
    });
    return this.sendAIMessage(prompt, undefined, lang);
  }
}

// Export singleton instance
export const dataService = new MockDataService();