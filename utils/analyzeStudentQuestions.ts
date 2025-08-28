/*
 High-level analyzer for student questions (RU/KZ supported) that returns
 per-question structured records and a global summary so downstream systems
 can detect weak topics.

 Input: array of question strings
 Output: { records: AnalyzedRecord[]; summary: AnalysisSummary }

 This module is self-contained and uses heuristic keyword/rule matching to
 determine subject, domain, topic, tags, history centuries and event tags.
*/

export type SupportedSubject = 'Mathematics' | 'History of Kazakhstan' | 'Other';

export interface AnalyzedRecord {
  id: number;
  question_text: string;
  subject: SupportedSubject;
  domain: string; // Mathematics domains: Algebra, Calculus, Geometry, Trigonometry, Number Theory; History: History of Kazakhstan; Other: General
  topic: string;
  subtopic?: string;
  tags: string[];
  history_century: number | null;
  history_event_tags: string[];
  multi_topic: boolean;
  difficulty: number; // 1..5
  primary_topic_confidence: number; // 0.0..1.0
  recommended_action: 'review_concept' | 'practice_problems' | 'provide_explanation' | 'further_clarification_needed';
  notes?: string;
}

export interface AnalysisSummary {
  total_questions: number;
  counts_by_subject: Record<string, number>;
  counts_by_topic: Record<string, number>;
  weakest_topics: Array<{ topic: string; count: number; avg_difficulty: number; reason: string }>;
  percent_multi_topic: number;
  recommendations: string[];
  visualization_ready: { labels: string[]; values: number[] };
}

export interface AnalyzerOutput {
  records: AnalyzedRecord[];
  summary: AnalysisSummary;
}

// Utility: normalize whitespace and lowercase for matching
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
const lower = (s: string) => normalize(s).toLowerCase();

// History event shortcuts → centuries (approx.)
const HISTORY_EVENT_CENTURIES: Array<{ match: RegExp; century: number | null; tags: string[]; topic: string; note?: string }> = [
  { match: /монгол(ьск|дық|дықтар|дардың)|чингисхан|genghis|mongol/i, century: 13, tags: ['mongol-invasion', '13th-century'], topic: 'Mongol invasion' },
  { match: /ақ орда|белая орда|white horde/i, century: null, tags: ['white-horde'], topic: 'White Horde', note: 'century_range: 13-15' },
  { match: /ноғай(ская| орда)|mangyt|мангыт/i, century: null, tags: ['nogai-horde'], topic: 'Nogai Horde', note: 'century_range: 14-16' },
  { match: /аңырақай|аныракай|anrakai|anry?akai/i, century: 18, tags: ['anrakai-battle', 'kazakh-dzungar-wars'], topic: 'Anyrakai battle' },
  { match: /джунгар|жоңғар/i, century: 18, tags: ['kazakh-dzungar-wars'], topic: 'Kazakh–Dzungar wars', note: 'century_range: 17-18' },
  { match: /алаш/i, century: 20, tags: ['alash-movement'], topic: 'Alash movement' },
  { match: /конституци(я|ясы) (рк|республики казахстан)|1995/i, century: 20, tags: ['constitution-1995'], topic: 'Constitution of Kazakhstan (1995)' },
  { match: /перенос столицы|астан(а|ы)|нур-?султан|ақмола/i, century: 20, tags: ['capital-move'], topic: 'Capital moved to Astana' },
  { match: /голод|ашаршылық|жұт|zhut|1931|1933/i, century: 20, tags: ['great-famine-1931-33'], topic: 'Great Famine (1931–1933)' },
  { match: /десталинизац|de-?stalin|xx съезд кпсс|кпсс xx/i, century: 20, tags: ['de-stalinization'], topic: 'De-Stalinization (XX CPSU Congress)' },
  { match: /оренбург-ташкент/i, century: 20, tags: ['industrialization', 'infrastructure'], topic: 'Orenburg–Tashkent Railway' },
  { match: /абулхаир|әбілқайыр/i, century: 15, tags: ['abulkhair-khanate'], topic: 'Khanate of Abulkhair' },
];

