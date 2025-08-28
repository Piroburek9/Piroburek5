// @ts-nocheck
/* eslint-disable */
import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts'
import { cors } from 'https://deno.land/x/hono@v4.3.11/middleware/cors/index.ts'
import { logger } from 'https://deno.land/x/hono@v4.3.11/middleware/logger/index.ts'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Simple in-memory KV fallback for local development (when Supabase env is missing)
const useMemoryStore = !Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const memoryStore: Record<string, any> = {}

const kvGet = async (key: string) => {
  if (useMemoryStore) {
    return memoryStore[key]
  }
  try {
    return await kv.get(key)
  } catch {
    return undefined
  }
}

const kvSet = async (key: string, value: any) => {
  if (useMemoryStore) {
    memoryStore[key] = value
    return
  }
  return kv.set(key, value)
}

const kvDel = async (key: string) => {
  if (useMemoryStore) {
    delete memoryStore[key]
    return
  }
  return kv.del(key)
}

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Add logging
app.use('*', logger())

// Health check
app.get('/make-server-94a31f15/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Friendly root and favicon to avoid 404 noise
app.get('/', (c) => {
  return c.json({
    message: 'EduPlatform backend is running',
    hint: 'Use /make-server-94a31f15/health or access API via frontend proxy /api/* on port 3000'
  })
})

app.get('/favicon.ico', (c) => c.body(null, 204))

app.get('/make-server-94a31f15', (c) => c.redirect('/make-server-94a31f15/health'))

// Authentication routes
app.post('/make-server-94a31f15/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // Get user from storage
    const users = await kvGet('users') || []
    const user = users.find((u: any) => u.email === email && u.password === password)
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Generate simple session token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store session
    await kvSet(`session_${token}`, { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })
    
    return c.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }, 
      token 
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

app.post('/make-server-94a31f15/auth/register', async (c) => {
  try {
    const { email, password, name, role = 'student' } = await c.req.json()
    
    // Get existing users
    const users = await kvGet('users') || []
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return c.json({ error: 'User already exists' }, 400)
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password, // In production, hash this!
      name,
      role,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    await kvSet('users', users)
    
    return c.json({ 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role, 
        name: newUser.name 
      } 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.post('/make-server-94a31f15/auth/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (token) {
      await kvDel(`session_${token}`)
    }
    
    return c.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Logout failed' }, 500)
  }
})

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const session = await kvGet(`session_${token}`)
  if (!session || session.expiresAt < Date.now()) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
  
  c.set('user', session)
  await next()
}

// Profile routes
app.get('/make-server-94a31f15/profile', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const users = (await kvGet('users')) || []
    const user = users.find((u: any) => u.id === session.userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.put('/make-server-94a31f15/profile', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const updates = await c.req.json()
    const users = (await kvGet('users')) || []
    const idx = users.findIndex((u: any) => u.id === session.userId)
    if (idx === -1) return c.json({ error: 'User not found' }, 404)
    users[idx] = { ...users[idx], ...updates }
    await kvSet('users', users)
    const user = users[idx]
    return c.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (error) {
    console.error('Error updating profile:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Tests routes
app.get('/make-server-94a31f15/tests', async (c) => {
  try {
    const tests = (await kvGet('tests')) || []
    return c.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return c.json({ error: 'Failed to fetch tests' }, 500)
  }
})

app.post('/make-server-94a31f15/tests', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const testData = await c.req.json()
  const tests = await kvGet('tests') || []
    
    const newTest = {
      ...testData,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user.userId,
      createdAt: new Date().toISOString()
    }
    
    tests.push(newTest)
    await kvSet('tests', tests)
    
    return c.json(newTest)
  } catch (error) {
    console.error('Error creating test:', error)
    return c.json({ error: 'Failed to create test' }, 500)
  }
})

// Progress tracking routes
app.get('/make-server-94a31f15/progress/:userId', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId')
    const user = c.get('user')
    
    // Users can only view their own progress unless they're admin/teacher
    if (user.userId !== userId && user.role !== 'admin' && user.role !== 'teacher') {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    const progress = await kvGet(`progress_${userId}`) || []
    return c.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return c.json({ error: 'Failed to fetch progress' }, 500)
  }
})

app.post('/make-server-94a31f15/progress', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const progressData = await c.req.json()
    
    const progress = await kvGet(`progress_${user.userId}`) || []
    
    const newProgress = {
      ...progressData,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.userId,
      timestamp: new Date().toISOString()
    }
    
    progress.push(newProgress)
    await kvSet(`progress_${user.userId}`, progress)
    
    return c.json(newProgress)
  } catch (error) {
    console.error('Error saving progress:', error)
    return c.json({ error: 'Failed to save progress' }, 500)
  }
})

// Questions route (flatten from tests)
app.get('/make-server-94a31f15/questions', async (c) => {
  try {
    const tests = (await kvGet('tests')) || []
    const questions = tests.flatMap((t: any) =>
      (t.questions || []).map((q: any) => ({
        id: q.id,
        question: q.question ?? q.text,
        type: q.type ?? 'multiple_choice',
        options: q.options,
        correct_answer: q.correct_answer ?? q.correct,
        explanation: q.explanation,
        subject: t.subject,
        difficulty: t.difficulty,
      }))
    )
    return c.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return c.json({ error: 'Failed to fetch questions' }, 500)
  }
})

// AI quiz generation
app.post('/make-server-94a31f15/ai/generate-quiz', requireAuth, async (c) => {
  try {
    const { subject = 'general', difficulty = 'medium', count = 5 } = await c.req.json()
    const levels: Record<string, string> = { easy: 'легкий', medium: 'средний', hard: 'сложный' }
    const normalized = levels[difficulty] ? difficulty : 'medium'
    const questions = Array.from({ length: Math.min(20, Math.max(1, Number(count))) }).map((_, i) => ({
      id: `ai-q-${Date.now()}-${i}`,
      question: `Вопрос ${i + 1} по теме "${subject}" (уровень: ${levels[normalized]})`,
      type: 'multiple_choice',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correct_answer: 0,
      explanation: 'Демонстрационный вопрос, сгенерированный сервером.'
    }))
    return c.json({ questions })
  } catch (error) {
    console.error('AI generate-quiz error:', error)
    return c.json({ error: 'Failed to generate quiz' }, 500)
  }
})

// Test submission
const saveResult = async (userId: string, result: any) => {
  const key = `results_${userId}`
  const existing = (await kvGet(key)) || []
  existing.unshift(result)
  await kvSet(key, existing)
}

app.post('/make-server-94a31f15/tests/submit', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const { answers, score, timeSpent, subject, difficulty } = await c.req.json()
    const result = {
      id: `result_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: session.userId,
      test_id: `test-${subject}`,
      answers,
      score,
      time_spent: timeSpent,
      difficulty,
      completed_at: new Date().toISOString()
    }
    await saveResult(session.userId, result)
    return c.json(result)
  } catch (error) {
    console.error('Submit test error:', error)
    return c.json({ error: 'Failed to submit test' }, 500)
  }
})

app.post('/make-server-94a31f15/tests/:id/submit', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const testId = c.req.param('id')
    const { answers, score, timeSpent, difficulty } = await c.req.json()
    const result = {
      id: `result_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: session.userId,
      test_id: testId,
      answers,
      score,
      time_spent: timeSpent,
      difficulty,
      completed_at: new Date().toISOString()
    }
    await saveResult(session.userId, result)
    return c.json(result)
  } catch (error) {
    console.error('Submit test (by id) error:', error)
    return c.json({ error: 'Failed to submit test' }, 500)
  }
})

