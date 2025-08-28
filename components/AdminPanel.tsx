import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Plus } from 'lucide-react';

export type Language = 'ru' | 'kz';

interface AdminPanelProps {
  language: Language;
  userId: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ language, userId }) => {
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: ''
  });
  const [message, setMessage] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.subject || newQuestion.options.some(opt => !opt)) {
      setMessage(language === 'ru' ? 'Пожалуйста, заполните все поля' : 'Барлық өрістерді толтырыңыз');
      return;
    }

    // Здесь был бы запрос к API для сохранения вопроса
    setMessage(language === 'ru' ? 'Вопрос успешно добавлен' : 'Сұрақ сәтті қосылды');
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      subject: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Панель администратора' : 'Әкімшілік панелі'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">
                {language === 'ru' ? 'Предмет' : 'Пән'}
              </Label>
              <Input
                id="subject"
                placeholder={language === 'ru' ? 'Введите предмет' : 'Пәнді енгізіңіз'}
                value={newQuestion.subject}
                onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">
                {language === 'ru' ? 'Текст вопроса' : 'Сұрақ мәтіні'}
              </Label>
              <Textarea
                id="question"
                placeholder={language === 'ru' ? 'Введите текст вопроса...' : 'Сұрақ мәтінін енгізіңіз...'}
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ru' ? 'Варианты ответов' : 'Жауап нұсқалары'}
              </Label>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`${language === 'ru' ? 'Вариант' : 'Нұсқа'} ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[index] = e.target.value;
                      setNewQuestion({...newQuestion, options: newOptions});
                    }}
                  />
                  <Button
                    type="button"
                    variant={newQuestion.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                  >
                    {newQuestion.correctAnswer === index 
                      ? (language === 'ru' ? 'Правильный' : 'Дұрыс')
                      : (language === 'ru' ? 'Выбрать' : 'Таңдау')}
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleAddQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ru' ? 'Добавить вопрос' : 'Сұрақ қосу'}
            </Button>
          </div>
          
          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};