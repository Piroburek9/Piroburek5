import React, { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Input } from './components/ui/input';
import { Avatar } from './components/ui/avatar';
import { 
  Bot, Send, User, Sparkles, MessageCircle, 
  BookOpen, Trophy, BarChart3, Users, 
  Settings, LogOut, Home, Globe, Menu, X,
  Brain, Target, Zap, TrendingUp, LineChart
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { ThemeToggle } from './components/ui/theme-toggle';
import { dataService } from './utils/dataService';
import { Auth } from './components/pages/Auth';
import { Tests } from './components/pages/Tests';
import { Profile } from './components/pages/Profile';
import { Investor } from './components/pages/Investor';
import { Landing } from './components/pages/Landing';
import { TeacherDiary } from './components/pages/TeacherDiary';
import { TeacherDashboard } from './components/pages/TeacherDashboard';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

function App() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'tests' | 'profile' | 'auth' | 'diary' | 'trial'>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage = language === 'kz' 
      ? `👋 Қош келдіңіз!

Мен — сіздің ҰБТ бойынша AI‑көмекшіңіз. Қысқа түрде:
• 📚 Тест: сұрақтар, түсіндіру, қателерді талдау
• 📊 Прогресс: әлсіз/күшті тақырыптар, ұсыныстар
• 🎯 Жеке жоспар: мақсат, күндік көлем, бақылау

Бастайық: «Тест», «Прогресс» немесе «Жоспар» деп жазыңыз.`
      : `👋 Добро пожаловать!

Я — ваш AI‑ассистент по ЕНТ. Коротко:
• 📚 Тест: вопросы, объяснения, разбор ошибок
• 📊 Прогресс: сильные/слабые темы, рекомендации
• 🎯 План: цель, дневной объем, контроль

Начнем: напишите «Тест», «Прогресс» или «План».`;

    setMessages([
      {
        id: '1',
        content: welcomeMessage,
        role: 'assistant',
        timestamp: new Date(),
        actions: [
          { label: `🎯 ${t('quick.startTest')}`, action: () => setCurrentView('tests') },
          { label: `📊 ${t('quick.myProgress')}`, action: () => setCurrentView('profile') },
          { label: `💡 ${t('quick.tips')}`, action: () => setInputValue(language === 'kz' ? 'ҰБТ-ға дайындалу бойынша кеңестер беріңіз' : 'Дай советы по подготовке к ЕНТ') }
        ]
      }
    ]);

    // Initialize backend
    const initializeBackend = async () => {
      try {
        const response = await fetch('/api/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          console.log('Backend initialized');
        }
      } catch (error) {
        // Silent in dev
      }
    };
    
    initializeBackend();
  }, [language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'Печатает...',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Check for commands
      const lowerInput = userMessage.content.toLowerCase();
      let response = '';
      let actions: Message['actions'] = undefined;

      if (lowerInput.includes('тест') || lowerInput.includes('экзамен')) {
        response = 'Отлично! Давайте начнем тестирование. Выберите предмет и уровень сложности.';
        actions = [
          { label: '📚 Перейти к тестам', action: () => setCurrentView('tests') }
        ];
      } else if (lowerInput.includes('прогресс') || lowerInput.includes('статистик')) {
        response = 'Вот ваша статистика и прогресс обучения.';
        actions = [
          { label: '📊 Открыть профиль', action: () => setCurrentView('profile') }
        ];
      } else {
        // AI response
        const context = user ? `
          Пользователь: ${user.name} (${user.role})
          Тестов пройдено: ${user.tests_completed || 0}
          Средний балл: ${user.average_score || 0}%
        ` : '';

        const { response: aiResponse } = await dataService.sendAIMessage(
          userMessage.content,
          context,
          language as 'ru' | 'kz'
        );
        response = aiResponse;
      }

      // Remove typing and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          actions
        }];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          content: 'Извините, произошла ошибка. Попробуйте позже.',
          role: 'assistant',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('chat');
  };

  // Quick actions for chat
  const quickActions = [
    { icon: '📚', label: t('quick.startTest'), action: () => setCurrentView('tests') },
    { icon: '📊', label: t('quick.myProgress'), action: () => setCurrentView('profile') },
    { icon: '💡', label: t('quick.tips'), action: () => setInputValue(language === 'kz' ? 'ҰБТ-ға дайындалу бойынша кеңестер беріңіз' : 'Дай советы по подготовке к ЕНТ') },
    { icon: '🎯', label: t('quick.studyPlan'), action: () => setInputValue(language === 'kz' ? 'ҰБТ-ға дайындалу жоспарын құрыңыз' : 'Составь план подготовки к ЕНТ') }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Handle view routing based on authentication
  const handleStartTrial = () => {
    setCurrentView('trial');
    // Initialize trial with welcome message
    setMessages([
      {
        id: '1',
        content: `🎉 Welcome to your free trial!

I'm your AI-powered ЕНТ prep assistant. Let's start by understanding your goals:

• What subjects do you want to focus on?
• When is your ЕНТ exam date?
• What's your target score?

I'll create a personalized study plan just for you!`,
        role: 'assistant',
        timestamp: new Date(),
        actions: [
          { label: '📚 Start Subject Assessment', action: () => setCurrentView('tests') },
          { label: '🎯 Set My Goals', action: () => setInputValue('Помоги мне поставить цели для подготовки к ЕНТ') },
          { label: '📊 Show Sample Progress', action: () => setCurrentView('profile') }
        ]
      }
    ]);
  };

  const handleSignUp = () => {
    setCurrentView('auth');
  };

  const handleViewPricing = () => {
    // Implement pricing modal or page
    console.log('View pricing');
  };

  // Redirect logic for protected views
  if (!user && (currentView === 'tests' || currentView === 'profile')) {
    setCurrentView('auth');
  }

  // Show landing page for non-authenticated users
  if (!user && currentView === 'landing') {
    return <Landing 
      onStartTrial={handleStartTrial} 
      onSignUp={handleSignUp}
      onViewPricing={handleViewPricing}
    />;
  }

  return (
        <div className="min-h-screen fancy-bg text-white flex relative overflow-hidden" role="application">
          <a href="#main" className="skip-link-accessible">Перейти к основному содержимому</a>
          {/* Fancy Particle Background */}
          <div className="particles-fancy">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="particle-fancy" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Fancy Sidebar - Hidden for trial users */}
          {currentView !== 'trial' && (
          <div id="side-navigation" role="navigation" aria-label="Основное меню" className={`fixed inset-y-0 left-0 z-50 w-64 fancy-card nav-fancy border-r border-white/10 transform transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-64 lg:flex-shrink-0`}>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="heading-secondary text-fancy-gradient animate-fancy-fade-in">
                      EduPlatform
                    </h1>
                    <p className="text-xs text-fancy-glow">Next-Gen Learning</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`w-full card-nav ${
                    currentView === 'chat' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <MessageCircle className="icon-md" />
                  <span className="nav-text">{t('app.aiAssistant')}</span>
                </button>

                <button
                  onClick={() => setCurrentView('tests')}
                  className={`w-full card-nav ${
                    currentView === 'tests' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Brain className="icon-md" />
                  <span className="nav-text">{t('app.tests')}</span>
                </button>

                {user && (
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={`w-full card-nav ${
                      currentView === 'profile' 
                        ? 'active' 
                        : ''
                    }`}
                  >
                    <BarChart3 className="icon-md" />
                    <span className="nav-text">{t('app.progress')}</span>
                  </button>
                )}
                {/* Teacher diary */}
                <button
                  onClick={() => setCurrentView('diary')}
                  className={`w-full card-nav ${
                    currentView === 'diary' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <BookOpen className="icon-md" />
                  <span className="nav-text">{t('app.teacherDiary')}</span>
                </button>
              </nav>

              {/* User section */}
              <div className="p-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 fancy-card hover-fancy-glow">
                      <div className="ai-avatar-fancy h-8 w-8">
                        <User className="icon-container" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage(language === 'ru' ? 'kz' : 'ru')}
                        className="flex-1 btn-fancy-sunset text-sm"
                      >
                        <Globe className="icon-sm" />
                        <span>{language.toUpperCase()}</span>
                      </button>
                      <div className="flex items-center justify-center px-2">
                        <ThemeToggle />
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex-1 btn-fancy text-sm"
                      >
                        <LogOut className="icon-sm" />
                        <span>{t('app.logout')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentView('auth')}
                    className="w-full btn-fancy-neon"
                  >
                    <User className="icon-md" />
                    <span>{t('app.login')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Fancy Mobile menu button - Hidden for trial users */}
          {currentView !== 'trial' && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-3 fancy-card hover-fancy-glow"
            aria-label="Открыть меню"
            aria-controls="side-navigation"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="icon-lg" /> : <Menu className="icon-lg" />}
          </button>
          )}

          {/* Main Content */}
          <div id="main" className="flex-1 flex flex-col lg:ml-0 min-w-0" role="main">
            {(currentView === 'chat' || currentView === 'trial') ? (
              <>
                {/* Chat Header - Simplified */}
                <div className="chat-header-consolidated">
                  <div>
                    <div className="chat-title">
                      {currentView === 'trial' ? t('app.trialStarted') : t('app.personalAI')}
                    </div>
                    <div className="chat-subtitle">
                      {currentView === 'trial' ? t('app.boostScore') : t('app.readyToHelp')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="card-interactive px-3 py-1.5 text-xs"
                        title={action.label}
                      >
                        <span>{action.icon}</span>
                        <span className="hidden sm:inline ml-1">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fancy Messages */}
                <ScrollArea className="flex-1 p-6 bg-grid-subtle">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 chat-message animate-fancy-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {message.role === 'assistant' && (
                          <div className="ai-avatar-fancy h-8 w-8">
                            <Bot className="icon-container" />
                          </div>
                        )}
                        <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                          <div
                            className={`px-4 py-3 ${
                              message.role === 'user'
                                ? 'card-message user'
                                : 'card-message assistant'
                            }`}
                          >
                            {message.isTyping ? (
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          {message.actions && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={action.action}
                                  className="achievement-fancy text-xs"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <div className="h-8 w-8 order-2 ai-avatar-fancy bg-gradient-to-r from-green-500 to-teal-500">
                            <User className="icon-container" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Fancy Input */}
                <div className="nav-fancy border-t border-white/10 p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                      <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chat.placeholder')}
                        disabled={isLoading}
                        className="flex-1 input-fancy"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="btn-fancy-neon px-6"
                      >
                        <Send className="icon-md" />
                      </button>
                    </div>
                    {/* Suggestions */}
                    {!isLoading && inputValue.length === 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          t('chat.suggestions.improve'),
                          t('chat.suggestions.explain'),
                          t('chat.suggestions.plan'),
                          t('chat.suggestions.analyze')
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputValue(suggestion)}
                            className="px-3 py-1.5 fancy-card hover-fancy-glow text-sm text-gray-300 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : currentView === 'auth' ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <Auth />
              </div>
            ) : currentView === 'tests' ? (
              <div className="flex-1 overflow-auto">
                <Tests />
              </div>
            ) : currentView === 'profile' ? (
              <div className="flex-1 overflow-auto">
                <Profile />
              </div>
            ) : currentView === 'diary' ? (
              <div className="flex-1 overflow-auto">
                <TeacherDashboard />
              </div>
            ) : null}
          </div>

          <Toaster 
            position="top-right" 
            expand={true}
            richColors={true}
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }
            }}
          />
        </div>
  );
}

export default App;