// Results and analytics
app.get('/make-server-94a31f15/results', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const results = (await kvGet(`results_${session.userId}`)) || []
    return c.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    return c.json({ error: 'Failed to fetch results' }, 500)
  }
})

app.get('/make-server-94a31f15/analytics', requireAuth, async (c) => {
  try {
    const session = c.get('user')
    const results = (await kvGet(`results_${session.userId}`)) || []
    const totalTests = results.length
    const averageScore = totalTests > 0 ? Math.round(results.reduce((s: number, r: any) => s + (r.score || 0), 0) / totalTests) : 0

    // Last 10 results as recent activity
    const recentActivity = results.slice(0, 10)

    // Progress trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const progressTrend = results
      .filter((r: any) => new Date(r.completed_at) >= thirtyDaysAgo)
      .map((r: any) => ({ date: r.completed_at.split('T')[0], score: r.score }))

    return c.json({ totalTests, averageScore, recentActivity, progressTrend })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// AI Assistant route
app.post('/make-server-94a31f15/ai/chat', async (c) => {
  try {
    const { message, context } = await c.req.json()

    const SYSTEM_PROMPT = `Вы — опытный образовательный ассистент для подготовки к ЕНТ и школьным предметам (математика, физика, история и др.).
1) Язык и тон:
- По умолчанию отвечайте на русском языке: понятно, поддерживающе, уважительно.
- Если пользователь просит ответ на казахском или пишет по-казахски — отвечайте на казахском.
2) Формат ответа:
- Короткие абзацы. Где уместно — списки и подпункты.
- При объяснении теории: дайте определение, пошаговое объяснение, мини‑пример, типичные ошибки.
- Формулы оформляйте LaTeX-разметкой: inline \\( ... \\) или блоками \\\[ ... \\\].
- Если вопрос неоднозначный — задайте 1–3 уточняющих вопроса перед выводами.
3) Режим «улучшить текст»:
- Если сообщение выглядит как просьба переписать/улучшить/переформулировать текст (ключи: "перепиши", "улучши", "сократи", "расширь", "rewrite", "paraphrase"),
  выполните редактуру без изменения смысла: исправьте грамматику, сделайте стиль яснее.
- Дайте 2–3 варианта на выбор: «нейтральный», «проще», «академический». Кратко поясните разницу.
4) Практика и проверка знаний:
- При запросе практики предложите 3–5 задач по теме с возрастающей сложностью и ответами/подсказками.
5) Безопасность и честность:
- Не выдумывайте факты. Если данных не хватает — скажите об этом и предложите, что уточнить.
- Избегайте медицинских/юридических рекомендаций; добавляйте уместные дисклеймеры.`
    
    // Prefer Gemini if provided, otherwise fall back to DeepSeek or OpenRouter
    const geminiKey = Deno.env.get('GEMINI_API_KEY') || c.req.header('x-gemini-api-key')
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY') || c.req.header('x-deepseek-api-key')
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY') || c.req.header('x-openrouter-api-key')

    if (geminiKey) {
      // Google Gemini: use gemini-1.5-flash for fast/free-tier, Russian output
      const prompt = `Контекст: ${context || 'Общий вопрос'}. Вопрос пользователя: ${message}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: SYSTEM_PROMPT },
                { text: prompt }
              ]
            }
          ]
        })
      })
      if (!resp.ok) {
        const body = await resp.text()
        return c.json({ error: 'Gemini upstream error', status: resp.status, body }, resp.status)
      }
      const jd = await resp.json()
      const text = jd?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || 'Извините, не удалось получить ответ.'
      return c.json({ response: text, timestamp: new Date().toISOString() })
    }

    if (deepseekKey) {
      // DeepSeek fallback
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
      })
      if (!response.ok) {
        const errText = await response.text()
        return c.json({ error: 'DeepSeek upstream error', status: response.status, body: errText }, response.status)
      }
      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.'
      return c.json({ response: aiResponse, timestamp: new Date().toISOString() })
    }

    if (openrouterKey) {
      // OpenRouter (e.g., sk-or-...) using DeepSeek model via aggregator
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          // Optional but recommended by OpenRouter
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
      })
      if (!response.ok) {
        const errText = await response.text()
        return c.json({ error: 'OpenRouter upstream error', status: response.status, body: errText }, response.status)
      }
      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.'
      return c.json({ response: aiResponse, timestamp: new Date().toISOString() })
    }

    return c.json({ error: 'Missing AI API key (provide x-gemini-api-key, x-deepseek-api-key, or x-openrouter-api-key; or set env GEMINI_API_KEY/DEEPSEEK_API_KEY/OPENROUTER_API_KEY)' }, 500)
  } catch (error) {
    console.error('AI chat error:', error)
    return c.json({ error: String(error) || 'AI service error' }, 500)
  }
})

// Initialize default data
app.post('/make-server-94a31f15/init', async (c) => {
  try {
    // Check if already initialized
    const initialized = await kvGet('initialized')
    if (initialized) {
      return c.json({ message: 'Already initialized' })
    }
    
    // Create default users
    const defaultUsers = [
      {
        id: 'user_demo',
        email: 'demo@example.com',
        password: 'password123',
        name: 'Demo User',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_admin',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_teacher',
        email: 'teacher@example.com',
        password: 'teacher123',
        name: 'Teacher User',
        role: 'teacher',
        createdAt: new Date().toISOString()
      }
    ]
    
    await kvSet('users', defaultUsers)
    
    // Create default tests
    const defaultTests = [
      {
        id: 'test-1',
        title: 'Математика - Алгебра',
        subject: 'mathematics',
        difficulty: 'medium',
        time_limit: 1800,
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
          }
        ],
        createdBy: 'user_teacher',
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        title: 'История Казахстана',
        subject: 'history',
        difficulty: 'easy',
        time_limit: 2400,
        questions: [
          {
            id: 'q1',
            question: 'В каком году была провозглашена независимость Казахстана?',
            type: 'multiple_choice',
            options: ['1990', '1991', '1992', '1993'],
            correct_answer: 1,
            explanation: 'Казахстан провозгласил независимость 16 декабря 1991 года'
          }
        ],
        createdBy: 'user_teacher',
        createdAt: new Date().toISOString()
      }
    ]
    
    await kvSet('tests', defaultTests)
    await kvSet('initialized', true)
    
    return c.json({ message: 'System initialized successfully' })
  } catch (error) {
    console.error('Initialization error:', error)
    return c.json({ error: 'Initialization failed' }, 500)
  }
})

// Alias for initialization to support alternate client paths
app.post('/make-server-94a31f15/init-data', async (c) => {
  return app.request('/make-server-94a31f15/init', { method: 'POST' })
    .then(() => c.json({ message: 'System initialized (alias)' }))
    .catch(() => c.json({ error: 'Initialization failed' }, 500))
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)