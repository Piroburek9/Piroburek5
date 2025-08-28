export type PreferredLanguage = 'en' | 'ru' | 'kz' | string;

export interface TestResultQuestion {
  question_id: string;
  topic: string;
  max_score: number;
  score: number;
  correct: boolean;
  response?: string | null;
  time_spent_seconds?: number | null;
}

export interface TestResultInput {
  student_id: string;
  test_id: string;
  timestamp: string; // ISO8601
  questions: TestResultQuestion[];
  metadata?: {
    grade_level?: string;
    preferred_language?: PreferredLanguage;
  };
}

export interface AnalysisConfig {
  weak_threshold: number; // e.g., 0.6
  borderline_threshold: number; // e.g., 0.8
  min_items_for_confidence: number; // e.g., 3
  // Practice distribution knobs
  weight_weak: number;
  weight_borderline: number;
  weight_strong: number;
  // Target share constraints across all weak topics
  weak_share_min: number; // e.g., 0.5
  weak_share_max: number; // e.g., 0.7
  strong_share_max?: number; // optional cap for strong topics overall
  // Output sizes
  video_count_weak_min: number;
  video_count_weak_max: number;
  video_count_borderline: number;
  video_count_strong: number;
  // Tone and style knobs
  tone?: 'neutral' | 'supportive' | 'strict' | 'motivational';
  student_message_style?: 'short' | 'friendly' | 'direct';
  teacher_notes_style?: 'brief' | 'detailed';
}

export type TopicClassification = 'weak' | 'borderline' | 'strong';

export interface TopicAnalysis {
  topic: string;
  total_items: number;
  percent_correct: number; // 0..100
  avg_score_pct: number; // 0..100
  classification: TopicClassification;
  confidence: number; // 0..1
}

export interface PracticeDistributionItem {
  topic: string;
  proportion: number; // 0..1
}

export interface HomeworkTask {
  topic: string;
  task_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time_minutes: number;
  learning_objective: string;
}

export interface VideoRecommendation {
  topic: string;
  title: string;
  query_terms: string[];
  recommended_length_min: number;
  difficulty: 'easy' | 'medium' | 'hard';
  source_priority: Array<'Khan Academy' | 'YouTube' | 'Coursera' | 'internal'>;
}

export interface AnalysisOutput {
  student_id: string;
  test_id: string;
  timestamp: string;
  overall_score_pct: number;
  topics: TopicAnalysis[];
  recommended_practice_distribution: PracticeDistributionItem[];
  homework: HomeworkTask[];
  video_recommendations: VideoRecommendation[];
  teacher_notes: string;
  student_message: string;
}

