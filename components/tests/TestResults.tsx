import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Question } from '../../utils/test-constants';
type TestResult = { score: number; total: number; percentage: number; answers: Array<{questionId: string; selectedAnswer: number; correct: boolean}> }
const getDifficultyColor = (difficulty: string) => difficulty === 'easy' ? 'bg-green-100 text-green-800' : difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface TestResultsProps {
  testResult: TestResult;
  questions: Question[];
  onResetTest: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  testResult,
  questions,
  onResetTest
}) => {
  const { t } = useLanguage();
  const passed = testResult.percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('tests.results')}
        </h1>
        <div className="text-6xl font-bold mb-4">
          {passed ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
        </div>
        <div className="text-4xl font-bold mb-2 text-gray-900">
          {testResult.score} / {testResult.total}
        </div>
        <div className="text-2xl mb-2">
          <span className={`font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.percentage}%
          </span>
        </div>
        <div className="text-lg text-gray-600">
          {passed ? 'Тест пройден успешно!' : 'Нужно больше подготовки'}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Правильные ответы</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {testResult.score}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Отличная работа! Продолжайте в том же духе.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center space-x-2">
              <XCircle className="h-5 w-5" />
              <span>Неправильные ответы</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {testResult.total - testResult.score}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Проанализируйте ошибки для улучшения результата.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Подробный анализ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResult.answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-lg border-l-4 ${
                    answer.correct
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        Ваш ответ: {question.options[answer.selectedAnswer]}
                      </p>
                      {!answer.correct && (
                        <p className="text-sm text-green-600">
                          Правильный ответ: {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{question.subject}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty === 'easy' ? 'Легкий' : 
                         question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                      </Badge>
                      {answer.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={onResetTest}
          size="lg"
          className="px-8 py-3"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Пройти еще раз
        </Button>
      </div>
    </div>
  );
};