import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';

export type Language = 'ru' | 'kz';

interface TestInterfaceProps {
  language: Language;
  userId: string;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({ language, userId }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const sampleQuestions = [
    {
      id: '1',
      text: language === 'ru' ? 'Сколько будет 2 + 2?' : '2 + 2 неше болады?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4'
    },
    {
      id: '2',
      text: language === 'ru' ? 'Столица Казахстана?' : 'Қазақстанның астанасы?',
      options: ['Алматы', 'Нұр-Сұлтан', 'Шымкент', 'Астана'],
      correctAnswer: 'Астана'
    },
    {
      id: '3',
      text: language === 'ru' ? 'Какой цвет получится при смешивании синего и желтого?' : 'Көк пен сары түстерді араластырсаңыз қандай түс шығады?',
      options: [
        language === 'ru' ? 'Зеленый' : 'Жасыл',
        language === 'ru' ? 'Фиолетовый' : 'Көк',
        language === 'ru' ? 'Красный' : 'Қызыл',
        language === 'ru' ? 'Оранжевый' : 'Қызғылт сары'
      ],
      correctAnswer: language === 'ru' ? 'Зеленый' : 'Жасыл'
    }
  ];

  const handleStartTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setTestCompleted(false);
    setScore(0);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setTestCompleted(true);
    }
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  if (!testStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'ru' ? 'Тестирование' : 'Тестілеу'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ru' ? 'Информация о тесте' : 'Тест туралы ақпарат'}
              </h3>
              <div className="space-y-2 text-sm">
                <p>• {language === 'ru' ? 'Количество вопросов:' : 'Сұрақтар саны:'} {sampleQuestions.length}</p>
                <p>• {language === 'ru' ? 'Время: неограниченно' : 'Уақыт: шектеусіз'}</p>
                <p>• {language === 'ru' ? 'Можно пропускать вопросы' : 'Сұрақтарды өткізуге болады'}</p>
              </div>
            </div>
            <Button onClick={handleStartTest} size="lg" className="w-full md:w-auto">
              {language === 'ru' ? 'Начать тест' : 'Тестті бастау'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (testCompleted) {
    const percentage = Math.round((score / sampleQuestions.length) * 100);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'ru' ? 'Результаты теста' : 'Тест нәтижелері'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {percentage}%
              </div>
              <p className="text-lg">
                {language === 'ru' 
                  ? `Правильных ответов: ${score} из ${sampleQuestions.length}`
                  : `Дұрыс жауаптар: ${score} дан ${sampleQuestions.length}`}
              </p>
            </div>
            
            <Button 
              onClick={handleStartTest}
              className="w-full md:w-auto"
            >
              {language === 'ru' ? 'Пройти тест заново' : 'Тестті қайта өту'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = sampleQuestions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {language === 'ru' ? 'Вопрос' : 'Сұрақ'} {currentQuestion + 1} {language === 'ru' ? 'из' : 'дан'} {sampleQuestions.length}
          </CardTitle>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">{question.text}</h3>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 hover:bg-white rounded">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <div></div>
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
            >
              {currentQuestion === sampleQuestions.length - 1 
                ? (language === 'ru' ? 'Завершить' : 'Аяқтау')
                : (language === 'ru' ? 'Далее' : 'Келесі')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};