// Math keyword buckets → domain/topic
const MATH_RULES: Array<{
  test: (s: string) => boolean;
  domain: 'Algebra' | 'Calculus' | 'Geometry' | 'Trigonometry' | 'Number Theory';
  topic: string;
  subtopic?: string;
  tags: string[];
  difficulty: number;
}> = [
  { test: s => /(решит|решите|solve).*(x|y|\d+x)|\bуравн(ение|я)\b/i.test(s) && !/квадрат/i.test(s), domain: 'Algebra', topic: 'Linear equations', subtopic: 'one-variable', tags: ['algebra', 'linear-equations'], difficulty: 2 },
  { test: s => /квадратн(ое|ые) уравн|x\^2|x²|корн(и|я)|дискриминант/i.test(s), domain: 'Algebra', topic: 'Quadratic equations', subtopic: undefined, tags: ['quadratics', 'polynomial', 'algebra'], difficulty: 2 },
  { test: s => /логарифм|log\b|log_|lg\b|ln\b/i.test(s), domain: 'Algebra', topic: 'Logarithms', subtopic: undefined, tags: ['logarithms', 'change-of-base', 'algebra'], difficulty: 2 },
  { test: s => /степен(и|ь)|показател|2\^|\^\d+/i.test(s), domain: 'Algebra', topic: 'Exponents and powers', subtopic: 'properties of exponents', tags: ['exponents', 'powers', 'algebra'], difficulty: 2 },
  { test: s => /процент|%|скидк|налог|комисси/i.test(s), domain: 'Algebra', topic: 'Percentages', subtopic: 'applications', tags: ['percentages', 'financial-math', 'algebra'], difficulty: 2 },
  { test: s => /вероятност|вероятн|probab|шар(ов|ы)|урн|комбинатор|выбер(ите|ите)/i.test(s), domain: 'Algebra', topic: 'Probability and combinatorics', subtopic: undefined, tags: ['probability', 'combinatorics', 'algebra'], difficulty: 3 },
  { test: s => /средн(ее|яя) арифм|медиан|мода|размах/i.test(s), domain: 'Algebra', topic: 'Descriptive statistics', subtopic: undefined, tags: ['mean', 'median', 'mode', 'statistics'], difficulty: 2 },
  { test: s => /последовательност|арифметическ.*прогресс/i.test(s), domain: 'Algebra', topic: 'Sequences and series', subtopic: 'arithmetic progression', tags: ['sequences', 'algebra'], difficulty: 3 },
  { test: s => /периметр|площад(ь|и)|поверхн|куб|прямоугольник|треугольник|радиус|диагонал/i.test(s), domain: 'Geometry', topic: 'Plane and solid geometry', subtopic: undefined, tags: ['geometry', 'perimeter', 'area', 'surface-area'], difficulty: 2 },
  { test: s => /sin|cos|tg|ctg|синус|косинус|тангенс|угол/i.test(s), domain: 'Trigonometry', topic: 'Trigonometric values and identities', subtopic: undefined, tags: ['trigonometry', 'unit-circle'], difficulty: 3 },
  { test: s => /производн|derivat|интеграл|предел|limit\b/i.test(s), domain: 'Calculus', topic: 'Derivatives and integrals', subtopic: undefined, tags: ['calculus', 'derivatives', 'integrals'], difficulty: 4 },
  { test: s => /прост(ое|ые) числ|делимост|НОК|НОД|gcd|lcm|prime/i.test(s), domain: 'Number Theory', topic: 'Primes and divisibility', subtopic: undefined, tags: ['number-theory', 'divisibility', 'primes'], difficulty: 3 },
];

const isHistoryKZ = (s: string): boolean => {
  // Look for cues that it is about Kazakhstan history
  return /казахстан|қазақ|қазақстан|ханств|орда|жуз|джунгар|жоңғар|әлем|алаш|абылай|кенесары|тауке|астан|нур-?султан|акмол/i.test(s)
    || HISTORY_EVENT_CENTURIES.some(r => r.match.test(s));
};

