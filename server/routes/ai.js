import express from 'express';
import { getDB } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper to generate ID
function generateId(prefix = 'chat') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, language = 'ru' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const SYSTEM_PROMPT = `Вы — опытный образовательный ассистент для подготовки к ЕНТ и школьным предметам (математика, физика, история и др.).
1) Язык и тон:
- По умолчанию отвечайте на русском языке: понятно, поддерживающе, уважительно.
- Если пользователь просит ответ на казахском или пишет по-казахски — отвечайте на казахском.
2) Формат ответа:
- Короткие абзацы. Где уместно — списки и подпункты.
- При объяснении теории: дайте определение, пошаговое объяснение, мини‑пример, типичные ошибки.
- Формулы оформляйте LaTeX-разметкой: inline \\( ... \\) или блоками \\[ ... \\].
- Если вопрос неоднозначный — задайте 1–3 уточняющих вопроса перед выводами.
3) Режим «улучшить текст»:
- Если сообщение выглядит как просьба переписать/улучшить/переформулировать текст (ключи: "перепиши", "улучши", "сократи", "расширь", "rewrite", "paraphrase"),
  выполните редактуру без изменения смысла: исправьте грамматику, сделайте стиль яснее.
- Дайте 2–3 варианта на выбор: «нейтральный», «проще», «академический». Кратко поясните разницу.
4) Практика и проверка знаний:
- При запросе практики предложите 3–5 задач по теме с возрастающей сложностью и ответами/подсказками.
5) Безопасность и честность:
- Не выдумывайте факты. Если данных не хватает — скажите об этом и предложите, что уточнить.
- Избегайте медицинских/юридических рекомендаций; добавляйте уместные дисклеймеры.`;
    
    // Try different AI services in order of preference
    const geminiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];
    const deepseekKey = process.env.DEEPSEEK_API_KEY || req.headers['x-deepseek-api-key'];
    const openrouterKey = process.env.OPENROUTER_API_KEY || req.headers['x-openrouter-api-key'];

    let aiResponse = null;
    let error = null;

    // Try Gemini first (free tier, good for Russian)
    if (geminiKey && !aiResponse) {
      try {
        const prompt = `Контекст: ${context || 'Общий вопрос'}. Вопрос пользователя: ${message}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: SYSTEM_PROMPT },
                { text: prompt }
              ]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join('\n');
          if (text) {
            aiResponse = text;
          }
        }
      } catch (err) {
        error = `Gemini error: ${err.message}`;
      }
    }

    // Try DeepSeek if Gemini failed
    if (deepseekKey && !aiResponse) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Контекст: ${context || 'Общий вопрос'}. Вопрос пользователя: ${message}` }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            aiResponse = text;
          }
        } else if (response.status === 402) {
          error = 'DeepSeek: Payment required';
        }
      } catch (err) {
        error = `DeepSeek error: ${err.message}`;
      }
    }

    // Try OpenRouter if other services failed
    if (openrouterKey && !aiResponse) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'EduPlatform'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Контекст: ${context || 'Общий вопрос'}. Вопрос пользователя: ${message}` }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            aiResponse = text;
          }
        }
      } catch (err) {
        error = `OpenRouter error: ${err.message}`;
      }
    }

    // If all AI services failed, return a fallback response
    if (!aiResponse) {
      aiResponse = await generateFallbackResponse(message, context, language);
    }

    // Save chat history if user is authenticated
    const userId = req.userId || null; // userId is set by authenticateToken middleware if present
    if (userId) {
      saveChatHistory(userId, message, aiResponse, context);
    }

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      ...(error && { debug: error })
    });

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Return fallback response on error
    const fallbackResponse = await generateFallbackResponse(req.body.message, req.body.context, req.body.language);
    res.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      isDemo: true
    });
  }
});

// Generate quiz using AI
router.post('/generate-quiz', authenticateToken, async (req, res) => {
  try {
    const { subject = 'general', difficulty = 'medium', count = 5 } = req.body;
    
    const levels = { easy: 'легкий', medium: 'средний', hard: 'сложный' };
    const normalizedDifficulty = levels[difficulty] || 'средний';
    const questionCount = Math.min(20, Math.max(1, Number(count)));
    
    // For now, generate demo questions
    // In production, you could use AI to generate actual questions
    const questions = Array.from({ length: questionCount }, (_, i) => ({
      id: `ai-q-${Date.now()}-${i}`,
      question: `Вопрос ${i + 1} по теме "${subject}" (уровень: ${normalizedDifficulty})`,
      type: 'multiple_choice',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correct_answer: 0,
      explanation: 'Демонстрационный вопрос, сгенерированный ИИ-системой.'
    }));
    
    res.json({ questions });
  } catch (error) {
    console.error('AI generate-quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Get chat history for authenticated user
router.get('/chat/history', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  
  db.all(`
    SELECT id, message, response, context, timestamp
    FROM chat_history
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `, [userId, limit], (err, history) => {
    if (err) {
      console.error('Error fetching chat history:', err);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }
    
    res.json(history.reverse()); // Return in chronological order
  });
});

// Helper function to generate fallback responses
async function generateFallbackResponse(message, context, language = 'ru') {
  // Simulate AI thinking time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const lang = language || detectLanguageFromText(message);
  
  const responsesRu = [
    'Отличный вопрос! Для лучшего понимания этой темы рекомендую разбить её на части и изучать постепенно.',
    'Я вижу, что вы изучаете сложную тему. Давайте разберём её по шагам. Что именно вызывает затруднения?',
    'Это интересная область! Попробуйте найти практические примеры — они помогут лучше усвоить материал.',
    'Хороший подход к обучению! Не забывайте делать перерывы и повторять изученное через определённые интервалы.',
    'Для закрепления материала рекомендую пройти дополнительные тесты по этой теме.',
    'Помните: постоянная практика — ключ к успеху. Попробуйте решать задачи каждый день.',
    'Если у вас есть вопросы по конкретной теме, я готов помочь с объяснениями.',
    'Отличная работа! Продолжайте в том же духе. Какую тему изучаем дальше?'
  ];
  
  const responsesKz = [
    'Тамаша сұрақ! Тақырыпты бөліктерге бөліп, біртіндеп оқуды ұсынамын.',
    'Күрделі тақырыпты оқып жатырсыз екен. Қадамдап талдайық. Нақты қай жерде қиындық бар?',
    'Өте қызық тақырып! Тәжірибелік мысалдармен байланыстыру материалды жақсы меңгеруге көмектеседі.',
    'Оқу тәсіліңіз жақсы! Үзіліс жасап, қайталауды ұмытпаңыз.',
    'Материалды бекіту үшін осы тақырып бойынша қосымша тесттерді орындаңыз.',
    'Үздіксіз тәжірибе — табыстың кілті. Күн сайын тапсырмалар шешуге тырысыңыз.',
    'Егер нақты тақырып бойынша сұрақтар болса, түсіндіруге дайынмын.',
    'Жұмысыңыз жақсы! Сол қалпында жалғастыра беріңіз. Келесі тақырып қандай?'
  ];

  // Simple keyword matching for more relevant responses
  const lowerMessage = message.toLowerCase();
  let response = '';

  if (lowerMessage.includes('математика') || lowerMessage.includes('алгебра')) {
    response = lang === 'kz'
      ? 'Математика тұрақты тәжірибені талап етеді. Қарапайым мысалдардан бастап күн сайын есеп шығарыңыз.'
      : 'Математика требует постоянной практики. Рекомендую решать задачи каждый день, начиная с простых примеров.';
  } else if (lowerMessage.includes('физика')) {
    response = lang === 'kz'
      ? 'Физика — табиғат заңдарын түсіну. Теорияны өмірдегі мысалдармен байланыстырып көріңіз.'
      : 'Физика — это понимание законов природы. Попробуйте связать теорию с практическими примерами из жизни.';
  } else if (lowerMessage.includes('история') || lowerMessage.includes('тарих')) {
    response = lang === 'kz'
      ? 'Тарих қазіргі уақытты түсінуге көмектеседі. Даталар мен оқиғаларды жақсы есте сақтау үшін уақыт сызықтарын жасаңыз.'
      : 'История помогает понять настоящее. Создайте временные линии для лучшего запоминания дат и событий.';
  } else {
    const pool = lang === 'kz' ? responsesKz : responsesRu;
    response = pool[Math.floor(Math.random() * pool.length)];
  }

  return response;
}

// Helper function to detect language
function detectLanguageFromText(text) {
  const kzChars = /[әғқңөұүһі]/i;
  const kzWords = /(сәлем|қалай|ия|жоқ|үй|тапсырма|талдау)/i;
  if (kzChars.test(text) || kzWords.test(text)) return 'kz';
  return 'ru';
}

// Helper function to save chat history
function saveChatHistory(userId, message, response, context) {
  const db = getDB();
  const chatId = generateId('chat');
  
  const stmt = db.prepare(`
    INSERT INTO chat_history (id, user_id, message, response, context)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(chatId, userId, message, response, context, (err) => {
    if (err) {
      console.error('Error saving chat history:', err);
    }
  });
  
  stmt.finalize();
}

export default router;
