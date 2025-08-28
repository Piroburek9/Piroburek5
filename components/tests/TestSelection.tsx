import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AIAssistant } from '../ai/AIAssistant';
import { Question } from '../../utils/test-constants';
import { PlayCircle, Brain, Target, TrendingUp, Award } from 'lucide-react';

interface TestSelectionProps {
  questions: Question[];
  onStartTest: () => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
}

export const TestSelection: React.FC<TestSelectionProps> = ({
  questions,
  onStartTest,
  showAIAssistant,
  setShowAIAssistant
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Тесты</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI-Помощник</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('tests.title')}
            </h1>
            <p className="text-lg text-gray-600">
              Добро пожаловать, {user?.name}! Выберите тест для прохождения.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Основной тест</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Вопросы:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Время:</span>
                    <span className="font-medium">{questions.length} мин</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Сложность:</span>
                    <Badge variant="secondary">Смешанная</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {Array.from(new Set(questions.map(q => q.subject))).map(subject => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={onStartTest}
                  size="lg"
                  className="w-full mt-4"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {t('tests.start')}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Тест с AI</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Адаптивный тест с помощью AI-помощника
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Вопросы:</span>
                    <span className="font-medium">Динамические</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Время:</span>
                    <span className="font-medium">Неограниченно</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    AI-Powered
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowAIAssistant(true)}
                  size="lg"
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Начать с AI
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Ваш прогресс</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Пройдено тестов:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Средний балл:</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Лучший результат:</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  size="lg"
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Award className="mr-2 h-5 w-5" />
                  Подробная статистика
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-assistant">
          <div className="max-w-4xl mx-auto">
            <AIAssistant />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};