const detectHistory = (text: string) => {
  const s = text;
  // Direct matches
  for (const rule of HISTORY_EVENT_CENTURIES) {
    if (rule.match.test(s)) {
      return {
        domain: 'History of Kazakhstan',
        topic: rule.topic,
        tags: rule.tags,
        century: rule.century,
        note: rule.note,
        confidence: 0.85,
      } as const;
    }
  }

  // Try to infer century from explicit years or roman numerals (e.g., XIII, XVIII–XIX)
  let inferredCentury: number | null = null;
  let note: string | undefined;

  // Arabic years → century
  const yearMatch = s.match(/\b(\d{3,4})\b/g);
  if (yearMatch && yearMatch.length) {
    const years = yearMatch.map(y => parseInt(y, 10)).filter(y => y >= 1 && y <= 2100);
    if (years.length) {
      const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
      inferredCentury = Math.ceil(avgYear / 100);
    }
  }
  // Roman numerals centuries (RU/KZ style like XIII–XIV вв.)
  const roman = s.match(/\b([ivxlcdm]+)(?:\s*[–-]\s*([ivxlcdm]+))?\s*вв?\.?/i);
  if (roman) {
    const toNum = (r: string) => {
      const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
      return r
        .toLowerCase()
        .split('')
        .map(ch => map[ch] || 0)
        .reduce((acc, cur, idx, arr) => (idx < arr.length - 1 && cur < arr[idx + 1] ? acc - cur : acc + cur), 0);
    };
    const a = toNum(roman[1]);
    const b = roman[2] ? toNum(roman[2]) : undefined;
    if (a && !b) inferredCentury = a;
    if (a && b) {
      inferredCentury = null;
      note = `century_range: ${a}-${b}`;
    }
  }

  return {
    domain: 'History of Kazakhstan',
    topic: 'Historical facts and chronology',
    tags: ['kazakhstan-history'],
    century: inferredCentury,
    note,
    confidence: 0.65,
  } as const;
};

const detectMath = (text: string) => {
  const s = text;
  for (const rule of MATH_RULES) {
    if (rule.test(s)) {
      return {
        domain: rule.domain,
        topic: rule.topic,
        subtopic: rule.subtopic,
        tags: rule.tags,
        difficulty: rule.difficulty,
        confidence: 0.85,
      } as const;
    }
  }
  // Default math catch-all
  return {
    domain: 'Algebra' as const,
    topic: 'General problem solving',
    subtopic: undefined,
    tags: ['algebra'],
    difficulty: 2,
    confidence: 0.6,
  } as const;
};

const estimateDifficultyFromText = (text: string, base: number): number => {
  const s = lower(text);
  let d = base;
  if (/производн|integral|интеграл|предел|limit|trig|тригоном/i.test(s)) d = Math.max(d, 3);
  if (/доказат|prove|теорем|оптимизац/i.test(s)) d = Math.max(d, 4);
  if (/многошаг|multi-?step|слож/i.test(s)) d = Math.min(5, d + 1);
  if (/найдите|вычислите|решите/i.test(s)) d = Math.max(1, d);
  return Math.min(5, Math.max(1, d));
};

const chooseRecommendation = (subject: SupportedSubject, confidence: number, difficulty: number): AnalyzedRecord['recommended_action'] => {
  if (confidence < 0.6) return 'further_clarification_needed';
  if (subject === 'Mathematics') return difficulty >= 3 ? 'practice_problems' : 'review_concept';
  if (subject === 'History of Kazakhstan') return 'provide_explanation';
  return 'provide_explanation';
};

