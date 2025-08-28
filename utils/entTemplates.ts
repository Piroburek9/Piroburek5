export type EntTrack = 'math' | 'physics';

export type EntQuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'numeric'
  | 'matching'
  | 'text'
  | 'image'
  | 'latex';

export interface EntSectionTemplate {
  id: string;
  title: string; // e.g., 'История Казахстана'
  key: string; // e.g., 'history_kz'
  numQuestions: number;
  timeLimitMinutes: number;
  questionTypes: EntQuestionType[];
  mandatory: boolean;
}

export interface EntTemplate {
  id: string;
  name: string; // e.g., 'ENT Default 2025'
  description?: string;
  tracks: Record<EntTrack, {
    sections: EntSectionTemplate[];
    totalTimeMinutes: number;
  }>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

const STORAGE_KEY = 'ent_template_current_v1';

export const DEFAULT_ENT_TEMPLATE: EntTemplate = {
  id: 'ent-default-2025',
  name: 'ENT Default 2025',
  description: 'Шаблон, приближенный к структуре ЕНТ. Включает обязательные секции: История Казахстана и Математическая грамотность.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  tracks: {
    math: {
      sections: [
        {
          id: 'history-kz',
          title: 'История Казахстана',
          key: 'history_kz',
          numQuestions: 20,
          timeLimitMinutes: 20,
          questionTypes: ['multiple_choice', 'multi_select'],
          mandatory: true
        },
        {
          id: 'math-literacy',
          title: 'Математическая грамотность',
          key: 'math_literacy',
          numQuestions: 10,
          timeLimitMinutes: 20,
          questionTypes: ['multiple_choice', 'numeric', 'latex'],
          mandatory: true
        },
        {
          id: 'math-profile',
          title: 'Профильная математика',
          key: 'math_profile',
          numQuestions: 35,
          timeLimitMinutes: 100,
          questionTypes: ['multiple_choice', 'multi_select', 'numeric', 'latex', 'image'],
          mandatory: false
        }
      ],
      totalTimeMinutes: 140
    },
    physics: {
      sections: [
        {
          id: 'history-kz',
          title: 'История Казахстана',
          key: 'history_kz',
          numQuestions: 20,
          timeLimitMinutes: 20,
          questionTypes: ['multiple_choice', 'multi_select'],
          mandatory: true
        },
        {
          id: 'math-literacy',
          title: 'Математическая грамотность',
          key: 'math_literacy',
          numQuestions: 10,
          timeLimitMinutes: 20,
          questionTypes: ['multiple_choice', 'numeric', 'latex'],
          mandatory: true
        },
        {
          id: 'physics-profile',
          title: 'Профильная физика',
          key: 'physics_profile',
          numQuestions: 35,
          timeLimitMinutes: 100,
          questionTypes: ['multiple_choice', 'multi_select', 'numeric', 'latex', 'image'],
          mandatory: false
        }
      ],
      totalTimeMinutes: 140
    }
  }
};

export function loadEntTemplate(): EntTemplate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENT_TEMPLATE;
    const parsed = JSON.parse(raw) as EntTemplate;
    return parsed;
  } catch {
    return DEFAULT_ENT_TEMPLATE;
  }
}

export function saveEntTemplate(template: EntTemplate) {
  const updated: EntTemplate = {
    ...template,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function resetEntTemplate() {
  localStorage.removeItem(STORAGE_KEY);
}


