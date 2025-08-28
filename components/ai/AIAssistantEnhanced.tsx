import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../utils/dataService';
import { Bot, Send, User, Sparkles, MessageCircle, X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
// Use motion one (tiny) for simple animations to avoid framer dependency
import { animate } from 'motion'
const motion = {
  div: (props: any) => <div {...props} />
}
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  isDemo?: boolean;
}

interface AIAssistantEnhancedProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistantEnhanced: React.FC<AIAssistantEnhancedProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я ваш ИИ-помощник для образовательной платформы. Я могу помочь вам с вопросами по тестам, объяснить сложные темы или дать советы по обучению. Чем могу помочь?',
      role: 'assistant',
      timestamp: new Date(),
      isDemo: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
      // Create context from user profile
      const context = user ? `
        Пользователь: ${user.name} (${user.role})
        Тестов пройдено: ${user.tests_completed || 0}
        Средний балл: ${user.average_score || 0}%
        Время изучения: ${user.total_study_time || 0} минут
      ` : '';

      const languageHint: 'ru' | 'kz' = /[әғқңөұүһі]|(сәлем|қалай|ия|жоқ|үй|тапсырма|талдау)/i.test(userMessage.content) ? 'kz' : 'ru';
      const systemHint = `Режим ассистента: отвечай кратко, структурировано и по шагам; используй язык пользователя (ru/kz). При запросе анализа теста дай сильные/слабые стороны и план практики. При запросе по ЕНТ предложи типовые задачи.`;
      const { response, isDemo } = await dataService.sendAIMessage(`${systemHint}\n\n${userMessage.content}`, context, languageHint);

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          isDemo
        }];
      });
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Fallback response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте позже или обратитесь к преподавателю.',
          role: 'assistant',
          timestamp: new Date(),
          isDemo: true
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

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="w-96 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">ИИ-Помощник</h3>
              <p className="text-xs opacity-90">
                {user ? `Помощь для ${user.name}` : 'Персональная поддержка'} (Демо)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-[340px]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                        <Bot className="w-4 h-4 text-white" />
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.isDemo && message.role === 'assistant' && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">Демо-режим</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600">
                        <User className="w-4 h-4 text-white" />
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            {/* Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-gray-200 focus:border-blue-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Smart suggestions */}
              {!isLoading && inputValue.length === 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'Как улучшить оценки?',
                    'Объясни тему',
                    'Советы по обучению'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">ИИ-помощник свёрнут</p>
            <p className="text-xs text-gray-500 mt-1">
              {user ? `Готов помочь ${user.name}` : 'Готов к общению'}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};