export function analyzeStudentQuestions(questions: string[]): AnalyzerOutput {
  const records: AnalyzedRecord[] = [];

  questions.forEach((q, idx) => {
    const original = q;
    const lq = lower(q);

    let subject: SupportedSubject;
    let domain = 'General';
    let topic = 'General';
    let subtopic: string | undefined;
    let tags: string[] = [];
    let history_century: number | null = null;
    let history_event_tags: string[] = [];
    let difficulty = 2;
    let confidence = 0.7;
    let notes: string | undefined;

    const hasMathCue = /(\b|\s)(x|y|\d+x|log|sin|cos|tg|корн|квадрат|уравн|процент|вероятност|комбинатор|периметр|площад|куб|угол|производн|интеграл)(\b|\s)/i.test(q) || /[=+\-*/^]/.test(q);
    const hasHistoryCue = isHistoryKZ(q) || /(век|ғасыр|вв\.|гг\.|импер|хан|орда)/i.test(q);

    if (hasHistoryCue && (!hasMathCue || /казахстан/i.test(q))) {
      subject = 'History of Kazakhstan';
      const h = detectHistory(q);
      domain = h.domain;
      topic = h.topic;
      tags = h.tags.map(t => t.toLowerCase());
      history_century = h.century;
      if (h.note) notes = h.note;
      confidence = h.confidence;
      history_event_tags = [...tags];
      // Choose medium difficulty by default for factual/history map questions
      difficulty = 3;
    } else if (hasMathCue) {
      subject = 'Mathematics';
      const m = detectMath(q);
      domain = m.domain;
      topic = m.topic;
      subtopic = m.subtopic;
      tags = m.tags.map(t => t.toLowerCase());
      difficulty = estimateDifficultyFromText(q, m.difficulty);
      confidence = m.confidence;
    } else {
      subject = 'Other';
      domain = 'General';
      topic = 'General knowledge';
      tags = ['general'];
      difficulty = 2;
      confidence = 0.55;
      notes = 'Unclear subject; needs clarification';
    }

    // Multi-topic detection (very basic): several distinct math domains or mixed cues
    const multi_topic = /(и|,|;).*(и|,|;)/i.test(q) && /(логарифм|квадратн|производн|геометр|вероятност)/i.test(q);

    const recommended_action = chooseRecommendation(subject, confidence, difficulty);

    records.push({
      id: idx + 1,
      question_text: original,
      subject,
      domain,
      topic,
      subtopic,
      tags,
      history_century,
      history_event_tags,
      multi_topic,
      difficulty,
      primary_topic_confidence: +confidence.toFixed(2),
      recommended_action,
      notes,
    });
  });

  // Summary aggregation
  const total_questions = records.length;
  const counts_by_subject: Record<string, number> = {};
  const counts_by_topic: Record<string, number> = {};
  const topicDifficulty: Record<string, { sum: number; count: number }> = {};
  let multiCount = 0;
  for (const r of records) {
    counts_by_subject[r.subject] = (counts_by_subject[r.subject] || 0) + 1;
    counts_by_topic[r.topic] = (counts_by_topic[r.topic] || 0) + 1;
    topicDifficulty[r.topic] = topicDifficulty[r.topic] || { sum: 0, count: 0 };
    topicDifficulty[r.topic].sum += r.difficulty;
    topicDifficulty[r.topic].count += 1;
    if (r.multi_topic) multiCount += 1;
  }

  // Compute weakest topics: higher avg difficulty and higher count → higher priority
  const weakest_topics = Object.keys(topicDifficulty)
    .map(t => {
      const { sum, count } = topicDifficulty[t];
      const avg = sum / count;
      const reason = `avg_difficulty ${avg.toFixed(2)} · count ${count}`;
      return { topic: t, count, avg_difficulty: +avg.toFixed(2), reason };
    })
    .sort((a, b) => (b.avg_difficulty - a.avg_difficulty) || (b.count - a.count))
    .slice(0, 5);

  const percent_multi_topic = total_questions ? Math.round((multiCount / total_questions) * 100) : 0;

  // Recommendations: prioritize top-3 weakest topics
  const recommendations = weakest_topics.slice(0, 3).map(w => {
    if (/logarithm|логарифм/i.test(w.topic)) return 'assign 20 practice problems on logarithms';
    if (/Quadratic|квадрат/i.test(w.topic)) return 'review quadratic equations and assign 15 factoring tasks';
    if (/Probability|вероят/i.test(w.topic)) return '10–15 practice problems on basic probability and combinatorics';
    if (/Derivatives|производн/i.test(w.topic)) return 'provide step-by-step explanation of derivative basics with 10 drills';
    if (/Mongol|монгол/i.test(w.topic)) return 'review Mongol invasion (13th c.) with a timeline and key figures';
    return `reinforce topic: ${w.topic} with targeted practice`;
  });

  const labels = Object.keys(counts_by_topic);
  const values = labels.map(l => counts_by_topic[l]);

  const summary: AnalysisSummary = {
    total_questions,
    counts_by_subject,
    counts_by_topic,
    weakest_topics,
    percent_multi_topic,
    recommendations,
    visualization_ready: { labels, values },
  };

  return { records, summary };
}

// Convenience: analyze from full Question objects by picking the text field
export function analyzeQuestionObjects<T extends { question?: string }>(items: T[]): AnalyzerOutput {
  const texts = items.map(i => i.question || '').filter(Boolean);
  return analyzeStudentQuestions(texts);
}

// ----- Diagnostic report (RU) for weak/strong topics -----
interface RuTopicPerfInput {
  topic: string;
  percent?: number | null;
  note?: string;
  sample_size?: number;
  classification?: 'weak' | 'borderline' | 'strong';
}

function classifyRu(percent: number | undefined | null, fallback?: 'weak'|'borderline'|'strong') {
  if (typeof percent === 'number') {
    if (percent < 60) return { rec: 'Требуется полное повторение', band: 'weak' as const };
    if (percent <= 80) return { rec: 'Требуется небольшое повторение', band: 'borderline' as const };
    return { rec: 'Поддерживать', band: 'strong' as const };
  }
  // Use fallback classification to infer percent estimate
  if (fallback === 'weak') return { rec: 'Требуется полное повторение', band: 'weak' as const };
  if (fallback === 'strong') return { rec: 'Поддерживать', band: 'strong' as const };
  return { rec: 'Требуется небольшое повторение', band: 'borderline' as const };
}

