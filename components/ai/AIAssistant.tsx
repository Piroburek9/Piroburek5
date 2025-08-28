import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Send, Bot, User, Loader2, Brain, BookOpen, HelpCircle, Lightbulb } from 'lucide-react';
import { dataService } from '../../utils/dataService';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: string;
  isDemo?: boolean;
}

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я ваш умный помощник по образованию. Могу помочь с объяснением сложных тем, подготовкой к тестам или ответить на любые учебные вопросы. Что вас интересует?',
      sender: 'ai',
      timestamp: new Date(),
      isDemo: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions] = useState([
    { id: 'explain', text: 'Объясни тему', icon: BookOpen },
    { id: 'test-prep', text: 'Подготовка к тесту', icon: Brain },
    { id: 'question', text: 'Задать вопрос', icon: HelpCircle },
    { id: 'tips', text: 'Советы по учебе', icon: Lightbulb },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async (message: string, context?: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create enhanced context from user profile
      let enhancedContext = user ? `
        Пользователь: ${user.name} (${user.role})
        Тестов пройдено: ${user.tests_completed || 0}
        Средний балл: ${user.average_score || 0}%
        Время изучения: ${user.total_study_time || 0} минут
        ${context ? `Дополнительный контекст: ${context}` : ''}
      ` : (context || '');

      // If the user requests analysis, attach last test results in a structured way for the AI
      const wantsAnalysis = /анализ|результ|итог|сильн|слаб|домаш|талдау|нәтиже|қорытынды|тақырып/i.test(message);
      if (wantsAnalysis) {
        try {
          const results = await dataService.getResults();
          if (results && results.length > 0) {
            const latest = results.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
            const total = Array.isArray(latest.answers) ? latest.answers.length : 0;
            const correct = Array.isArray(latest.answers) ? latest.answers.filter((a: any) => a.correct).length : Math.round((latest.score / 100) * total);
            const percentage = Math.round(latest.score);
            const subject = latest.test_id?.replace('test-', '') || 'overall';

            const strengths: string[] = [];
            const weaknesses: string[] = [];
            if (percentage >= 85) strengths.push('Высокая точность ответов и уверенное владение основами');
            if (percentage >= 70 && percentage < 85) strengths.push('Хорошая базовая подготовка, требуется точечное улучшение');
            if (percentage < 70) weaknesses.push('Недостаточное закрепление базовых тем, нужна системная практика');
            if (total - correct > 0) weaknesses.push('Ошибки в вопросах средней/высокой сложности');

            const topicsMap: Record<string, { ru: string[]; kz: string[] }> = {
              mathematics: {
                ru: ['Линейные уравнения', 'Проценты и доли', 'Дроби и сравнение чисел'],
                kz: ['Сызықтық теңдеулер', 'Пайыздар мен үлестер', 'Бөлшектер және сандарды салыстыру']
              },
              history: {
                ru: ['История Казахстана XIX века', 'Реформы и даты'],
                kz: ['XIX ғасырдағы Қазақстан тарихы', 'Реформалар мен даталар']
              },
              physics: {
                ru: ['Динамика: второй закон Ньютона', 'Единицы СИ и размерности'],
                kz: ['Динамика: Ньютонның екінші заңы', 'SI бірліктері және өлшемдер']
              },
              overall: {
                ru: ['Повторение базовой теории', 'Разбор типичных ошибок'],
                kz: ['Негізгі теорияны қайталау', 'Жиі кездесетін қателерді талдау']
              }
            };
            const isKz = /[әғқңөұүһі]|(сәлем|қалай|ия|жоқ|үй|тапсырма|талдау)/i.test(message);
            const topics = (topicsMap[subject as keyof typeof topicsMap] || topicsMap.overall)[isKz ? 'kz' : 'ru'];

            const homework = isKz
              ? [
                  'Осы тақырып бойынша 20 тапсырма орындаңыз',
                  'Қателескен сұрақтарды қайта қарап шығыңыз',
                  'Қысқаша конспект жасаңыз (5–7 тармақ)'
                ]
              : [
                  'Выполните 20 заданий по теме',
                  'Пересмотрите вопросы, где были ошибки',
                  'Составьте краткий конспект (5–7 пунктов)'
                ];

            const analysisPayload = {
              subject,
              percentage,
              correct,
              total,
              timeSpent: latest.time_spent,
              strengths,
              weaknesses,
              topics,
              homework
            };
            enhancedContext += `\nANALYZE_TEST_RESULTS: ${JSON.stringify(analysisPayload)}`;
          }
        } catch (e) {
          // Ignore analysis attachment errors
        }
      }

      // Detect language from the message to enable Kazakh replies when the user writes in Kazakh
      const languageHint: 'ru' | 'kz' = /[әғқңөұүһі]|(сәлем|қалай|ия|жоқ|үй|тапсырма|талдау)/i.test(message) ? 'kz' : 'ru';
      // Prepend an instruction-style system hint to keep answers concise and helpful
      const systemHint = `Режим ассистента: помогай кратко, структурировано, по шагам; используй язык пользователя (ru/kz). Если просят анализ теста — дай сильные/слабые стороны и план. Если просят задачи ЕНТ — предлагай аналогичные примеры.`;
      const response = await dataService.chatWithAI(`${systemHint}\n\n${message}`, enhancedContext, languageHint);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
        isDemo: response.isDemo
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз или обратитесь к преподавателю.',
        sender: 'ai',
        timestamp: new Date(),
        isDemo: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Ошибка ИИ помощника');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  type QuickAction = 'explain' | 'test-prep' | 'question' | 'tips';
  const isQuickAction = (v: string): v is QuickAction => {
    return (['explain', 'test-prep', 'question', 'tips'] as const).includes(v as QuickAction);
  };
  const handleQuickAction = (actionId: string) => {
    if (!isQuickAction(actionId)) return;
    const prompts: Record<QuickAction, string> = {
      explain: 'Объясни мне сложную тему простыми словами, приведи 1-2 примера и мини-план практики',
      'test-prep': 'Составь персональный план подготовки к ЕНТ по математике/физике на 2 недели (коротко)',
      question: 'У меня есть вопрос по учебе: ',
      tips: 'Дай 5 кратких советов для эффективного обучения с примерами'
    };
    const prompt: string = prompts[actionId];
    if (prompt) {
      sendMessage(prompt, `quick_action:${actionId}`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            ИИ Помощник по обучению
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
              {user ? `Для ${user.name}` : 'Образовательный помощник'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`rounded-lg p-3 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.isDemo && message.sender === 'ai' && (
                        <div className="mt-2 pt-2 border-t border-gray-300 opacity-70">
                          <span className="text-xs">Демо-режим</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 border border-gray-200">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-gray-600">ИИ анализирует вопрос...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t bg-gray-50 p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Быстрые действия:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.id)}
                      className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      disabled={isLoading}
                    >
                      <IconComponent className="h-3 w-3" />
                      {action.text}
                    </Button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Задайте вопрос или опишите, с чем нужна помощь..."
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-0 shadow-lg">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3 text-gray-900">Возможности ИИ помощника:</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Объяснение сложных тем</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Подготовка к тестам</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <HelpCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Ответы на вопросы</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Советы по обучению</span>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Ваш прогресс:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Тестов пройдено:</span>
                  <span className="font-medium text-blue-600 ml-1">{user.tests_completed || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Средний балл:</span>
                  <span className="font-medium text-green-600 ml-1">{user.average_score || 0}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};