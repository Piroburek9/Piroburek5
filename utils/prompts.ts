export type ExplainMode = 'concise' | 'step_by_step' | 'socratic';
export interface ExplainProblemParams {
  subject?: string;
  problem: string;
  options?: string[]; // for multiple-choice
  studentAnswer?: string;
  correctAnswer?: string;
  contextNotes?: string; // exam context, constraints
  showCommonMistakes?: boolean;
  mode?: ExplainMode;
  targetTimeSeconds?: number; // desired explanation length/time
}

export function buildExplainProblemPrompt(language: 'ru' | 'kz', params: ExplainProblemParams): string {
  return language === 'kz' ? buildExplainProblemPromptKz(params) : buildExplainProblemPromptRu(params);
}

export function buildExplainProblemPromptRu(params: ExplainProblemParams): string {
  const {
    subject,
    problem,
    options,
    studentAnswer,
    correctAnswer,
    contextNotes,
    showCommonMistakes = true,
    mode = 'step_by_step',
    targetTimeSeconds = 90,
  } = params;

  const subjLabel = subject && subject.trim() ? `предмет «${subject.trim()}»` : 'свой предмет';
  const header = `Ты — учитель со стажем 20 лет и отлично знающий ${subjLabel}. Объясни задачу кратко и понятно для школьника.`;
  const fmt = mode === 'concise'
    ? 'Дай краткое решение (2–4 шага) и итог.'
    : mode === 'socratic'
      ? 'Задай 2–4 наводящих вопроса, затем покажи правильный ход и финальный ответ.'
      : 'Дай пошаговое решение (3–6 коротких шагов) с ключевыми идеями.';
  const mc = options && options.length ? `\nВарианты: ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(' ')}` : '';
  const stud = studentAnswer ? `\nОтвет ученика: ${studentAnswer}` : '';
  const corr = correctAnswer ? `\nПравильный ответ: ${correctAnswer}` : '';
  const ctx = contextNotes ? `\nКонтекст: ${contextNotes}` : '';
  const mistakes = showCommonMistakes ? '\nДобавь 1–2 типичных ошибки и как их избежать.' : '';
  const length = `\nЛимит: ~${Math.round(targetTimeSeconds)} сек чтения.`;

  return `${header}
Задача: ${problem}${mc}${stud}${corr}${ctx}
Режим: ${fmt}${mistakes}${length}
Формат:
1) Ключевая идея/формула
2) Шаги решения (${mode === 'concise' ? 'кратко' : 'по пунктам'})
3) Итоговый ответ`;
}

export function buildExplainProblemPromptKz(params: ExplainProblemParams): string {
  const {
    subject,
    problem,
    options,
    studentAnswer,
    correctAnswer,
    contextNotes,
    showCommonMistakes = true,
    mode = 'step_by_step',
    targetTimeSeconds = 90,
  } = params;

  const subjLabel = subject && subject.trim() ? `«${subject.trim()}» пәнін` : 'пәнін';
  const header = `Сен — 20 жылдық тәжірибесі бар және ${subjLabel} өте жақсы білетін мұғалімсің. Тапсырманы оқушыға түсінікті, қысқа түрде түсіндір.`;
  const fmt = mode === 'concise'
    ? 'Қысқа шешім бер (2–4 қадам) және қорытынды.'
    : mode === 'socratic'
      ? '2–4 жетелеуші сұрақ қой, содан кейін дұрыс жолын және финалдық жауапты көрсет.'
      : 'Қадамдап шешім бер (3–6 қысқа қадам) негізгі идеялармен.';
  const mc = options && options.length ? `\nНұсқалар: ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(' ')}` : '';
  const stud = studentAnswer ? `\nОқушы жауабы: ${studentAnswer}` : '';
  const corr = correctAnswer ? `\nДұрыс жауап: ${correctAnswer}` : '';
  const ctx = contextNotes ? `\nКонтекст: ${contextNotes}` : '';
  const mistakes = showCommonMistakes ? '\n1–2 жиі қателерді және оларды қалай болдырмауды қос.' : '';
  const length = `\nШектеу: ~${Math.round(targetTimeSeconds)} сек оқу.`;

  return `${header}
Есеп: ${problem}${mc}${stud}${corr}${ctx}
Режим: ${fmt}${mistakes}${length}
Формат:
1) Негізгі идея/формула
2) Шешім қадамдары (${mode === 'concise' ? 'қысқа' : 'тармақпен'})
3) Қорытынды жауап`;
}