function inferPercent(percent?: number|null, fallback?: 'weak'|'borderline'|'strong'): { value: string; numeric?: number } {
  if (typeof percent === 'number') {
    return { value: `${Math.round(percent)}%`, numeric: Math.round(percent) };
  }
  // Estimates from qualitative label
  if (fallback === 'weak') return { value: '≈50% (оценка)', numeric: 50 };
  if (fallback === 'strong') return { value: '≈90% (оценка)', numeric: 90 };
  return { value: '≈70% (оценка)', numeric: 70 };
}

function actionsForBand(topic: string, band: 'weak'|'borderline'|'strong'): string[] {
  if (band === 'weak') {
    return [
      'Повторить ключевые определения и формулы',
      'Решить 10–15 типовых задач с самопроверкой',
      'Разобрать 3 типичные ошибки по теме'
    ];
  }
  if (band === 'borderline') {
    return [
      'Сделать краткий конспект опорных идей',
      'Решить 8–10 задач средней сложности',
      'Провести мини‑тест (10 задач) с разбором'
    ];
  }
  return [
    '1–2 набора задач повышенной сложности',
    'Мини‑тест на скорость (10 задач, 10 минут)',
    'Короткое повторение формул'
  ];
}

function timeForBand(band: 'weak'|'borderline'|'strong'): string {
  if (band === 'weak') return '3–4 часа';
  if (band === 'borderline') return '1–2 часа';
  return '1–2 часа';
}

export function generateDiagnosticReportRu(topics: RuTopicPerfInput[], opts?: { maxTopics?: number }): string {
  const maxTopics = Math.max(1, Math.min(10, opts?.maxTopics ?? 10));
  const items = topics.slice(0, maxTopics);
  const weakLines: string[] = [];
  const strongLines: string[] = [];

  for (const t of items) {
    const cls = classifyRu(t.percent ?? null, t.classification);
    const inferred = inferPercent(t.percent ?? null, t.classification);
    const band = cls.band;
    const rationale = t.note
      ? t.note
      : band === 'weak'
        ? 'заметны пробелы в базовых шагах/правилах'
        : band === 'borderline'
          ? 'нужна тренировка для стабильности и скорости'
          : 'уровень хороший; поддерживать навыки периодической практикой';
    const acts = actionsForBand(t.topic, band).slice(0, 3);
    const time = timeForBand(band);
    const line = `- ${t.topic} — ${inferred.value} — ${cls.rec}. Кратко: ${rationale}. Рекомендации: 1) ${acts[0]}; 2) ${acts[1]}; 3) ${acts[2]}. Время: ${time}.`;
    if (band === 'weak' || band === 'borderline') weakLines.push(line); else strongLines.push(line);
  }

  const sections: string[] = [];
  if (weakLines.length) {
    sections.push('Слабые темы:');
    sections.push(...weakLines);
    sections.push('');
  }
  if (strongLines.length) {
    sections.push('Сильные темы:');
    sections.push(...strongLines);
    sections.push('');
  }

  // One-line plan (<=20 words)
  const plan = 'План: усилить слабые темы ежедневно 45–60 минут; раз в 3 дня — мини‑тест и разбор.';
  sections.push(plan);
  return sections.join('\n');
}

// Adapter from analyzeTestResults-style object
export function generateDiagnosticReportRuFromAnalyze(analysis: any): string {
  const topics: RuTopicPerfInput[] = Array.isArray(analysis?.topics)
    ? analysis.topics.map((t: any) => ({
        topic: String(t.topic || 'Тема'),
        percent: typeof t.percent_correct === 'number' ? t.percent_correct : (typeof t.avg_score_pct === 'number' ? t.avg_score_pct : undefined),
        note: undefined,
        sample_size: t.total_items,
        classification: t.classification,
      }))
    : [];
  return generateDiagnosticReportRu(topics, { maxTopics: 10 });
}

// ----- Kazakh (KZ) diagnostic -----
interface KzTopicPerfInput {
  topic: string;
  percent?: number | null;
  note?: string;
  sample_size?: number;
  classification?: 'weak' | 'borderline' | 'strong';
}

