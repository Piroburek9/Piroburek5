import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ProgressWithContext, SubjectProgressCard } from '../ui/enhanced-progress';
import { 
  User, 
  Trophy, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface UserStats {
  testsCompleted: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  studyTime: number;
  streak: number;
  rank: string;
  achievements: string[];
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the server
    const fetchUserStats = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStats: UserStats = {
          testsCompleted: 12,
          averageScore: 87,
          totalQuestions: 60,
          correctAnswers: 52,
          studyTime: 145, // minutes
          streak: 5,
          rank: 'Продвинутый',
          achievements: [
            'Первый тест',
            'Серия из 5 тестов',
            'Мастер математики',
            'Эксперт по литературе'
          ]
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Ошибка загрузки данных профиля</p>
        </div>
      </div>
    );
  }

  const getRoleTranslation = (role: string) => {
    switch (role) {
      case 'student': return t('auth.student');
      case 'teacher': return t('auth.teacher');
      case 'tutor': return t('auth.tutor');
      default: return role;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const accuracyPercentage = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('profile.title')}
          </h1>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">
                    {getRoleTranslation(user?.role || 'student')}
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-4 w-4 mr-1" />
                    {stats.rank}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.streak}
                </div>
                <div className="text-sm text-gray-600">
                  дней подряд
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('profile.testsCompleted')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.testsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                +2 за последнюю неделю
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('profile.averageScore')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                +5% по сравнению с прошлым месяцем
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Точность ответов
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accuracyPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.correctAnswers} из {stats.totalQuestions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Время обучения
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(stats.studyTime / 60)}ч {stats.studyTime % 60}м</div>
              <p className="text-xs text-muted-foreground">
                за этот месяц
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress and Achievements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{t('profile.progress')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressWithContext
                  subject="Математика"
                  current={37}
                  target={40}
                  percentage={92}
                  unit="вопросов"
                  timeSpent={85}
                  lastActivity="2 часа назад"
                />
                <ProgressWithContext
                  subject="Литература"
                  current={34}
                  target={40}
                  percentage={85}
                  unit="вопросов"
                  timeSpent={72}
                  lastActivity="вчера"
                />
                <ProgressWithContext
                  subject="География"
                  current={31}
                  target={40}
                  percentage={78}
                  unit="вопросов"
                  timeSpent={45}
                  lastActivity="3 дня назад"
                />
                <ProgressWithContext
                  subject="История Казахстана"
                  current={26}
                  target={40}
                  percentage={65}
                  unit="вопросов"
                  timeSpent={38}
                  lastActivity="5 дней назад"
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Достижения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {stats.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="achievement-item"
                  >
                    <Trophy className="h-4 w-4 trophy-icon" />
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};