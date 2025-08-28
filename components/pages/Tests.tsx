import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataService, Question } from '../../utils/dataService';
import { analyzeTestResults, AnalysisOutput } from '../../utils/analyzeTestResults';
import { generateDiagnosticReportRuFromAnalyze, generateDiagnosticReportKzFromAnalyze, analyzeQuestionObjects } from '../../utils/analyzeStudentQuestions';
import { DEFAULT_ENT_TEMPLATE, loadEntTemplate, EntTrack } from '../../utils/entTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle, XCircle, Brain, Trophy, Star, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MathText } from '../ui/MathText';
import { ImportENTDialog } from '../tests/ImportENTDialog';
import { AIAssistant } from '../ai/AIAssistant';

interface TestResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export const Tests: React.FC = () => {
  const { t } = useLanguage();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswersMulti, setSelectedAnswersMulti] = useState<number[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTestTime, setTotalTestTime] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);
  const [testMode, setTestMode] = useState<'practice' | 'timed' | 'ai-generated'>('practice');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [track, setTrack] = useState<EntTrack>('math');
  const [sectionInfo, setSectionInfo] = useState<Array<{ key: string; title: string; count: number; mandatory: boolean }>>([]);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [structuredAnalysis, setStructuredAnalysis] = useState<AnalysisOutput | null>(null);
  const [explainings, setExplainings] = useState<Record<string, string>>({});
  const [diagnosticReportRu, setDiagnosticReportRu] = useState<string>('');
  const [diagnosticReportKz, setDiagnosticReportKz] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Detect if a string is an image source (URL or data URI)
  const isImageSource = (value: string | undefined | null): boolean => {
    if (!value) return false;
    const s = String(value).trim();
    return /^(data:image\/.+;base64,|https?:\/\/)/i.test(s) && /(\.png|\.jpe?g|\.gif|\.webp|\.svg)(\?.*)?$/i.test(s) || /^data:image\//i.test(s);
  };

  useEffect(() => {
    loadQuestions();
  }, [track]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (testStarted && !testCompleted && testMode === 'timed') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testCompleted, testMode]);

  const loadQuestions = async () => {
    try {
      // Compose questions according to ENT template (mandatory sections always included)
      const tmpl = loadEntTemplate();
      const selected = tmpl.tracks[track];
      const all = await dataService.getQuestions();
      // Map dataService subjects to template keys heuristically
      const subjectKeyMap: Record<string, string> = {
        history: 'history_kz',
        mathematics: 'math_profile',
        physics: 'physics_profile',
        math_literacy: 'math_literacy',
      };
      const byKey = (q: Question) => subjectKeyMap[(q as any).subject] || (q as any).subject;
      let composed: Question[] = [];
      const sectionsBuilt: Array<{ key: string; title: string; count: number; mandatory: boolean }> = [];
      for (const section of selected.sections) {
        const pool = all.filter(q => byKey(q) === section.key && (!q.lang || q.lang === language));
        const fallbackPool = pool.length ? pool : all.filter(q => ((q as any).subject || '').toLowerCase().includes(section.key.split('_')[0]));
        const slice = fallbackPool.slice(0, section.numQuestions);
        composed = composed.concat(slice);
        sectionsBuilt.push({ key: section.key, title: section.title, count: slice.length, mandatory: !!section.mandatory });
      }
      if (composed.length === 0) composed = all;
      setQuestions(composed);
      setSectionInfo(sectionsBuilt);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Ошибка загрузки вопросов');
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      // Prefer ENT generator aligned to selected track
      const ent = await dataService.generateENTQuiz(track, { maxPerSection: 10 });
      const qs = ent.questions.length ? ent.questions : (await dataService.generateQuiz('Общие знания', 'medium', 20)).questions;
      setQuestions(qs);
      setTestMode('ai-generated');
      toast.success('Вопросы по ЕНТ сгенерированы ИИ!');
    } catch (error) {
      console.error('Error generating AI questions:', error);
      toast.error('Ошибка генерации вопросов');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // New: Strict spec Math Literacy (10 questions) and History KZ (20) generators
  const startMathLiteracySpec = async () => {
    setGeneratingQuestions(true);
    try {
      const res = await dataService.generateMathLiteracySpecTest();
      setQuestions(res.questions);
      setSectionInfo([{ key: 'math_literacy', title: language==='kz'?'Математикалық сауаттылық':'Математическая грамотность', count: res.questions.length, mandatory: true }]);
      setTestMode('ai-generated');
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setResults([]);
      setTestCompleted(false);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
      setTotalTestTime(0);
      toast.success(language === 'kz' ? 'Математикалық сауаттылық: 10 тапсырма' : 'Математическая грамотность: 10 заданий по спецификации');
    } catch (e) {
      toast.error(language === 'kz' ? 'МГ спецификациясы бойынша тест құру сәтсіз' : 'Не удалось сформировать тест по спецификации МГ');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // New: Language-aware question generation
  const startLanguageAwareTest = async (subject: string) => {
    setGeneratingQuestions(true);
    try {
      const res = await dataService.generateQuestionsWithLanguage(subject, language, 35);
      setQuestions(res.questions);
      const subjectTitle = language === 'kz' 
        ? (subject === 'mathematics' ? 'Математика' : subject === 'physics' ? 'Физика' : subject)
        : (subject === 'mathematics' ? 'Математика' : subject === 'physics' ? 'Физика' : subject);
      setSectionInfo([{ key: subject, title: subjectTitle, count: res.questions.length, mandatory: false }]);
      setTestMode('ai-generated');
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setResults([]);
      setTestCompleted(false);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
      setTotalTestTime(0);
      toast.success(language === 'kz' ? `${subjectTitle}: 35 тапсырма` : `${subjectTitle}: 35 заданий`);
    } catch (e) {
      toast.error(language === 'kz' ? 'Тест құру сәтсіз' : 'Не удалось сформировать тест');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const startHistoryKZSpec = async () => {
    setGeneratingQuestions(true);
    try {
      const res = await dataService.generateHistoryKZSpecTest();
      setQuestions(res.questions);
      setSectionInfo([{ key: 'history_kz', title: language==='kz'?'Қазақстан тарихы':'История Казахстана', count: res.questions.length, mandatory: true }]);
      setTestMode('ai-generated');
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setResults([]);
      setTestCompleted(false);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
      setTotalTestTime(0);
      toast.success('История Казахстана: 20 заданий по спецификации');
    } catch (e) {
      toast.error('Не удалось сформировать тест по спецификации Истории КЗ');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Launch unified trial ENT covering four sections
  const startTrialENT = async () => {
    setGeneratingQuestions(true);
    try {
      const all = await dataService.getQuestions();
      const subjectKeyMap: Record<string, string> = {
        history: 'history_kz',
        mathematics: 'math_profile',
        physics: 'physics_profile',
        math_literacy: 'math_literacy',
      };
      const byKey = (q: Question) => subjectKeyMap[(q as any).subject] || (q as any).subject;
      const titleMapRu: Record<string, string> = {
        history_kz: 'История Казахстана',
        math_literacy: 'Математическая грамотность',
        math_profile: 'Математика',
        physics_profile: 'Физика',
      };
      const titleMapKz: Record<string, string> = {
        history_kz: 'Қазақстан тарихы',
        math_literacy: 'Математикалық сауаттылық',
        math_profile: 'Математика',
        physics_profile: 'Физика',
      };
      const titles = language === 'kz' ? titleMapKz : titleMapRu;

      // Exact required counts per specification
      const wanted: Array<{ key: 'history_kz' | 'math_literacy' | 'math_profile' | 'physics_profile'; num: number }> = [
        { key: 'history_kz', num: 20 },
        { key: 'math_literacy', num: 10 },
        { key: 'math_profile', num: 35 },
        { key: 'physics_profile', num: 35 },
      ];

      // Utility: ensure choice structure
      const ensureSingleChoice = (q: any): any => {
        const options: string[] = Array.isArray(q.options) ? [...q.options] : [];
        while (options.length < 4) options.push(`Вариант ${options.length + 1}`);
        if (options.length > 4) options.length = 4;
        let correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : Array.isArray(q.correct_answer) ? (q.correct_answer[0] ?? 0) : (q.answerIndex ?? 0);
        correctIndex = Math.min(Math.max(0, correctIndex), 3);
        return { ...q, type: 'single', options, correctAnswer: correctIndex, correct_answer: undefined };
      };

      const toMultiSelectLastTen = (qs: any[]): any[] => {
        if (qs.length <= 10) return qs.map(ensureSingleChoice);
        const first = qs.slice(0, qs.length - 10).map(ensureSingleChoice);
        const last = qs.slice(qs.length - 10).map((q) => {
          let options: string[] = Array.isArray(q.options) ? [...q.options] : [];
          while (options.length < 6) options.push(`Вариант ${options.length + 1}`);
          if (options.length > 6) options.length = 6;
          const numCorrect = Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1));
          const indices = new Set<number>();
          while (indices.size < numCorrect) indices.add(Math.floor(Math.random() * 6));
          return { ...q, type: 'multi_select', options, correct_answer: Array.from(indices).sort((a,b)=>a-b) };
        });
        return [...first, ...last];
      };

      let composed: Question[] = [];
      const built: Array<{ key: string; title: string; count: number; mandatory: boolean }> = [];
      for (const w of wanted) {
        const pool = all.filter(q => byKey(q) === w.key && (!q.lang || q.lang === language));
        if (pool.length < w.num) {
          toast.error(`Недостаточно вопросов для раздела: ${titles[w.key]} (нужно ${w.num}, найдено ${pool.length})`);
          setGeneratingQuestions(false);
          return;
        }
        let slice = pool.slice(0, w.num) as any[];
        if (w.key === 'math_profile' || w.key === 'physics_profile') {
          slice = toMultiSelectLastTen(slice);
        } else {
          slice = slice.map(ensureSingleChoice);
        }
        composed = composed.concat(slice as any);
        built.push({ key: w.key, title: titles[w.key] || w.key, count: slice.length, mandatory: true });
      }

      if (composed.length === 0) {
        toast.error('Недостаточно вопросов для пробного ЕНТ');
        return;
      }

      setQuestions(composed);
      setSectionInfo(built);
      setTestMode('ai-generated');
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setResults([]);
      setTestCompleted(false);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
      setTotalTestTime(0);
      toast.success('Пробный ЕНТ запущен');
    } catch (error) {
      console.error('Error starting trial ENT:', error);
      toast.error('Ошибка запуска пробного ЕНТ');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const startHistoryOnly = async () => {
    setGeneratingQuestions(true);
    try {
      const ent = await dataService.generateENTQuiz(track, { maxPerSection: 20 });
      const onlyHistory = ent.questions.filter(q => (q as any).subject === 'history_kz').slice(0, 20);
      if (onlyHistory.length === 0) {
        toast.error('Не удалось сформировать вопросы по Истории Казахстана');
        return;
      }
      setQuestions(onlyHistory);
      setTestMode('ai-generated');
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setResults([]);
      setTestCompleted(false);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
      setTotalTestTime(0);
      toast.success('История Казахстана: 20 вопросов');
    } catch (error) {
      console.error('Error generating History KZ questions:', error);
      toast.error('Ошибка генерации вопросов Истории Казахстана');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const startTest = (mode: 'practice' | 'timed' | 'ai-generated') => {
    setTestMode(mode);
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setResults([]);
    setTestCompleted(false);
    setSelectedAnswer(null);
    setSelectedAnswersMulti([]);
    setQuestionStartTime(Date.now());
    setTotalTestTime(0);
    // UNT total timing: fixed 240 minutes
    const total = 240 * 60;
    setTimeLeft(mode === 'timed' ? total : 0);
    toast.success(`Тест запущен в режиме: ${mode === 'practice' ? 'Практика' : mode === 'timed' ? 'На время' : 'ИИ тест'}`);
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;
    let isCorrect = false;
    if (currentQuestion.type === 'multi_select') {
      const correct = Array.isArray(currentQuestion.correct_answer) ? (currentQuestion.correct_answer as number[]) : [];
      const sortedA = [...selectedAnswersMulti].sort();
      const sortedB = [...correct].sort();
      isCorrect = sortedA.length > 0 && sortedA.length === sortedB.length && sortedA.every((v, i) => v === sortedB[i]);
    } else {
      if (selectedAnswer === null) return;
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }

    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer: currentQuestion.type === 'multi_select' ? (selectedAnswersMulti as unknown as any) : (selectedAnswer as number),
      isCorrect,
      timeSpent
    };

    setResults(prev => [...prev, result]);
    setTotalTestTime(prev => prev + timeSpent);
    setAnsweredMap(prev => ({ ...prev, [currentQuestionIndex]: true }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSelectedAnswersMulti([]);
      setQuestionStartTime(Date.now());
    } else {
      finishTest();
    }
  };

  const detectSubjectLabel = (q: Question): string => {
    const label = (ru: string, kz: string) => language === 'kz' ? kz : ru;
    const raw = String(((q as any).subject || '')).toLowerCase().replace(/\s+/g, '_');
    const key = raw;
    const map: Record<string, { ru: string; kz: string }> = {
      history_kz: { ru: 'История Казахстана', kz: 'Қазақстан тарихы' },
      history: { ru: 'История Казахстана', kz: 'Қазақстан тарихы' },
      kazakh_history: { ru: 'История Казахстана', kz: 'Қазақстан тарихы' },
      math_literacy: { ru: 'Математическая грамотность', kz: 'Математикалық сауаттылық' },
      mathematical_literacy: { ru: 'Математическая грамотность', kz: 'Математикалық сауаттылық' },
      ml: { ru: 'Математическая грамотность', kz: 'Математикалық сауаттылық' },
      math_profile: { ru: 'Математика', kz: 'Математика' },
      mathematics: { ru: 'Математика', kz: 'Математика' },
      math: { ru: 'Математика', kz: 'Математика' },
      algebra: { ru: 'Математика', kz: 'Математика' },
      geometry: { ru: 'Математика', kz: 'Математика' },
      physics_profile: { ru: 'Физика', kz: 'Физика' },
      physics: { ru: 'Физика', kz: 'Физика' },
      chemistry: { ru: 'Химия', kz: 'Химия' },
      biology: { ru: 'Биология', kz: 'Биология' },
      geography: { ru: 'География', kz: 'География' },
      literature: { ru: 'Литература', kz: 'Әдебиет' },
      informatics: { ru: 'Информатика', kz: 'Информатика' },
      computer_science: { ru: 'Информатика', kz: 'Информатика' },
      russian: { ru: 'Русский язык', kz: 'Орыс тілі' },
      kazakh: { ru: 'Казахский язык', kz: 'Қазақ тілі' },
      kazakh_language: { ru: 'Казахский язык', kz: 'Қазақ тілі' },
    };
    if (map[key]) return label(map[key].ru, map[key].kz);
    // Heuristic: ENT math literacy domain codes 01..10
    const domain = (q as any)?.meta?.domain || (q as any)?.meta?.topicCode;
    if (typeof domain === 'string' && /^\d{2}$/.test(domain)) {
      return label('Математическая грамотность', 'Математикалық сауаттылық');
    }
    // Fallback to current section title if available
    if (sectionBoundaries.length > 0 && currentSection) return currentSection.title;
    return label('Предмет', 'Пән');
  };

  const explainCurrentQuestion = async () => {
    const q = questions[currentQuestionIndex];
    if (!q) return;
    const subject = detectSubjectLabel(q);
    setExplainings(prev => ({ ...prev, [q.id]: language==='kz'?'Түсіндіру жүктелуде...':'Объяснение загружается...' }));
    try {
      const res = await dataService.explainProblem(language as 'ru'|'kz', {
        subject,
        problem: q.question,
        options: (q.options || []) as string[],
        studentAnswer: results[currentQuestionIndex]?.selectedAnswer !== undefined ? String(results[currentQuestionIndex]?.selectedAnswer) : undefined,
        correctAnswer: Array.isArray(q.correct_answer) ? (q.correct_answer as number[]).join(',') : String((q as any).correctAnswer ?? ''),
        contextNotes: 'Формат ЕНТ, краткость и ясность.',
        mode: 'step_by_step',
      });
      setExplainings(prev => ({ ...prev, [q.id]: res.response }));
    } catch {
      setExplainings(prev => ({ ...prev, [q.id]: language==='kz'?'Қате. Кейінірек қайталап көріңіз.':'Ошибка. Попробуйте позже.' }));
    }
  };

  const finishTest = async () => {
    setTestCompleted(true);
    const score = results.filter(r => r.isCorrect).length;
    setTestScore(score);

    try {
      const answers = results.map(r => ({
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        correct: r.isCorrect
      }));

      await dataService.submitTest({
        answers,
        score,
        total: questions.length,
        timeSpent: Math.round(totalTestTime / 1000),
        subject: questions[0]?.subject || 'general',
        difficulty: questions[0]?.difficulty || 'medium'
      });

      toast.success('Результаты сохранены!');
      // Build structured analysis per topics
      try {
        const preferred_language = language as 'ru' | 'kz';
        // Derive human-readable, mistake-focused topics using analyzer and localize labels
        const analyzed = analyzeQuestionObjects(questions as any);
        const records = analyzed.records;
        const getSectionTitleForIndex = (i: number): string | null => {
          const b = sectionBoundaries.find(b => i >= b.start && i <= b.end);
          return b ? b.title : null;
        };
        const toLocalizedTopic = (rec: any, q: any, idx: number): string => {
          // Prefer explicit Math Literacy topic labels from question metadata
          if ((q as any)?.subject === 'math_literacy' && (q as any)?.meta) {
            const mlLabel = language === 'kz'
              ? (q as any).meta?.topicCodeKz
              : (q as any).meta?.topicTranslation;
            if (mlLabel && typeof mlLabel === 'string') return mlLabel;
          }
          const key = String(rec.topic || '').trim();
          const ru: Record<string, string> = {
            'Quadratic equations': 'Квадратные уравнения',
            'Linear equations': 'Линейные уравнения',
            'Systems of equations': 'Системы уравнений',
            'Inequalities': 'Неравенства',
            'Functions and graphs': 'Функции и графики',
            'Quadratic functions': 'Квадратичные функции',
            'Logarithms': 'Логарифмы',
            'Exponents and powers': 'Степени и показатели',
            'Exponential and logarithmic equations': 'Показательные и логарифмические уравнения',
            'Percentages': 'Проценты',
            'Ratio and proportion': 'Отношения и пропорции',
            'Probability and combinatorics': 'Вероятность и комбинаторика',
            'Descriptive statistics': 'Описательная статистика',
            'Variance and standard deviation': 'Дисперсия и СКО',
            'Sequences and series': 'Последовательности и ряды',
            'Plane and solid geometry': 'Геометрия (плоская и пространственная)',
            'Coordinate geometry': 'Координатная геометрия',
            'Triangles (similarity, Pythagoras)': 'Треугольники (подобие, Пифагор)',
            'Circle geometry': 'Геометрия окружности',
            'Area and volume (cylinder, cone, sphere)': 'Площади и объёмы (цилиндр, конус, сфера)',
            'Vectors': 'Векторы',
            'Matrices': 'Матрицы',
            'Complex numbers': 'Комплексные числа',
            'Trigonometric values and identities': 'Тригонометрия (значения и тождества)',
            'Trigonometric equations': 'Тригонометрические уравнения',
            'Trigonometric graphs': 'Графики тригонометрических функций',
            'Limits': 'Пределы',
            'Derivatives and integrals': 'Производные и интегралы',
            'Differential equations': 'Дифференциальные уравнения',
            'Primes and divisibility': 'Простые числа и делимость',
            'General problem solving': 'Общее решение задач',
            // History topics
            'Historical facts and chronology': 'Исторические факты и хронология',
            'Mongol invasion': 'Монгольские завоевания',
            'White Horde': 'Ак Орда',
            'Nogai Horde': 'Ногайская Орда',
            'Anyrakai battle': 'Анракайская битва',
            'Kazakh–Dzungar wars': 'Казахско-джунгарские войны',
            'Alash movement': 'Движение Алаш',
            'Constitution of Kazakhstan (1995)': 'Конституция РК (1995)',
            'Capital moved to Astana': 'Перенос столицы в Астану',
            'Great Famine (1931–1933)': 'Голод 1931–1933',
            'De-Stalinization (XX CPSU Congress)': 'Десталинизация (XX съезд КПСС)',
            'Khanate of Abulkhair': 'Казанат Әбілқайыр (Абулхаир хан)'
          };
          const kz: Record<string, string> = {
            'Quadratic equations': 'Квадрат теңдеулер',
            'Linear equations': 'Сызықтық теңдеулер',
            'Systems of equations': 'Теңдеулер жүйесі',
            'Inequalities': 'Теңсіздіктер',
            'Functions and graphs': 'Функциялар және графиктер',
            'Quadratic functions': 'Квадраттық функциялар',
            'Logarithms': 'Логарифмдер',
            'Exponents and powers': 'Дәрежелер және көрсеткіштер',
            'Exponential and logarithmic equations': 'Көрсеткіштік және логарифмдік теңдеулер',
            'Percentages': 'Пайыздар',
            'Ratio and proportion': 'Қатынас және пропорция',
            'Probability and combinatorics': 'Ықтималдық және комбинаторика',
            'Descriptive statistics': 'Сипаттамалық статистика',
            'Variance and standard deviation': 'Дисперсия және СКО',
            'Sequences and series': 'Тізбектер және қатарлар',
            'Plane and solid geometry': 'Геометрия (жазық және кеңістік)',
            'Coordinate geometry': 'Координаталық геометрия',
            'Triangles (similarity, Pythagoras)': 'Үшбұрыштар (ұқсастық, Пифагор)',
            'Circle geometry': 'Шеңбер геометриясы',
            'Area and volume (cylinder, cone, sphere)': 'Аудандар және көлемдер (цилиндр, конус, сфера)',
            'Vectors': 'Векторлар',
            'Matrices': 'Матрицалар',
            'Complex numbers': 'Кешен сандар',
            'Trigonometric values and identities': 'Тригонометрия (мәндер мен тепе-теңдіктер)',
            'Trigonometric equations': 'Тригонометриялық теңдеулер',
            'Trigonometric graphs': 'Тригонометриялық функция графиктері',
            'Limits': 'Шектер',
            'Derivatives and integrals': 'Туынды және интеграл',
            'Differential equations': 'Дифференциалдық теңдеулер',
            'Primes and divisibility': 'Жай сандар және бөлінгіштік',
            'General problem solving': 'Жалпы есеп шығару',
            // History topics
            'Historical facts and chronology': 'Тарихи фактілер және хронология',
            'Mongol invasion': 'Моңғол шапқыншылығы',
            'White Horde': 'Ақ Орда',
            'Nogai Horde': 'Ноғай Ордасы',
            'Anyrakai battle': 'Аңырақай шайқасы',
            'Kazakh–Dzungar wars': 'Қазақ‑жоңғар соғыстары',
            'Alash movement': 'Алаш қозғалысы',
            'Constitution of Kazakhstan (1995)': 'ҚР Конституциясы (1995)',
            'Capital moved to Astana': 'Астанаға астананы көшіру',
            'Great Famine (1931–1933)': 'Ашаршылық 1931–1933',
            'De-Stalinization (XX CPSU Congress)': 'Десталинизация (КПСС XX съезі)',
            'Khanate of Abulkhair': 'Әбілқайыр хандығы'
          };
          const map = language === 'kz' ? kz : ru;
          const label = map[key] || key;
          const isGeneric = !label || label === 'General knowledge' || label === 'Общее решение задач' || label === 'General problem solving' || label === 'Тема' || label === 'Тақырып' || /General/i.test(label);
          if (!isGeneric) return label;
          // Fallback to section title or subject label if analyzer was generic
          const sec = getSectionTitleForIndex(idx);
          if (sec) return sec;
          return detectSubjectLabel(q as any);
        };
        const analysisInput = {
          student_id: user?.id || 'anon',
          test_id: `test-${questions[0]?.subject || 'general'}`,
          timestamp: new Date().toISOString(),
          questions: questions.map((q, idx) => ({
            question_id: q.id,
            topic: toLocalizedTopic(records[idx] || {}, q, idx),
            max_score: 1,
            score: results[idx]?.isCorrect ? 1 : 0,
            correct: !!results[idx]?.isCorrect,
            response: null,
            time_spent_seconds: Math.round((results[idx]?.timeSpent || 0) / 1000) || null,
          })),
          metadata: { grade_level: '11', preferred_language },
        } as any;
        const analysis = analyzeTestResults(analysisInput);
        setStructuredAnalysis(analysis);
        try {
          const diagRu = generateDiagnosticReportRuFromAnalyze(analysis);
          const diagKz = generateDiagnosticReportKzFromAnalyze(analysis);
          setDiagnosticReportRu(diagRu);
          setDiagnosticReportKz(diagKz);
        } catch {}
        await dataService.saveLastAnalysis(analysis);
      } catch {}
      try {
        setAiAnalyzing(true);
        const latest = (await dataService.getResults()).sort((a,b)=>new Date(b.completed_at).getTime()-new Date(a.completed_at).getTime())[0];
        if (latest) {
          const total = Array.isArray(latest.answers) ? latest.answers.length : questions.length;
          const correct = Array.isArray(latest.answers) ? latest.answers.filter((a:any)=>a.correct).length : score;
          const analysisPayload = {
            subject: latest.test_id?.replace('test-','') || (questions[0]?.subject || 'overall'),
            percentage: Math.round((correct/total)*100),
            correct,
            total,
            timeSpent: latest.time_spent,
            strengths: [],
            weaknesses: [],
            topics: [],
            homework: []
          };
          const aiPromptRu = `Ты — экспертный тьютор ЕНТ. Проанализируй JSON и дай чёткие рекомендации.

Формат (кратко, списками):
1) Итог: % и вердикт (>=90 Отлично, 70–89 Хорошо, 50–69 Удовлетворительно, <50 Усилить базу), время.
2) Сильные: 3–5 пунктов (темы/навыки).
3) Слабые: 3–5 пунктов (знание/внимание/тайм‑менеджмент), помечай «вероятно» при малой выборке.
4) Что делать: 3–5 действий (объём задач в день/неделю, фокус на разборе решений).
5) ДЗ: 5–7 пунктов (тема → кол-во задач/время, тип задач, контроль — порог %).
6) План 7 дней: темы/мин/цель по %.
7) Готовность к следующему пробнику: да/нет и целевой порог.

Стиль: русский, без воды, конкретика, ориентируйся на слабые темы и время.`;

          const aiPromptKz = `Сен — ЕНТ бойынша тәжірибелі тьюторсың. JSON бойынша нақты ұсыныстар бер.

Формат (қысқа, маркерленген):
1) Қорытынды: % және вердикт (>=90 Өте жақсы, 70–89 Жақсы, 50–69 Қанағат, <50 Базаны күшейту), уақыт.
2) Күшті жақтар: 3–5 тармақ (тақырып/дағды).
3) Әлсіз жақтар: 3–5 тармақ (білім/ұқыптылық/уақыт), дерек аз болса «мүмкін» деп белгіле.
4) Не істеу керек: 3–5 әрекет (күніне/аптасына тапсырма саны, шешім талдауға фокус).
5) Үй жұмысы: 5–7 тармақ (тақырып → тапсырма саны/уақыт, түрі, бақылау — порог %).
6) 7 күндік жоспар: тақырыптар/мин/мақсатты %.
7) Келесі пробникке дайындық: иә/жоқ және порог.

Стиль: қазақ тілінде, артық сөзсіз, нақты, әлсіз тақырыптарға басымдық бер.`;

          const prompt = language === 'kz' ? aiPromptKz : aiPromptRu;
          const res = await dataService.chatWithAI(prompt, `ANALYZE_TEST_RESULTS: ${JSON.stringify(analysisPayload)}`, language);
          setAiAnalysis(res.response);
        }
      } catch (e) {
        // ignore
      } finally {
        setAiAnalyzing(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Ошибка сохранения результатов');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Compute section boundaries to show grouping (e.g., История 20, МГ 15, профиль 35)
  const sectionBoundaries = useMemo(() => {
    const bounds: Array<{ start: number; end: number; key: string; title: string; mandatory: boolean }> = [];
    let cursor = 0;
    for (const s of sectionInfo) {
      const start = cursor;
      const end = cursor + s.count - 1;
      if (s.count > 0) bounds.push({ start, end, key: s.key, title: s.title, mandatory: s.mandatory });
      cursor += s.count;
    }
    return bounds;
  }, [sectionInfo]);

  const currentSectionIndex = useMemo(() => {
    return sectionBoundaries.findIndex(b => currentQuestionIndex >= b.start && currentQuestionIndex <= b.end);
  }, [sectionBoundaries, currentQuestionIndex]);

  const currentSection = sectionBoundaries[currentSectionIndex] || null;

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setResults([]);
    setTestScore(0);
    setTotalTestTime(0);
    setShowExplanations(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-sm sm:text-base mb-4">{language === 'kz' ? 'Тестілер жүктелуде...' : 'Загрузка тестов...'}</p>
          
          {/* Feedback Panel for Loading Screen */}
          <div className="mt-6 sm:mt-8 max-w-sm sm:max-w-md mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <p className="text-gray-700 mb-3 text-xs sm:text-sm">
                  Пока загружаются тесты, можете связаться с нами:
                </p>
                <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Telegram</p>
                    <p className="text-blue-600 font-mono text-xs sm:text-sm">@Piroburek</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs touch-target-medium"
                    onClick={() => window.open('https://t.me/Piroburek', '_blank')}
                  >
                    <span className="hidden sm:inline">Написать</span>
                    <span className="sm:hidden">💬</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 tests-page">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl mb-2 text-center text-white font-bold">{t('tests.title')}</h1>
          <p className="text-center text-gray-200 mb-6 sm:mb-8 text-sm sm:text-base px-2">Подготовка к ЕНТ по направлениям «Математика» и «Физика». Обязательные секции (История Казахстана, Математическая грамотность) включаются автоматически.</p>
          
          {/* Feedback Panel */}
          <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                <MessageCircle className="h-5 w-5" />
                Обратная связь
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-6">
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                Есть вопросы или предложения? Свяжитесь с нами через Telegram:
              </p>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Telegram</p>
                  <p className="text-blue-600 font-mono text-sm sm:text-base">@Piroburek</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="touch-target-medium"
                  onClick={() => window.open('https://t.me/Piroburek', '_blank')}
                >
                  <span className="hidden sm:inline">Написать</span>
                  <span className="sm:hidden">💬</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Направление подготовки</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <span className="text-sm text-gray-800">Язык / Тіл:</span>
                <div className="flex gap-2">
                  <Button size="sm" variant={language==='ru'?'default':'outline'} onClick={()=>setLanguage('ru')} role="switch" aria-checked={language==='ru'} aria-label="Русский язык" className="touch-target-medium">Рус</Button>
                  <Button size="sm" variant={language==='kz'?'default':'outline'} onClick={()=>setLanguage('kz')} role="switch" aria-checked={language==='kz'} aria-label="Қазақ тілі" className="touch-target-medium">Қаз</Button>
                </div>
              </div>
              <div className="flex gap-2 opacity-50 pointer-events-none" role="radiogroup" aria-label="Track">
                <Button aria-checked={track==='math'} role="radio" variant={track==='math'?'default':'outline'} className="touch-target-medium">Математика</Button>
                <Button aria-checked={track==='physics'} role="radio" variant={track==='physics'?'default':'outline'} className="touch-target-medium">Физика</Button>
              </div>
              <div className="mt-4 text-sm text-gray-800">
                Обязательные секции: История Казахстана и Математическая грамотность. Направление профиля временно фиксировано.
              </div>
              {sectionInfo.length > 0 && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {sectionInfo.map((s) => (
                    <div key={s.key} className="subject-card p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm sm:text-base">{s.title}</h3>
                        {s.mandatory && <Badge variant="secondary" className="text-xs">Обязательно</Badge>}
                      </div>
                      <div className="subject-status text-xs sm:text-sm">
                        <span className="questions-count">Вопросов: {s.count}</span> 
                        <span className="questions-plan">(план: {DEFAULT_ENT_TEMPLATE.tracks[track].sections.find(sec=>sec.key===s.key)?.numQuestions || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <ImportENTDialog onImported={loadQuestions} />
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Пробный ЕНТ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                <p className="text-white mb-4 text-sm sm:text-base">Содержит четыре раздела:</p>
                <ul className="list-disc pl-5 text-gray-200 space-y-1 mb-4 text-sm sm:text-base">
                  <li>История Казахстана (20)</li>
                  <li>Математическая грамотность (10)</li>
                  <li>Математика (35)</li>
                  <li>Физика (35)</li>
                </ul>
                <Button onClick={startTrialENT} className="w-full touch-target-large" disabled={generatingQuestions || loading}>
                  Начать пробный ЕНТ
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button variant="outline" onClick={startMathLiteracySpec} disabled={generatingQuestions || loading} className="touch-target-medium text-sm">
                    Математическая грамотность (10 по спецификации)
                  </Button>
                  <Button variant="outline" onClick={startHistoryKZSpec} disabled={generatingQuestions || loading} className="touch-target-medium text-sm">
                    История Казахстана (20 по спецификации)
                  </Button>
                </div>
                
                {/* Language-aware test buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {language === 'kz' ? 'Тілді ауыстырумен тестілер' : 'Тесты с переключением языка'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => startLanguageAwareTest('mathematics')} 
                      disabled={generatingQuestions || loading}
                      className="text-sm touch-target-medium"
                    >
                      {language === 'kz' ? 'Математика (35 тапсырма)' : 'Математика (35 заданий)'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => startLanguageAwareTest('physics')} 
                      disabled={generatingQuestions || loading}
                      className="text-sm touch-target-medium"
                    >
                      {language === 'kz' ? 'Физика (35 тапсырма)' : 'Физика (35 заданий)'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {questions.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Доступные вопросы</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                {sectionBoundaries.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {sectionBoundaries.map((b, idx) => (
                      <div key={b.key} className="text-sm text-white">
                        <span className="font-medium">{idx+1}. {b.title}</span>: {b.start+1}–{b.end+1}
                        {b.mandatory && <Badge className="ml-2" variant="outline">Обязательно</Badge>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-gray-200 text-sm sm:text-base">
                  Всего вопросов: <span className="font-semibold text-white">{questions.length}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {Array.from(new Set(questions.map(q => (q as any).subject))).map(subject => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const percentage = Math.round((testScore / questions.length) * 100);
    const averageTimePerQuestion = Math.round(totalTestTime / 1000 / questions.length);

    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="text-center pb-3 sm:pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                Результаты теста
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
                <div className="text-center flex-1 min-w-[200px] sm:min-w-[220px]">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{testScore}</div>
                  <div className="text-gray-600 text-sm sm:text-base">из {questions.length}</div>
                  <div className="text-sm text-gray-500">Правильных ответов</div>
                </div>
                <div className="text-center flex-1 min-w-[200px] sm:min-w-[220px]">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-gray-600 text-sm sm:text-base">Результат</div>
                  <div className="text-sm text-gray-500">
                    {percentage >= 90 ? 'Отлично!' : percentage >= 70 ? 'Хорошо' : percentage >= 50 ? 'Удовлетворительно' : 'Нужно подучить'}
                  </div>
                </div>
                <div className="text-center flex-1 min-w-[200px] sm:min-w-[220px]">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">{averageTimePerQuestion}с</div>
                  <div className="text-gray-600 text-sm sm:text-base">на вопрос</div>
                  <div className="text-sm text-gray-500">Среднее время</div>
                </div>
              </div>

              <Progress value={percentage} className="mb-6" />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button onClick={() => setShowExplanations(!showExplanations)} variant="outline" className="touch-target-medium">
                  {showExplanations ? 'Скрыть' : 'Показать'} объяснения
                </Button>
                <Button onClick={resetTest} className="touch-target-medium">
                  Пройти еще раз
                </Button>
              </div>
            </CardContent>
          </Card>

          {structuredAnalysis && (
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="text-center pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">{language==='kz'?'Құрылымдалған талдау':'Структурированный анализ'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                <div className="space-y-4 text-gray-800">
                  <div className="p-3 rounded bg-gray-50 border">
                    <div className="font-semibold mb-1 text-sm sm:text-base">{language==='kz'?'Жалпы нәтиже':'Общий результат'}: {structuredAnalysis.overall_score_pct}%</div>
                    <div className="text-sm">{structuredAnalysis.teacher_notes}</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-sm sm:text-base">{language==='kz'?'Тақырыптар':'Темы'}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {structuredAnalysis.topics.map(t => (
                        <div key={t.topic} className="p-3 rounded border bg-white">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm sm:text-base">{t.topic}</div>
                            <span className={`text-xs px-2 py-0.5 rounded ${t.classification==='weak'?'bg-red-100 text-red-700':t.classification==='borderline'?'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-700'}`}>{t.classification}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{Math.round(t.percent_correct)}% · {Math.round(t.avg_score_pct)}% · conf {t.confidence}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-sm sm:text-base">{language==='kz'?'Ұсынылатын жаттығулар үлесі':'Распределение практики'}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {structuredAnalysis.recommended_practice_distribution.map(p => (
                        <div key={p.topic} className="p-3 rounded border bg-white flex items-center justify-between">
                          <span className="text-sm sm:text-base">{p.topic}</span>
                          <span className="font-semibold text-sm sm:text-base">{Math.round(p.proportion*100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-sm sm:text-base">{language==='kz'?'Үй жұмысы':'Домашнее задание'}</div>
                    {(() => {
                      const bandByTopic: Record<string, string> = {};
                      structuredAnalysis.topics.forEach(t => bandByTopic[t.topic] = t.classification);
                      const weakSet = new Set(Object.keys(bandByTopic).filter(k => bandByTopic[k] !== 'strong'));
                      const hw = structuredAnalysis.homework.filter(h => weakSet.has(h.topic)).slice(0,6);
                      if (!hw.length) return <div className="text-sm text-gray-600">{language==='kz'?'Әлсіз тақырыптар табылмады':'Слабые темы не обнаружены'}</div>;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {hw.map(h => {
                            const band = bandByTopic[h.topic] || 'borderline';
                            const bg = band==='weak'?'bg-red-100 border-red-300':band==='borderline'?'bg-yellow-100 border-yellow-300':'bg-green-100 border-green-300';
                            const text = 'text-gray-900';
                            return (
                              <div key={h.task_id} className={`p-3 rounded border ${bg} ${text} hw-card ${band==='weak'?'badge-weak':band==='borderline'?'badge-borderline':'badge-strong'}`}>
                                <div className="text-xs font-semibold mb-0.5 uppercase tracking-wide">{h.topic}</div>
                                <div className="text-sm font-medium">{h.title}</div>
                                <div className="text-xs opacity-80">{language==='kz'?'Уақыты:':'Время:'} {h.estimated_time_minutes} {language==='kz'?'мин':'мин'}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-sm sm:text-base">{language==='kz'?'Бейне ұсыныстар':'Видео‑рекомендации'}</div>
                    {(() => {
                      const bandByTopic: Record<string, string> = {};
                      structuredAnalysis.topics.forEach(t => bandByTopic[t.topic] = t.classification);
                      const weakSet = new Set(Object.keys(bandByTopic).filter(k => bandByTopic[k] !== 'strong'));
                      const vids = structuredAnalysis.video_recommendations.filter(v => weakSet.has(v.topic)).slice(0,6);
                      if (!vids.length) return <div className="text-sm text-gray-600">{language==='kz'?'Ұсыныстар жоқ':'Рекомендации отсутствуют'}</div>;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {vids.map((v, idx) => {
                            const band = bandByTopic[v.topic] || 'borderline';
                            const bg = band==='weak'?'bg-red-100 border-red-300':band==='borderline'?'bg-yellow-100 border-yellow-300':'bg-green-100 border-green-300';
                            const text = 'text-gray-900';
                            return (
                              <div key={idx} className={`p-3 rounded border ${bg} ${text} hw-card ${band==='weak'?'badge-weak':band==='borderline'?'badge-borderline':'badge-strong'}`}>
                                <div className="text-xs font-semibold mb-0.5 uppercase tracking-wide">{v.topic}</div>
                                <div className="text-sm font-medium">{v.title}</div>
                                <div className="text-xs opacity-80">{v.query_terms.join(' ')} · {v.recommended_length_min} {language==='kz'?'мин':'мин'}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-3 rounded bg-indigo-50 border text-indigo-900 text-sm">
                    {structuredAnalysis.student_message}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(language==='kz' ? diagnosticReportKz : diagnosticReportRu) && (
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="text-center pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">{language==='kz'?'Қысқа диагностикалық есеп (KZ)':'Краткий диагностический отчёт (RU)'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-x-auto">{language==='kz'?diagnosticReportKz:diagnosticReportRu}</pre>
              </CardContent>
            </Card>
          )}

          {showExplanations && (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const result = results[index];
              const secIdx = sectionBoundaries.findIndex(b => index >= b.start && index <= b.end);
              const isSectionStart = secIdx !== -1 && index === sectionBoundaries[secIdx].start;
                return (
                  <Card key={question.id} className={`border-l-4 ${result?.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="pt-4 sm:pt-6">
                    {isSectionStart && (
                      <div className="mb-3 p-2 rounded bg-gray-50 border text-sm text-gray-700">
                        Раздел: {sectionBoundaries[secIdx].title} {sectionBoundaries[secIdx].mandatory && <Badge className="ml-2" variant="outline">Обязательно</Badge>}
                      </div>
                    )}
                      <div className="flex items-start gap-3 mb-3">
                        {result?.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Вопрос {index + 1}: {question.question}</h4>
                          <div className="space-y-1">
                            {(question.options || []).map((option, optionIndex) => {
                              const isCorrectMulti = Array.isArray(question.correct_answer) && (question.correct_answer as number[]).includes(optionIndex);
                              const isUserSelected = result?.selectedAnswer === optionIndex; // for single
                              const isUserSelectedMulti = Array.isArray(result?.selectedAnswer) && (result?.selectedAnswer as unknown as number[]).includes(optionIndex);
                              const isCorrectSingle = optionIndex === (question as any).correctAnswer;
                              const highlight = question.type === 'multi_select'
                                ? (isCorrectMulti ? 'bg-green-100 text-green-800' : (isUserSelectedMulti && !result?.isCorrect ? 'bg-red-100 text-red-800' : 'bg-gray-50'))
                                : (isCorrectSingle ? 'bg-green-100 text-green-800' : (isUserSelected && !result?.isCorrect ? 'bg-red-100 text-red-800' : 'bg-gray-50'));
                              return (
                                <div key={optionIndex} className={`p-2 rounded text-sm ${highlight}`}>
                                {option}
                              </div>
                              );
                            })}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                              <strong>Объяснение:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <Card className="mt-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">{language==='kz'?'ИИ талдауы':'Анализ ИИ'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-6">
              {aiAnalyzing ? (
                <p className="text-gray-600 text-sm sm:text-base">{language==='kz'?'ИИ талдауда...':'ИИ анализирует...'}</p>
              ) : (
                <div className="whitespace-pre-wrap text-gray-800 text-sm sm:text-base">{aiAnalysis || (language==='kz'?'Нәтиже бойынша талдау қолжетімді.':'Анализ доступен для результатов.')}</div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Panel */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                <MessageCircle className="h-5 w-5" />
                Обратная связь
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-6">
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                Как вам тест? Есть вопросы или предложения? Свяжитесь с нами через Telegram:
              </p>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Telegram</p>
                  <p className="text-blue-600 font-mono text-sm sm:text-base">@Piroburek</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="touch-target-medium"
                  onClick={() => window.open('https://t.me/Piroburek', '_blank')}
                >
                  <span className="hidden sm:inline">Написать</span>
                  <span className="sm:hidden">💬</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </h1>
            {/* Timer hidden for unified ENT without time limit */}
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-300 sm:text-gray-600">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="font-medium">Прогресс:</span>
                <span className="text-blue-400 sm:text-blue-600 font-semibold">{Math.round(progress)}%</span>
                <span className="text-gray-400 sm:text-gray-500">({currentQuestionIndex + 1}/{questions.length})</span>
              </span>
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="font-medium">Отвечено:</span>
                <span className="text-green-400 sm:text-green-600 font-semibold">{Object.keys(answeredMap).length}</span>
                <span className="text-gray-400 sm:text-gray-500">из {questions.length}</span>
              </span>
              {results.length > 0 && (
                <span className="flex items-center gap-1 sm:gap-2">
                  <span className="font-medium">Правильно:</span>
                  <span className="text-emerald-400 sm:text-emerald-600 font-semibold">{results.filter(r => r.isCorrect).length}</span>
                  <span className="text-gray-400 sm:text-gray-500">из {results.length}</span>
                </span>
              )}
              {totalTestTime > 0 && (
                <span className="flex items-center gap-1 sm:gap-2">
                  <span className="font-medium">Время:</span>
                  <span className="text-purple-400 sm:text-purple-600 font-semibold">{formatTime(Math.round(totalTestTime / 1000))}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentSection && (
                <span className="px-2 py-1 rounded bg-gray-800 sm:bg-gray-100 text-gray-200 sm:text-gray-800 text-xs">
                  Раздел: {currentSection.title} ({currentQuestionIndex - currentSection.start + 1}/{currentSection.end - currentSection.start + 1})
                </span>
              )}
              <span className="text-xs">Режим: {testMode === 'practice' ? 'Практика' : testMode === 'timed' ? 'На время' : 'ИИ тест'}</span>
            </div>
          </div>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">
              {/* Render image above text if present */}
              {isImageSource((currentQuestion as any).imageUrl) && (
                <div className="mb-3">
                  <img
                    src={(currentQuestion as any).imageUrl}
                    alt="Иллюстрация к вопросу"
                    className="max-h-48 sm:max-h-72 w-auto rounded-lg border object-contain mx-auto"
                  />
                </div>
              )}
              <MathText text={currentQuestion.question} />
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs sm:text-sm">{(currentQuestion as any).subject}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">{(currentQuestion as any).difficulty}</Badge>
              {(currentQuestion as any).meta?.topicTranslation && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                  {language === 'kz' 
                    ? (currentQuestion as any).meta?.topicCodeKz || (currentQuestion as any).meta?.topicTranslation
                    : (currentQuestion as any).meta?.topicTranslation
                  }
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-gray-50">
                <span className={`h-2 w-2 rounded-full ${answeredMap[currentQuestionIndex] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-xs text-gray-700">{answeredMap[currentQuestionIndex] ? 'Отвечено' : 'Не отвечено'}</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="text-xs text-gray-600">
                  Доступные предметы:
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {sectionBoundaries.map((b, idx) => (
                    <Button key={b.key} size="sm" variant={idx===currentSectionIndex?'default':'outline'} onClick={()=>{
                      // jump to first question of the chosen section
                      setCurrentQuestionIndex(b.start);
                    }} className="text-xs">
                      {b.title}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={explainCurrentQuestion} className="text-xs">
                  {language==='kz'?'ИИ түсіндіру':'Объяснить с ИИ'}
                </Button>
                <Button variant="outline" size="sm" onClick={finishTest} className="text-xs">
                  Завершить тест досрочно
                </Button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {currentQuestion.type === 'multi_select' ? (
                (currentQuestion.options || []).map((option, index) => {
                  const checked = selectedAnswersMulti.includes(index);
                  return (
                    <label key={index} className={`w-full p-3 sm:p-4 flex items-center gap-3 rounded-lg border cursor-pointer min-h-[48px] sm:min-h-[56px] ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedAnswersMulti(prev => e.target.checked ? [...prev, index] : prev.filter(i => i !== index));
                        }}
                      />
                      <span className="font-medium mr-1 text-sm sm:text-base">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1 text-sm sm:text-base">
                        {isImageSource(option) ? (
                          <img src={String(option)} alt={`Вариант ${index + 1}`} className="max-h-32 sm:max-h-56 w-auto rounded border object-contain" />
                        ) : (
                          option
                        )}
                      </span>
                    </label>
                  );
                })
              ) : (
                (currentQuestion.options || []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-colors min-h-[48px] sm:min-h-[56px] ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-3 text-sm sm:text-base">{String.fromCharCode(65 + index)}.</span>
                  <span className="inline-flex items-center gap-2 text-sm sm:text-base">
                    {isImageSource(option) ? (
                      <img src={String(option)} alt={`Вариант ${index + 1}`} className="max-h-16 sm:max-h-20 w-auto rounded border object-contain" />
                    ) : (
                      option
                    )}
                  </span>
                </button>
                ))
              )}
            </div>
            {explainings[currentQuestion.id] && (
              <div className="mt-4 p-3 rounded bg-yellow-50 border text-sm whitespace-pre-wrap text-gray-800">
                {explainings[currentQuestion.id]}
              </div>
            )}

            <Button
              onClick={submitAnswer}
              disabled={currentQuestion.type === 'multi_select' ? selectedAnswersMulti.length === 0 : selectedAnswer === null}
              className="w-full min-h-[48px] sm:min-h-[56px] text-base sm:text-lg font-medium"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос'}
            </Button>
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 text-xs sm:text-sm text-gray-600">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                    <span>Текущий</span>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span>Отвечено</span>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
                    <span>Правильно</span>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <span>Неправильно</span>
                  </span>
                </div>
                <span className="text-xs font-medium">
                  {Object.keys(answeredMap).length}/{questions.length} отвечено
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-1 sm:gap-2">
                {questions.map((_, idx) => {
                  const isAnswered = answeredMap[idx];
                  const result = results[idx];
                  const isCorrect = result?.isCorrect;
                  
                  let buttonClass = 'text-xs rounded border px-1 py-1 sm:px-2 sm:py-2 min-h-[36px] sm:min-h-[44px] ';
                  if (idx === currentQuestionIndex) {
                    buttonClass += 'border-blue-500 bg-blue-50 text-blue-700 font-semibold';
                  } else if (isAnswered) {
                    if (isCorrect) {
                      buttonClass += 'border-emerald-500 bg-emerald-50 text-emerald-700';
                    } else {
                      buttonClass += 'border-red-500 bg-red-50 text-red-700';
                    }
                  } else {
                    buttonClass += 'border-gray-200 hover:bg-gray-50 text-gray-600';
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={buttonClass}
                      title={isAnswered ? (isCorrect ? 'Правильно' : 'Неправильно') : 'Не отвечено'}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
    {/* Floating AI Assistant toggle and panel */}
    <button
      type="button"
      onClick={() => setShowAssistant(s => !s)}
      className="fixed bottom-4 right-4 z-40 rounded-full px-3 py-3 sm:px-4 sm:py-3 shadow-lg text-white touch-target-large"
      style={{ background: 'linear-gradient(135deg, #4f46e5, #3730a3)' }}
      aria-label={language === 'kz' ? 'Көмекші чат' : 'Чат помощника'}
    >
      <span className="hidden sm:inline">{showAssistant ? (language === 'kz' ? 'Жабу' : 'Закрыть') : 'Chat'}</span>
      <span className="sm:hidden">💬</span>
    </button>
    {showAssistant && (
      <div className="fixed bottom-20 right-4 z-40 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[92vw] rounded-xl border bg-white shadow-2xl overflow-hidden" style={{ height: '60vh', maxHeight: '520px' }}>
        <div className="h-full overflow-auto p-2">
          <AIAssistant />
        </div>
      </div>
    )}

    {/* Floating Feedback Button */}
    <button
      type="button"
      onClick={() => setShowFeedback(s => !s)}
      className="fixed bottom-4 left-4 z-40 rounded-full px-3 py-3 sm:px-4 sm:py-3 shadow-lg text-white touch-target-large"
      style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
      aria-label="Обратная связь"
    >
      <MessageCircle className="h-5 w-5" />
    </button>
    {showFeedback && (
      <div className="fixed bottom-20 left-4 z-40 w-[calc(100vw-2rem)] sm:w-[320px] max-w-[92vw] rounded-xl border bg-white shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Обратная связь</h3>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-gray-400 hover:text-gray-600 touch-target-medium"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Есть вопросы или предложения? Свяжитесь с нами через Telegram:
          </p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Telegram</p>
              <p className="text-blue-600 font-mono text-sm sm:text-base">@Piroburek</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="touch-target-medium"
              onClick={() => window.open('https://t.me/Piroburek', '_blank')}
            >
              <span className="hidden sm:inline">Написать</span>
              <span className="sm:hidden">💬</span>
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}