function classifyKz(percent: number | undefined | null, fallback?: 'weak'|'borderline'|'strong') {
  if (typeof percent === 'number') {
    if (percent < 60) return { rec: 'Толық қайталау қажет', band: 'weak' as const };
    if (percent <= 80) return { rec: 'Қысқа қайталау қажет', band: 'borderline' as const };
    return { rec: 'Қолдау', band: 'strong' as const };
  }
  if (fallback === 'weak') return { rec: 'Толық қайталау қажет', band: 'weak' as const };
  if (fallback === 'strong') return { rec: 'Қолдау', band: 'strong' as const };
  return { rec: 'Қысқа қайталау қажет', band: 'borderline' as const };
}

function inferPercentKz(percent?: number|null, fallback?: 'weak'|'borderline'|'strong'): { value: string; numeric?: number } {
  if (typeof percent === 'number') return { value: `${Math.round(percent)}%`, numeric: Math.round(percent) };
  if (fallback === 'weak') return { value: '≈50% (бағалау)', numeric: 50 };
  if (fallback === 'strong') return { value: '≈90% (бағалау)', numeric: 90 };
  return { value: '≈70% (бағалау)', numeric: 70 };
}

function actionsForBandKz(topic: string, band: 'weak'|'borderline'|'strong'): string[] {
  if (band === 'weak') {
    return [
      'Негізгі анықтамалар мен формулаларды қайталау',
      '10–15 типтік есепті шешіп, өзін‑өзі тексеру',
      '3 жиі қателерді талдау'
    ];
  }
  if (band === 'borderline') {
    return [
      'Қысқа конспект жасау',
      '8–10 орташа есеп шығару',
      'Мини‑тест (10 есеп) және талдау'
    ];
  }
  return [
    '1–2 күрделі есептер жинағы',
    'Жылдамдыққа мини‑тест (10 есеп, 10 минут)',
    'Формулаларды қысқа қайталау'
  ];
}

function timeForBandKz(band: 'weak'|'borderline'|'strong'): string {
  if (band === 'weak') return '3–4 сағат';
  if (band === 'borderline') return '1–2 сағат';
  return '1–2 сағат';
}

export function generateDiagnosticReportKz(topics: KzTopicPerfInput[], opts?: { maxTopics?: number }): string {
  const maxTopics = Math.max(1, Math.min(10, opts?.maxTopics ?? 10));
  const items = topics.slice(0, maxTopics);
  const weakLines: string[] = [];
  const strongLines: string[] = [];

  for (const t of items) {
    const cls = classifyKz(t.percent ?? null, t.classification);
    const inferred = inferPercentKz(t.percent ?? null, t.classification);
    const band = cls.band;
    const rationale = t.note
      ? t.note
      : band === 'weak'
        ? 'негізгі қадамдар/ережелерде олқылықтар байқалады'
        : band === 'borderline'
          ? 'тұрақтылық пен жылдамдық үшін жаттығу қажет'
          : 'деңгей жақсы; дағдыны жүйелі тәжірибемен қолдау'
    const acts = actionsForBandKz(t.topic, band).slice(0, 3);
    const time = timeForBandKz(band);
    const line = `- ${t.topic} — ${inferred.value} — ${cls.rec}. Қысқаша: ${rationale}. Ұсыныстар: 1) ${acts[0]}; 2) ${acts[1]}; 3) ${acts[2]}. Уақыты: ${time}.`;
    if (band === 'weak' || band === 'borderline') weakLines.push(line); else strongLines.push(line);
  }

  const sections: string[] = [];
  if (weakLines.length) {
    sections.push('Әлсіз тақырыптар:');
    sections.push(...weakLines);
    sections.push('');
  }
  if (strongLines.length) {
    sections.push('Күшті тақырыптар:');
    sections.push(...strongLines);
    sections.push('');
  }
  const plan = 'Жоспар: әлсіз тақырыптарға күнде 45–60 мин; 3 күнде бір мини‑тест.';
  sections.push(plan);
  return sections.join('\n');
}

export function generateDiagnosticReportKzFromAnalyze(analysis: any): string {
  const topics: KzTopicPerfInput[] = Array.isArray(analysis?.topics)
    ? analysis.topics.map((t: any) => ({
        topic: String(t.topic || 'Тақырып'),
        percent: typeof t.percent_correct === 'number' ? t.percent_correct : (typeof t.avg_score_pct === 'number' ? t.avg_score_pct : undefined),
        note: undefined,
        sample_size: t.total_items,
        classification: t.classification,
      }))
    : [];
  return generateDiagnosticReportKz(topics, { maxTopics: 10 });
}
