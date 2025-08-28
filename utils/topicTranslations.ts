// Topic translations for Russian and Kazakh languages
export interface TopicTranslation {
  ru: string;
  kz: string;
  code: string;
  subject: string;
}

export const TOPIC_TRANSLATIONS: Record<string, TopicTranslation> = {
  // Mathematical topics
  'quadratic_equations': {
    ru: 'Квадратные уравнения',
    kz: 'Квадраттық теңдеулер',
    code: 'math_quadratic',
    subject: 'mathematics'
  },
  'linear_equations': {
    ru: 'Линейные уравнения',
    kz: 'Сызықтық теңдеулер',
    code: 'math_linear',
    subject: 'mathematics'
  },
  'percentages': {
    ru: 'Проценты и доли',
    kz: 'Пайыздар мен үлестер',
    code: 'math_percent',
    subject: 'mathematics'
  },
  'fractions': {
    ru: 'Дроби и сравнение чисел',
    kz: 'Бөлшектер және сандарды салыстыру',
    code: 'math_fractions',
    subject: 'mathematics'
  },
  'geometry_triangles': {
    ru: 'Геометрия: треугольники',
    kz: 'Геометрия: үшбұрыштар',
    code: 'math_geometry_tri',
    subject: 'mathematics'
  },
  'geometry_circles': {
    ru: 'Геометрия: окружности',
    kz: 'Геометрия: шеңберлер',
    code: 'math_geometry_cir',
    subject: 'mathematics'
  },
  'algebra_functions': {
    ru: 'Алгебра: функции',
    kz: 'Алгебра: функциялар',
    code: 'math_algebra_func',
    subject: 'mathematics'
  },
  'statistics': {
    ru: 'Статистика и вероятность',
    kz: 'Статистика және ықтималдық',
    code: 'math_stats',
    subject: 'mathematics'
  },
  'arithmetic_progression': {
    ru: 'Арифметическая прогрессия',
    kz: 'Арифметикалық прогрессия',
    code: 'math_progression',
    subject: 'mathematics'
  },
  'surface_area': {
    ru: 'Площадь поверхности',
    kz: 'Бет ауданы',
    code: 'math_surface',
    subject: 'mathematics'
  },

  // Physics topics
  'mechanics_dynamics': {
    ru: 'Динамика: второй закон Ньютона',
    kz: 'Динамика: Ньютонның екінші заңы',
    code: 'physics_mechanics',
    subject: 'physics'
  },
  'mechanics_kinematics': {
    ru: 'Кинематика',
    kz: 'Кинематика',
    code: 'physics_kinematics',
    subject: 'physics'
  },
  'optics': {
    ru: 'Оптика',
    kz: 'Оптика',
    code: 'physics_optics',
    subject: 'physics'
  },
  'electricity': {
    ru: 'Электричество',
    kz: 'Электр',
    code: 'physics_electricity',
    subject: 'physics'
  },
  'units_si': {
    ru: 'Единицы СИ и размерности',
    kz: 'SI бірліктері және өлшемдер',
    code: 'physics_units',
    subject: 'physics'
  },

  // History topics
  'kazakh_history_19th': {
    ru: 'История Казахстана XIX века',
    kz: 'XIX ғасырдағы Қазақстан тарихы',
    code: 'history_19th',
    subject: 'history'
  },
  'kazakh_history_20th': {
    ru: 'История Казахстана XX века',
    kz: 'XX ғасырдағы Қазақстан тарихы',
    code: 'history_20th',
    subject: 'history'
  },
  'reforms_dates': {
    ru: 'Реформы и даты',
    kz: 'Реформалар мен даталар',
    code: 'history_reforms',
    subject: 'history'
  },
  'independence_period': {
    ru: 'Период независимости',
    kz: 'Тәуелсіздік кезеңі',
    code: 'history_independence',
    subject: 'history'
  },

  // Math Literacy topics (specific to ENT)
  'numerical_reasoning': {
    ru: 'Логические задания с числовыми значениями',
    kz: 'Сандық мәндермен логикалық тапсырмалар',
    code: 'mathlit_01',
    subject: 'math_literacy'
  },
  'text_problems': {
    ru: 'Текстовые задачи с уравнениями',
    kz: 'Теңдеулермен мәтін есептері',
    code: 'mathlit_02',
    subject: 'math_literacy'
  },
  'percentages_diagrams': {
    ru: 'Проценты и диаграммы',
    kz: 'Пайыздар мен диаграммалар',
    code: 'mathlit_03',
    subject: 'math_literacy'
  },
  'statistics_measures': {
    ru: 'Среднее, размах, медиана, мода',
    kz: 'Орташа, ауқым, медиана, мода',
    code: 'mathlit_04',
    subject: 'math_literacy'
  },
  'probability_combinatorics': {
    ru: 'Вероятности/комбинаторика/таблицы частот',
    kz: 'Ықтималдық/комбинаторика/жиілік кестелері',
    code: 'mathlit_05',
    subject: 'math_literacy'
  },
  'proportional_dependence': {
    ru: 'Зависимость одной величины от другой (пропорции)',
    kz: 'Бір шаманың екінші шамаға тәуелділігі (пропорциялар)',
    code: 'mathlit_06',
    subject: 'math_literacy'
  },
  'sequences_tables': {
    ru: 'Последовательности / анализ таблиц',
    kz: 'Тізбектер / кестелерді талдау',
    code: 'mathlit_07',
    subject: 'math_literacy'
  },
  'geometric_logic': {
    ru: 'Геометрическая логика',
    kz: 'Геометриялық логика',
    code: 'mathlit_08',
    subject: 'math_literacy'
  },
  'area_perimeter': {
    ru: 'Площадь и периметр',
    kz: 'Аудан және периметр',
    code: 'mathlit_09',
    subject: 'math_literacy'
  },
  'surface_area_solids': {
    ru: 'Площадь поверхности тел (куб)',
    kz: 'Денелердің бет ауданы (куб)',
    code: 'mathlit_10',
    subject: 'math_literacy'
  }
};

