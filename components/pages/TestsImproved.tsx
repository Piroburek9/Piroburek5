import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TestSelection } from '../tests/TestSelection';
import { TestExecution } from '../tests/TestExecution';
import { TestResults } from '../tests/TestResults';
import { toast } from 'sonner';
import { apiService } from '../../utils/supabase/client';
import { Question, DEFAULT_QUESTIONS } from '../../utils/test-constants';
type UserAnswer = { questionId: string; selectedAnswer: number }
type TestResult = { score: number; total: number; percentage: number; answers: Array<{questionId: string; selectedAnswer: number; correct: boolean}> }

export const TestsImproved: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest(userAnswers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, userAnswers]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // In a real app, this would load from server
      setQuestions(DEFAULT_QUESTIONS);
    } catch (error) {
      toast.error('Ошибка при загрузке вопросов');
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setTestResult(null);
    setTimeLeft(questions.length * 60); // 1 minute per question
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error('Пожалуйста, выберите ответ');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer
    };

    const newAnswers = [...userAnswers, newAnswer];
    setUserAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = async (answers: UserAnswer[]) => {
    setLoading(true);
    setTestStarted(false);
    
    try {
      const results = answers.map(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        const correct = question ? question.correctAnswer === answer.selectedAnswer : false;
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correct
        };
      });

      const score = results.filter(r => r.correct).length;
      const total = questions.length;
      const percentage = Math.round((score / total) * 100);

      const result: TestResult = {
        score,
        total,
        percentage,
        answers: results
      };

      setTestResult(result);
      
      // Save to server if user is authenticated
      if (user) {
        try {
          const session = await apiService.getSession();
          if (session?.access_token) {
            await apiService.submitTestResult('test-generic', results as any, score, answers.length * 60);
          }
        } catch (error) {
          console.error('Error saving test result:', error);
        }
      }
      
      toast.success(`Тест завершен! Результат: ${score}/${total} (${percentage}%)`);
    } catch (error) {
      toast.error('Ошибка при завершении теста');
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setTestResult(null);
    setTimeLeft(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка тестов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {!testStarted && !testResult && (
        <TestSelection
          questions={questions}
          onStartTest={startTest}
          showAIAssistant={showAIAssistant}
          setShowAIAssistant={setShowAIAssistant}
        />
      )}

      {testStarted && (
        <TestExecution
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={selectedAnswer}
          timeLeft={timeLeft}
          loading={loading}
          onSelectAnswer={selectAnswer}
          onNextQuestion={nextQuestion}
          onCancelTest={resetTest}
        />
      )}

      {testResult && (
        <TestResults
          testResult={testResult}
          questions={questions}
          onResetTest={resetTest}
        />
      )}
    </div>
  );
};