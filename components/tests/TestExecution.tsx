import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Question } from '../../utils/test-constants';
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
import { Clock } from 'lucide-react';

interface TestExecutionProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  timeLeft: number;
  loading: boolean;
  onSelectAnswer: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onCancelTest: () => void;
}

export const TestExecution: React.FC<TestExecutionProps> = ({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  timeLeft,
  loading,
  onSelectAnswer,
  onNextQuestion,
  onCancelTest
}) => {
  const { t } = useLanguage();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('tests.question')} {currentQuestionIndex + 1} / {questions.length}
          </h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">{currentQuestion.subject}</Badge>
            {timeLeft > 0 && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full justify-start text-left p-4 h-auto"
                onClick={() => onSelectAnswer(index)}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={onCancelTest}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={onNextQuestion}
              disabled={selectedAnswer === null || loading}
            >
              {loading ? t('common.loading') : 
               currentQuestionIndex === questions.length - 1 ? t('tests.submit') : t('tests.next')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};