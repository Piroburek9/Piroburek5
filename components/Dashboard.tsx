import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
const motion: any = { div: (p: any) => <div {...p} /> };

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const stats = [
    { 
      title: 'Пройдено тестов', 
      value: '12', 
      icon: BookOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: '+3 за неделю'
    },
    { 
      title: 'Средний балл', 
      value: '87%', 
      icon: Trophy, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      trend: '+5% улучшение'
    },
    { 
      title: 'Время обучения', 
      value: '24ч', 
      icon: Clock, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      trend: '8ч на неделе'
    },
    { 
      title: 'Прогресс', 
      value: '68%', 
      icon: TrendingUp, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      trend: '+12% за месяц'
    },
  ];

  const recentTests = [
    { name: 'Математика - Алгебра', score: 92, date: '2 дня назад', status: 'completed' },
    { name: 'История Казахстана', score: 85, date: '5 дней назад', status: 'completed' },
    { name: 'Физика - Механика', score: 78, date: '1 неделя назад', status: 'completed' },
  ];

  const upcomingTests = [
    { name: 'Химия - Основы', date: 'Завтра в 14:00', difficulty: 'Средний' },
    { name: 'Биология - Генетика', date: '3 дня', difficulty: 'Сложный' },
    { name: 'География мира', date: '1 неделя', difficulty: 'Легкий' },
  ];

  const achievements = [
    { title: 'Первый тест', description: 'Завершили первый тест', earned: true },
    { title: 'Отличник', description: '5 тестов с оценкой 90+', earned: true },
    { title: 'Быстрый ученик', description: 'Завершили тест за 10 минут', earned: false },
    { title: 'Эксперт', description: '50 завершенных тестов', earned: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Добро пожаловать, {user?.name}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Готовы продолжить обучение? Давайте посмотрим на ваш прогресс.
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
            {user?.role === 'student' ? 'Студент' : user?.role === 'teacher' ? 'Учитель' : 'Тьютор'}
          </Badge>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"></div>
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {stat.trend}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Последние тесты</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{test.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{test.date}</p>
                    </div>
                    <Badge 
                      className={`${
                        test.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        test.score >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}
                    >
                      {test.score}%
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все результаты
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Предстоящие тесты</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTests.map((test, index) => (
                  <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{test.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{test.date}</p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`${
                          test.difficulty === 'Легкий' ? 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400' :
                          test.difficulty === 'Средний' ? 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400' :
                          'border-red-300 text-red-700 dark:border-red-600 dark:text-red-400'
                        }`}
                      >
                        {test.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                  <Target className="w-4 h-4 mr-2" />
                  Начать новый тест
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Достижения</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border transition-all ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-yellow-500' : 'bg-slate-400'}`}>
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${achievement.earned ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {achievement.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все достижения
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Общий прогресс</CardTitle>
                  <CardDescription>Ваш путь к мастерству</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Математика</span>
                  <span className="text-sm text-slate-500">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">История</span>
                  <span className="text-sm text-slate-500">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Физика</span>
                  <span className="text-sm text-slate-500">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}