const DEFAULT_CONFIG: AnalysisConfig = {
  weak_threshold: 0.6,
  borderline_threshold: 0.8,
  min_items_for_confidence: 3,
  weight_weak: 3,
  weight_borderline: 1.5,
  weight_strong: 0.5,
  weak_share_min: 0.5,
  weak_share_max: 0.7,
  strong_share_max: 0.25,
  video_count_weak_min: 2,
  video_count_weak_max: 3,
  video_count_borderline: 1,
  video_count_strong: 0,
  tone: 'supportive',
  student_message_style: 'friendly',
  teacher_notes_style: 'brief',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function safeDivide(num: number, den: number): number {
  return den === 0 ? 0 : num / den;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function classifyTopic(percentCorrect: number, avgScorePct: number, cfg: AnalysisConfig): TopicClassification {
  const p = percentCorrect / 100;
  const a = avgScorePct / 100;
  if (p < cfg.weak_threshold || a < cfg.weak_threshold) return 'weak';
  if (p > cfg.borderline_threshold && a > cfg.borderline_threshold) return 'strong';
  return 'borderline';
}

function computeConfidence(totalItems: number, percentCorrect: number, cfg: AnalysisConfig): number {
  const sampleFactor = clamp(totalItems / cfg.min_items_for_confidence, 0, 1);
  const p = clamp(percentCorrect / 100, 0, 1);
  // Bernoulli variance normalized: max variance at p=0.5 equals 0.25
  const normalizedVariance = 4 * p * (1 - p); // 0..1
  const stability = 1 - normalizedVariance; // 0 at p=0.5, 1 at extremes
  // Combine with equal weights, then gently curve for extremes
  const raw = 0.5 * sampleFactor + 0.5 * stability;
  return clamp(round2(0.85 * raw + 0.15 * raw * raw), 0, 1);
}

function normalizeProportions(weights: Array<{ topic: string; weight: number }>): PracticeDistributionItem[] {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  if (total <= 0) return weights.map(w => ({ topic: w.topic, proportion: round2(1 / weights.length) }));
  const raw = weights.map(w => ({ topic: w.topic, proportion: w.weight / total }));
  // Fix floating errors to sum to exactly 1
  const sum = raw.reduce((s, r) => s + r.proportion, 0);
  const diff = 1 - sum;
  if (Math.abs(diff) > 1e-9) raw[0].proportion += diff;
  return raw.map(r => ({ topic: r.topic, proportion: round2(r.proportion) }));
}

function enforceWeakShareBounds(
  items: PracticeDistributionItem[],
  topicAnalyses: TopicAnalysis[],
  cfg: AnalysisConfig
): PracticeDistributionItem[] {
  const weakTopics = new Set(topicAnalyses.filter(t => t.classification === 'weak').map(t => t.topic));
  if (weakTopics.size === 0) return items;
  const wSum = items.filter(i => weakTopics.has(i.topic)).reduce((s, i) => s + i.proportion, 0);
  const clampTo = (target: number) => {
    const scaleUp = target / (wSum || 1);
    const updated = items.map(i => ({ ...i }));
    // Scale weak up, then downscale others to keep sum=1
    let added = 0;
    for (const it of updated) {
      if (weakTopics.has(it.topic)) {
        const newP = clamp(it.proportion * scaleUp, 0, 1);
        added += newP - it.proportion;
        it.proportion = newP;
      }
    }
    // Reduce non-weak proportionally
    const nonWeak = updated.filter(i => !weakTopics.has(i.topic));
    const nonWeakSum = nonWeak.reduce((s, i) => s + i.proportion, 0);
    if (nonWeakSum > 0) {
      for (const it of nonWeak) {
        const share = it.proportion / nonWeakSum;
        it.proportion = clamp(it.proportion - added * share, 0, 1);
      }
    }
    // Final normalize
    return normalizeProportions(updated.map(u => ({ topic: u.topic, weight: u.proportion })));
  };
  if (wSum < cfg.weak_share_min) return clampTo(cfg.weak_share_min);
  if (wSum > cfg.weak_share_max) return clampTo(cfg.weak_share_max);
  return items;
}

function maybeEnforceStrongCap(
  items: PracticeDistributionItem[],
  topicAnalyses: TopicAnalysis[],
  cfg: AnalysisConfig
): PracticeDistributionItem[] {
  if (cfg.strong_share_max === undefined) return items;
  const strongTopics = new Set(topicAnalyses.filter(t => t.classification === 'strong').map(t => t.topic));
  if (strongTopics.size === 0) return items;
  const sSum = items.filter(i => strongTopics.has(i.topic)).reduce((s, i) => s + i.proportion, 0);
  if (sSum <= cfg.strong_share_max) return items;
  const scaleDown = cfg.strong_share_max / sSum;
  const updated = items.map(i => ({ ...i }));
  let removed = 0;
  for (const it of updated) {
    if (strongTopics.has(it.topic)) {
      const newP = clamp(it.proportion * scaleDown, 0, 1);
      removed += it.proportion - newP;
      it.proportion = newP;
    }
  }
  // Distribute removed mass among non-strong proportionally to their current proportions
  const nonStrong = updated.filter(i => !strongTopics.has(i.topic));
  const nonStrongSum = nonStrong.reduce((s, i) => s + i.proportion, 0);
  if (nonStrongSum > 0) {
    for (const it of nonStrong) {
      const share = it.proportion / nonStrongSum;
      it.proportion = clamp(it.proportion + removed * share, 0, 1);
    }
  }
  return normalizeProportions(updated.map(u => ({ topic: u.topic, weight: u.proportion })));
}

function getLang(meta?: TestResultInput['metadata']): PreferredLanguage {
  const lang = (meta?.preferred_language || 'en').toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('kz') || lang.startsWith('kk')) return 'kz';
  return 'en';
}

type I18N = ReturnType<typeof buildI18n>;

function withTone(text: string, cfg: AnalysisConfig): string {
  if (cfg.tone === 'strict') return text.replace(/!+/g, '.');
  if (cfg.tone === 'motivational') return text + ' 🚀';
  return text;
}

function buildI18n(lang: PreferredLanguage, cfg?: AnalysisConfig) {
  if (lang === 'ru') {
    return {
      studentMsg: (weakTopics: string[]) => {
        const base = weakTopics.length
          ? `Хорошая работа! Дальше фокус: ${weakTopics.join(', ')}. Выполните задания и посмотрите короткие видео.`
          : `Отличный результат! Для закрепления — короткое повторение и вперёд к следующему модулю.`;
        if (!cfg) return base;
        if (cfg.student_message_style === 'short') return withTone(base.split('. ')[0] + '.', cfg);
        if (cfg.student_message_style === 'direct') return withTone(base.replace('Хорошая работа! ', ''), cfg);
        return withTone(base, cfg);
      },
      teacherNotes: (
        overall: number,
        weak: TopicAnalysis[],
        borderline: TopicAnalysis[],
        strong: TopicAnalysis[],
        grade?: string
      ) => {
        const parts: string[] = [];
        parts.push(`Итоговая успеваемость: ${Math.round(overall)}%.`);
        if (weak.length) parts.push(`Слабые темы: ${weak.map(t => t.topic).join(', ')} — требуется целевое переобучение.`);
        if (borderline.length) parts.push(`Пограничные темы: ${borderline.map(t => t.topic).join(', ')} — закрепить практикой.`);
        if (strong.length) parts.push(`Сильные темы: ${strong.map(t => t.topic).join(', ')} — рекомендовано лёгкое повторение.`);
        if (grade) parts.push(`Учитывайте уровень: ${grade}.`);
        const text = parts.slice(0, cfg?.teacher_notes_style === 'detailed' ? 4 : 3).join(' ');
        return cfg ? withTone(text, cfg) : text;
      },
      taskTitles: {
        conceptual: (topic: string) => `Понять концепцию: ${topic}`,
        guided: (topic: string) => `Пошаговая практика: ${topic}`,
        applied: (topic: string) => `Применение в задачах: ${topic}`,
        quickReview: (topic: string) => `Короткое повторение: ${topic}`,
        challenge: (topic: string) => `Доп. задача (опционально): ${topic}`,
      },
      taskDescriptions: {
        conceptual: (topic: string) => `Прочитайте краткое объяснение ключевых идей по теме «${topic}» с примерами и визуализациями.`,
        guided: (topic: string) => `Решите 5–8 тренировочных заданий с подсказками и разбором решений по теме «${topic}».`,
        applied: (topic: string) => `Решите 1–2 прикладные задачи, связывающие «${topic}» с жизненными ситуациями.`,
        quickReview: (topic: string) => `Быстро проверьте понимание «${topic}» с помощью короткого набора карточек/вопросов.`,
        challenge: (topic: string) => `Сложная задача для закрепления материала по теме «${topic}».`,
      },
      learningObjective: (topic: string, grade?: string) =>
        `Укрепить понимание темы «${topic}»${grade ? ` на уровне ${grade}` : ''} и повысить точность выполнения заданий.`,
      videoTitle: (topic: string) => `Быстрый урок: ${topic}`,
    } as const;
  }
  if (lang === 'kz') {
    return {
      studentMsg: (weakTopics: string[]) => {
        const base = weakTopics.length
          ? `Жақсы жұмыс! Келесі фокус: ${weakTopics.join(', ')}. Тапсырмаларды орындап, қысқа бейнелерді қараңыз.`
          : `Тамаша нәтиже! Қысқа қайталау жасап, келесі модульге өтіңіз.`;
        if (!cfg) return base;
        if (cfg.student_message_style === 'short') return withTone(base.split('. ')[0] + '.', cfg);
        if (cfg.student_message_style === 'direct') return withTone(base.replace('Жақсы жұмыс! ', ''), cfg);
        return withTone(base, cfg);
      },
      teacherNotes: (
        overall: number,
        weak: TopicAnalysis[],
        borderline: TopicAnalysis[],
        strong: TopicAnalysis[],
        grade?: string
      ) => {
        const parts: string[] = [];
        parts.push(`Жалпы үлгерім: ${Math.round(overall)}%.`);
        if (weak.length) parts.push(`Әлсіз тақырыптар: ${weak.map(t => t.topic).join(', ')} — мақсатты қайта оқыту қажет.`);
        if (borderline.length) parts.push(`Шекаралық тақырыптар: ${borderline.map(t => t.topic).join(', ')} — тәжірибемен бекіту.`);
        if (strong.length) parts.push(`Күшті тақырыптар: ${strong.map(t => t.topic).join(', ')} — жеңіл қайталау ұсынылады.`);
        if (grade) parts.push(`Деңгейін ескеріңіз: ${grade}.`);
        const text = parts.slice(0, cfg?.teacher_notes_style === 'detailed' ? 4 : 3).join(' ');
        return cfg ? withTone(text, cfg) : text;
      },
      taskTitles: {
        conceptual: (topic: string) => `Түсінікті қалыптастыру: ${topic}`,
        guided: (topic: string) => `Қадамдап жаттығу: ${topic}`,
        applied: (topic: string) => `Қолданбалы есептер: ${topic}`,
        quickReview: (topic: string) => `Қысқа қайталау: ${topic}`,
        challenge: (topic: string) => `Қосымша күрделі есеп: ${topic}`,
      },
      taskDescriptions: {
        conceptual: (topic: string) => `«${topic}» тақырыбының негізгі идеяларын мысалдармен оқыңыз.`,
        guided: (topic: string) => `«${topic}» бойынша 5–8 нұсқаулықпен қамтамасыз етілген жаттығуларды орындаңыз.`,
        applied: (topic: string) => `«${topic}» тақырыбын өмірлік жағдаяттармен байланыстыратын 1–2 есепті шешіңіз.`,
        quickReview: (topic: string) => `«${topic}» бойынша түсінікті жылдам тексеріңіз (қысқа карточкалар/сұрақтар).`,
        challenge: (topic: string) => `«${topic}» бойынша күрделі есеп.`,
      },
      learningObjective: (topic: string, grade?: string) =>
        `«${topic}» тақырыбын${grade ? ` ${grade} деңгейінде` : ''} түсінуді күшейту және дәлдікті арттыру.`,
      videoTitle: (topic: string) => `Жылдам сабақ: ${topic}`,
    } as const;
  }
  return {
    studentMsg: (weakTopics: string[]) =>
      weakTopics.length
        ? `Nice work! Next, focus: ${weakTopics.join(', ')}. Complete tasks and watch short videos.`
        : `Great result! Do a quick review and move on.`,
    teacherNotes: (
      overall: number,
      weak: TopicAnalysis[],
      borderline: TopicAnalysis[],
      strong: TopicAnalysis[],
      grade?: string
    ) => {
      const parts: string[] = [];
      parts.push(`Overall performance: ${Math.round(overall)}%.`);
      if (weak.length) parts.push(`Weak topics: ${weak.map(t => t.topic).join(', ')} — targeted re-teaching recommended.`);
      if (borderline.length) parts.push(`Borderline topics: ${borderline.map(t => t.topic).join(', ')} — reinforce with practice.`);
      if (strong.length) parts.push(`Strong topics: ${strong.map(t => t.topic).join(', ')} — light review suggested.`);
      if (grade) parts.push(`Consider grade level: ${grade}.`);
      const text = parts.slice(0, cfg?.teacher_notes_style === 'detailed' ? 4 : 3).join(' ');
      return cfg ? withTone(text, cfg) : text;
    },
    taskTitles: {
      conceptual: (topic: string) => `Concept focus: ${topic}`,
      guided: (topic: string) => `Guided practice: ${topic}`,
      applied: (topic: string) => `Applied problems: ${topic}`,
      quickReview: (topic: string) => `Quick review: ${topic}`,
      challenge: (topic: string) => `Optional challenge: ${topic}`,
    },
    taskDescriptions: {
      conceptual: (topic: string) => `Read a concise explanation of key ideas for “${topic}” with examples and visuals.`,
      guided: (topic: string) => `Complete 5–8 scaffolded exercises with hints and step-by-step solutions on “${topic}”.`,
      applied: (topic: string) => `Solve 1–2 applied problems connecting “${topic}” to real-world contexts.`,
      quickReview: (topic: string) => `Quickly check understanding of “${topic}” using a short deck of flashcards/questions.`,
      challenge: (topic: string) => `A harder problem to consolidate mastery of “${topic}”.`,
    },
    learningObjective: (topic: string, grade?: string) =>
      `Strengthen understanding of “${topic}”${grade ? ` at ${grade} level` : ''} and improve accuracy on tasks.`,
    videoTitle: (topic: string) => `Quick lesson: ${topic}`,
  } as const;
}

function makeHomeworkForTopic(
  t: TopicAnalysis,
  grade: string | undefined,
  lang: PreferredLanguage,
  cfg: AnalysisConfig
): HomeworkTask[] {
  const i18n = buildI18n(lang, cfg);
  const tasks: HomeworkTask[] = [];
  const lowConfidence = t.confidence < 0.5;
  if (t.classification === 'weak') {
    const baseTime = lowConfidence ? 10 : 15;
    // Conceptual
    tasks.push({
      topic: t.topic,
      task_id: generateId('HW'),
      title: i18n.taskTitles.conceptual(t.topic),
      description: i18n.taskDescriptions.conceptual(t.topic),
      difficulty: 'easy',
      estimated_time_minutes: baseTime,
      learning_objective: i18n.learningObjective(t.topic, grade),
    });
    // Guided practice
    tasks.push({
      topic: t.topic,
      task_id: generateId('HW'),
      title: i18n.taskTitles.guided(t.topic),
      description: i18n.taskDescriptions.guided(t.topic),
      difficulty: 'medium',
      estimated_time_minutes: baseTime + 5,
      learning_objective: i18n.learningObjective(t.topic, grade),
    });
    if (!lowConfidence) {
      // Applied problem only when confidence is reasonable
      tasks.push({
        topic: t.topic,
        task_id: generateId('HW'),
        title: i18n.taskTitles.applied(t.topic),
        description: i18n.taskDescriptions.applied(t.topic),
        difficulty: 'medium',
        estimated_time_minutes: baseTime + 10,
        learning_objective: i18n.learningObjective(t.topic, grade),
      });
    }
    return tasks;
  }
  if (t.classification === 'borderline') {
    tasks.push({
      topic: t.topic,
      task_id: generateId('HW'),
      title: i18n.taskTitles.guided(t.topic),
      description: i18n.taskDescriptions.guided(t.topic),
      difficulty: 'medium',
      estimated_time_minutes: 12,
      learning_objective: i18n.learningObjective(t.topic, grade),
    });
    if (t.confidence >= 0.5) {
      tasks.push({
        topic: t.topic,
        task_id: generateId('HW'),
        title: i18n.taskTitles.applied(t.topic),
        description: i18n.taskDescriptions.applied(t.topic),
        difficulty: 'medium',
        estimated_time_minutes: 12,
        learning_objective: i18n.learningObjective(t.topic, grade),
      });
    }
    return tasks;
  }
  // strong
  if (t.confidence >= 0.5) {
    tasks.push({
      topic: t.topic,
      task_id: generateId('HW'),
      title: i18n.taskTitles.quickReview(t.topic),
      description: i18n.taskDescriptions.quickReview(t.topic),
      difficulty: 'easy',
      estimated_time_minutes: 5,
      learning_objective: i18n.learningObjective(t.topic, grade),
    });
  }
  return tasks;
}

function makeVideosForTopic(
  t: TopicAnalysis,
  grade: string | undefined,
  lang: PreferredLanguage,
  cfg: AnalysisConfig
): VideoRecommendation[] {
  const sources: Array<'Khan Academy' | 'YouTube' | 'Coursera' | 'internal'> = ['Khan Academy', 'YouTube', 'internal', 'Coursera'];
  const baseQueryTerms = [t.topic];
  if (grade) baseQueryTerms.push(grade);
  if (lang !== 'en') baseQueryTerms.push(lang);
  const i18n = buildI18n(lang);
  const list: VideoRecommendation[] = [];
  const lowConfidence = t.confidence < 0.5;

  if (t.classification === 'weak') {
    const count = lowConfidence ? cfg.video_count_weak_min : cfg.video_count_weak_max;
    for (let i = 0; i < count; i++) {
      list.push({
        topic: t.topic,
        title: i18n.videoTitle(t.topic),
        query_terms: [...baseQueryTerms, i === 0 ? 'basics' : 'practice'],
        recommended_length_min: lowConfidence ? 5 + i * 2 : 7 + i * 2,
        difficulty: i === 0 ? 'easy' : 'medium',
        source_priority: sources,
      });
    }
    return list;
  }

  if (t.classification === 'borderline') {
    if (cfg.video_count_borderline > 0) {
      list.push({
        topic: t.topic,
        title: i18n.videoTitle(t.topic),
        query_terms: [...baseQueryTerms, 'review'],
        recommended_length_min: 6,
        difficulty: 'medium',
        source_priority: sources,
      });
    }
    return list;
  }

  // strong
  if (cfg.video_count_strong > 0) {
    list.push({
      topic: t.topic,
      title: i18n.videoTitle(t.topic),
      query_terms: [...baseQueryTerms, 'quick review'],
      recommended_length_min: 5,
      difficulty: 'easy',
      source_priority: sources,
    });
  }
  return list;
}

function buildPracticeDistribution(topicAnalyses: TopicAnalysis[], cfg: AnalysisConfig): PracticeDistributionItem[] {
  if (!topicAnalyses.length) return [];
  // If only one topic, allocate all to it
  if (topicAnalyses.length === 1) return [{ topic: topicAnalyses[0].topic, proportion: 1 }];

  // Base weights by classification, modulated by confidence
  const rawWeights = topicAnalyses.map(t => {
    const base = t.classification === 'weak' ? cfg.weight_weak : t.classification === 'borderline' ? cfg.weight_borderline : cfg.weight_strong;
    const mod = 0.5 + 0.5 * t.confidence; // 0.5..1
    return { topic: t.topic, weight: base * mod };
  });

  let dist = normalizeProportions(rawWeights);
  dist = enforceWeakShareBounds(dist, topicAnalyses, cfg);
  dist = maybeEnforceStrongCap(dist, topicAnalyses, cfg);
  return dist;
}

/**
 * Analyze a single student's test results and produce structured, localized recommendations.
 */
export function analyzeTestResults(
  test_result_json: TestResultInput,
  config?: Partial<AnalysisConfig>
): AnalysisOutput {
  const cfg: AnalysisConfig = { ...DEFAULT_CONFIG, ...(config || {}) };
  const lang = getLang(test_result_json.metadata);
  const grade = test_result_json.metadata?.grade_level;

  const byTopic = new Map<string, TestResultQuestion[]>();
  for (const q of test_result_json.questions || []) {
    if (!q || !q.topic) continue;
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }

  const allMax = test_result_json.questions.reduce((s, q) => s + (q.max_score || 0), 0);
  const allScore = test_result_json.questions.reduce((s, q) => s + (q.score || 0), 0);
  const overall_score_pct = round2(safeDivide(allScore, allMax) * 100);

  const topicAnalyses: TopicAnalysis[] = [];
  for (const [topic, list] of byTopic.entries()) {
    const total_items = list.length;
    const correct_count = list.reduce((s, q) => s + (q.correct ? 1 : 0), 0);
    const percent_correct = round2(safeDivide(correct_count, total_items) * 100);
    const total_score = list.reduce((s, q) => s + (q.score || 0), 0);
    const max_possible = list.reduce((s, q) => s + (q.max_score || 0), 0);
    const avg_score_pct = round2(safeDivide(total_score, max_possible) * 100);
    // Average time (not part of output schema; used for internal notes if needed)
    const timeVals = list.map(q => q.time_spent_seconds).filter(v => typeof v === 'number') as number[];
    const avg_time = timeVals.length ? timeVals.reduce((s, v) => s + v, 0) / timeVals.length : null;
    const classification = classifyTopic(percent_correct, avg_score_pct, cfg);
    let confidence = computeConfidence(total_items, percent_correct, cfg);
    if (total_items < cfg.min_items_for_confidence) confidence = Math.min(confidence, 0.49);

    topicAnalyses.push({
      topic,
      total_items,
      percent_correct,
      avg_score_pct,
      classification,
      confidence,
    });
  }

  // Sort topics: weakest first for readability
  topicAnalyses.sort((a, b) => {
    const order: Record<TopicClassification, number> = { weak: 0, borderline: 1, strong: 2 };
    if (order[a.classification] !== order[b.classification]) return order[a.classification] - order[b.classification];
    if (a.confidence !== b.confidence) return a.confidence - b.confidence;
    return a.topic.localeCompare(b.topic);
  });

  const distribution = buildPracticeDistribution(topicAnalyses, cfg);

  const homework: HomeworkTask[] = [];
  const videos: VideoRecommendation[] = [];
  for (const t of topicAnalyses) {
    homework.push(...makeHomeworkForTopic(t, grade, lang, cfg));
    videos.push(...makeVideosForTopic(t, grade, lang, cfg));
  }

  // Localized messages
  const i18n = buildI18n(lang);
  const weak = topicAnalyses.filter(t => t.classification === 'weak');
  const borderline = topicAnalyses.filter(t => t.classification === 'borderline');
  const strong = topicAnalyses.filter(t => t.classification === 'strong');
  const teacher_notes = i18n.teacherNotes(overall_score_pct, weak, borderline, strong, grade);
  const student_message = i18n.studentMsg(weak.map(t => t.topic));

  return {
    student_id: test_result_json.student_id,
    test_id: test_result_json.test_id,
    timestamp: test_result_json.timestamp,
    overall_score_pct,
    topics: topicAnalyses,
    recommended_practice_distribution: distribution,
    homework,
    video_recommendations: videos,
    teacher_notes,
    student_message,
  };
}

// Demo helpers for quick manual checks
export function demoInputMinimal(): TestResultInput {
  return {
    student_id: 'S1',
    test_id: 'T1',
    timestamp: new Date().toISOString(),
    questions: [
      { question_id: 'q1', topic: 'fractions', max_score: 1, score: 0, correct: false },
      { question_id: 'q2', topic: 'fractions', max_score: 1, score: 1, correct: true },
      { question_id: 'q3', topic: 'decimals', max_score: 1, score: 0, correct: false },
    ],
    metadata: { grade_level: 'Grade 6', preferred_language: 'en' },
  };
}

export function demoRun(config?: Partial<AnalysisConfig>): AnalysisOutput {
  return analyzeTestResults(demoInputMinimal(), config);
}


