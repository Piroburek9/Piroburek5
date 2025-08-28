import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export type Language = 'ru' | 'kz';

interface ProgressTrackerProps {
  language: Language;
  userId: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ language, userId }) => {
  const subjectProgress = [
    { subject: language === 'ru' ? 'Математика' : 'Математика', progress: 85, tests: 5 },
    { subject: language === 'ru' ? 'Физика' : 'Физика', progress: 78, tests: 3 },
    { subject: language === 'ru' ? 'Химия' : 'Химия', progress: 92, tests: 4 },
    { subject: language === 'ru' ? 'Биология' : 'Биология', progress: 67, tests: 2 }
  ];

  const achievements = [
    { 
      title: language === 'ru' ? 'Первый тест' : 'Бірінші тест', 
      description: language === 'ru' ? 'Пройден первый тест' : 'Бірінші тест өтілді', 
      date: '01.01.2024', 
      icon: '🎯' 
    },
    { 
      title: language === 'ru' ? 'Отличник' : 'Үздік', 
      description: language === 'ru' ? 'Набрано 90+ баллов' : '90+ балл жиналды', 
      date: '03.01.2024', 
      icon: '🏆' 
    },
    { 
      title: language === 'ru' ? 'Упорство' : 'Табандылық', 
      description: language === 'ru' ? '5 дней подряд' : '5 күн қатар', 
      date: '05.01.2024', 
      icon: '🔥' 
    },
    { 
      title: language === 'ru' ? 'Эксперт' : 'Сарапшы', 
      description: language === 'ru' ? 'Изучено 3 предмета' : '3 пән игерілді', 
      date: '07.01.2024', 
      icon: '⭐' 
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Прогресс по предметам' : 'Пәндер бойынша прогресс'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {subject.tests} {language === 'ru' ? 'тестов' : 'тест'}
                    </span>
                    <Badge variant="outline">{subject.progress}%</Badge>
                  </div>
                </div>
                <Progress value={subject.progress} className="w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Достижения' : 'Жетістіктер'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};