// Function to get topic translation
export function getTopicTranslation(topicKey: string, language: 'ru' | 'kz'): string {
  const topic = TOPIC_TRANSLATIONS[topicKey];
  if (!topic) {
    return topicKey; // Return original if not found
  }
  return topic[language];
}

// Function to get topic by code
export function getTopicByCode(code: string): TopicTranslation | null {
  return Object.values(TOPIC_TRANSLATIONS).find(topic => topic.code === code) || null;
}

// Function to detect topic from question content
export function detectTopicFromQuestion(questionText: string, language: 'ru' | 'kz'): string {
  const text = questionText.toLowerCase();
  
  // Mathematical topic detection
  if (text.includes('x²') || text.includes('x^2') || text.includes('квадрат') || text.includes('квадраттық')) {
    return 'quadratic_equations';
  }
  if (text.includes('линейн') || text.includes('сызықтық') || text.includes('ax+b')) {
    return 'linear_equations';
  }
  if (text.includes('%') || text.includes('процент') || text.includes('пайыз')) {
    return 'percentages';
  }
  if (text.includes('дроб') || text.includes('бөлшек') || text.includes('/')) {
    return 'fractions';
  }
  if (text.includes('треугольник') || text.includes('үшбұрыш')) {
    return 'geometry_triangles';
  }
  if (text.includes('окружность') || text.includes('шеңбер') || text.includes('радиус')) {
    return 'geometry_circles';
  }
  if (text.includes('функция') || text.includes('функция')) {
    return 'algebra_functions';
  }
  if (text.includes('среднее') || text.includes('орташа') || text.includes('медиана')) {
    return 'statistics';
  }
  if (text.includes('прогрессия') || text.includes('прогрессия')) {
    return 'arithmetic_progression';
  }
  if (text.includes('площадь поверхности') || text.includes('бет ауданы')) {
    return 'surface_area';
  }

  // Physics topic detection
  if (text.includes('ньютон') || text.includes('ньютон') || text.includes('сила')) {
    return 'mechanics_dynamics';
  }
  if (text.includes('скорость') || text.includes('жылдамдық') || text.includes('ускорение')) {
    return 'mechanics_kinematics';
  }
  if (text.includes('свет') || text.includes('жарық') || text.includes('линза')) {
    return 'optics';
  }
  if (text.includes('электри') || text.includes('электр') || text.includes('ток')) {
    return 'electricity';
  }
  if (text.includes('единиц') || text.includes('бірлік') || text.includes('размерность')) {
    return 'units_si';
  }

  // History topic detection
  if (text.includes('xix') || text.includes('19') || text.includes('девятнадцат')) {
    return 'kazakh_history_19th';
  }
  if (text.includes('xx') || text.includes('20') || text.includes('двадцат')) {
    return 'kazakh_history_20th';
  }
  if (text.includes('реформ') || text.includes('реформа')) {
    return 'reforms_dates';
  }
  if (text.includes('независимость') || text.includes('тәуелсіздік')) {
    return 'independence_period';
  }

  return 'general'; // Default fallback
}

// Function to get all topics for a subject
export function getTopicsForSubject(subject: string): TopicTranslation[] {
  return Object.values(TOPIC_TRANSLATIONS).filter(topic => topic.subject === subject);
}

// Function to get topic code from question metadata
export function getTopicCodeFromMeta(meta: Record<string, any> | undefined): string {
  if (!meta) return 'general';
  
  if (meta.topicCode) return meta.topicCode;
  if (meta.domain) return meta.domain;
  if (meta.topic) return meta.topic;
  
  return 'general';
}
