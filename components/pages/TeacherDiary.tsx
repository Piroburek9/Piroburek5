import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Plus, 
  Download, 
  MessageSquare, 
  Target, 
  Award, 
  Clock, 
  BarChart3, 
  PieChart, 
  LineChart,
  User,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { dataService } from '../../utils/dataService';

export const TeacherDiary: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState<'11A' | '11B'>('11A');
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newEntryRating, setNewEntryRating] = useState(0);
  const [attempts, setAttempts] = useState(dataService.getAttempts());

  const AttemptList: React.FC = () => {
    const items = attempts;
    if (!items.length) return <p className="text-gray-500">Нет сохранённых попыток.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Дата</th>
              <th className="py-2 pr-3">Название</th>
              <th className="py-2 pr-3">Предмет</th>
              <th className="py-2 pr-3">Вопросов</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-3 whitespace-nowrap">{new Date(a.created_at).toLocaleString('ru-RU')}</td>
                <td className="py-2 pr-3">{a.title}</td>
                <td className="py-2 pr-3">{a.subjectKey}</td>
                <td className="py-2 pr-3">{a.questions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const translations = {
    ru: {
      dashboard: 'Дашборд учителя',
      overview: 'Обзор',
      students: 'Ученики',
      diary: 'Дневник',
      tests: 'Тесты',
      reports: 'Отчеты',
      myClasses: 'Мои классы',
      totalStudents: 'Всего учеников',
      activeTests: 'Активные тесты',
      avgScore: 'Средний балл',
      improvement: 'Улучшение',
      recentActivity: 'Последняя активность',
      topPerformers: 'Лучшие ученики',
      weakAreas: 'Слабые области',
      createTest: 'Создать тест',
      viewDetails: 'Подробнее',
      performance: 'Успеваемость',
      progress: 'Прогресс',
      recommendations: 'Рекомендации',
      export: 'Экспорт',
      studentName: 'Имя ученика',
      lastTest: 'Последний тест',
      score: 'Балл',
      trend: 'Тенденция',
      subjects: 'Предметы',
      mathematics: 'Математика',
      physics: 'Физика',
      chemistry: 'Химия',
      biology: 'Биология',
      welcome: 'Добро пожаловать',
      addEntry: 'Добавить запись',
      lessonDiary: 'Дневник уроков',
      lessonNotes: 'Заметки о уроке:',
      homework: 'Домашнее задание:',
      studentsAttended: 'учеников присутствовало',
      minutes: 'минут',
      edit: 'Редактировать',
      copy: 'Копировать',
      sendMessage: 'Отправить сообщение',
      classSelection: 'Класс',
      understanding: 'понимания',
      months: 'по месяцам',
      distribution: 'Распределение по предметам',
      aiRecommendations: 'AI Рекомендации для класса',
      strengths: 'Сильные стороны',
      improvements: 'Области для улучшения',
      goodAlgebra: 'Хорошее понимание алгебры',
      stableGeometry: 'Стабильный прогресс в геометрии',
      activeParticipation: 'Активное участие в тестах',
      needIntegrals: 'Нужна дополнительная работа с интегралами',
      improveAccuracy: 'Повысить точность в вычислениях',
      morePhysics: 'Больше практики по физике',
      exportExcel: 'Экспорт в Excel',
      createPdf: 'Создать PDF',
      testManagement: 'Управление тестами',
      createManageTests: 'Создавайте и управляйте тестами для ваших учеников',
      reportsAnalytics: 'Отчеты и аналитика',
      generateReports: 'Генерируйте подробные отчеты о прогрессе учеников',
      actions: 'Действия'
    },
    kz: {
      dashboard: 'Мұғалім дашборды',
      overview: 'Шолу',
      students: 'Оқушылар',
      diary: 'Күнделік',
      tests: 'Тестілер',
      reports: 'Есептер',
      myClasses: 'Менің сыныптарым',
      totalStudents: 'Барлық оқушылар',
      activeTests: 'Белсенді тестілер',
      avgScore: 'Орташа балл',
      improvement: 'Жақсару',
      recentActivity: 'Соңғы белсенділік',
      topPerformers: 'Үздік оқушылар',
      weakAreas: 'Әлсіз салалар',
      createTest: 'Тест жасау',
      viewDetails: 'Толығырақ',
      performance: 'Үлгерім',
      progress: 'Прогресс',
      recommendations: 'Ұсыныстар',
      export: 'Экспорт',
      studentName: 'Оқушы аты',
      lastTest: 'Соңғы тест',
      score: 'Балл',
      trend: 'Үрдіс',
      subjects: 'Пәндер',
      mathematics: 'Математика',
      physics: 'Физика',
      chemistry: 'Химия',
      biology: 'Биология',
      welcome: 'Қош келдіңіз',
      addEntry: 'Жаңа жазба қосу',
      lessonDiary: 'Сабақ күнделігі',
      lessonNotes: 'Сабақ туралы жазба:',
      homework: 'Үй тапсырмасы:',
      studentsAttended: 'оқушы қатысты',
      minutes: 'минут',
      edit: 'Өзгерту',
      copy: 'Көшіру',
      sendMessage: 'Хабарлама жіберу',
      classSelection: 'Сынып',
      understanding: 'түсіну',
      months: 'айлар бойынша',
      distribution: 'Пәндер бойынша үлестіру',
      aiRecommendations: 'Сынып үшін AI ұсыныстары',
      strengths: 'Күшті жақтары',
      improvements: 'Жақсарту салалары',
      goodAlgebra: 'Алгебраны жақсы түсіну',
      stableGeometry: 'Геометрияда тұрақты прогресс',
      activeParticipation: 'Тестілерге белсенді қатысу',
      needIntegrals: 'Интегралдармен қосымша жұмыс керек',
      improveAccuracy: 'Есептеулердегі дәлдікті арттыру',
      morePhysics: 'Физика бойынша көбірек жаттығу',
      exportExcel: 'Excel-ге экспорт',
      createPdf: 'PDF жасау',
      testManagement: 'Тестілерді басқару',
      createManageTests: 'Оқушыларыңыз үшін тестілер жасаңыз және басқарыңыз',
      reportsAnalytics: 'Есептер мен аналитика',
      generateReports: 'Оқушылардың прогресі туралы толық есептер жасаңыз',
      actions: 'Әрекеттер'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.kz;

  // Обработчики кнопок
  const handleCreateTest = () => {
    setShowCreateTest(true);
    toast.info(language === 'kz' ? 'Тест жасау терезесі ашылды' : 'Открыто окно создания теста');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    setShowExportDialog(false);
    toast.success(
      language === 'kz' 
        ? `${format.toUpperCase()} форматында экспорт басталды`
        : `Начался экспорт в формате ${format.toUpperCase()}`
    );
    // Здесь будет логика экспорта
    setTimeout(() => {
      toast.success(
        language === 'kz' 
          ? 'Файл сәтті жүктелді!'
          : 'Файл успешно загружен!'
      );
    }, 2000);
  };

  const handleSendMessage = (studentId?: number) => {
    if (studentId) {
      const student = studentData.find(s => s.id === studentId);
      toast.success(
        language === 'kz' 
          ? `${student?.name} оқушысына хабарлама жіберілді`
          : `Сообщение отправлено ученику ${student?.name}`
      );
    } else {
      toast.success(
        language === 'kz' 
          ? `${selectedClass} сыныбына хабарлама жіберілді`
          : `Сообщение отправлено классу ${selectedClass}`
      );
    }
    setShowMessageDialog(false);
  };

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    toast.info(
      language === 'kz' 
        ? `${student.name} оқушысының мәліметтері ашылды`
        : `Открыта информация об ученике ${student.name}`
    );
  };

  const handleAddDiaryEntry = () => {
    setShowAddEntry(true);
    toast.info(
      language === 'kz' 
        ? 'Жаңа күнделік жазбасын қосу'
        : 'Добавление новой записи в дневник'
    );
  };

  const handleEditEntry = (entryId: number) => {
    toast.info(
      language === 'kz' 
        ? `${entryId} жазбасын өңдеу`
        : `Редактирование записи ${entryId}`
    );
  };

  const handleCopyEntry = (entryId: number) => {
    toast.success(
      language === 'kz' 
        ? 'Жазба буферге көшірілді'
        : 'Запись скопирована в буфер'
    );
  };

  // Тестовые данные
  const classData: Record<'11A'|'11B', { students: number; avgScore: number; improvement: string; recentTests: Array<{id:number; name:string; completed:number; avg:number}> }> = {
    '11A': {
      students: 28,
      avgScore: 75,
      improvement: '+8%',
      recentTests: [
        { id: 1, name: t.mathematics, completed: 25, avg: 78 },
        { id: 2, name: t.physics, completed: 23, avg: 72 },
        { id: 3, name: t.chemistry, completed: 27, avg: 80 }
      ]
    },
    '11B': {
      students: 26,
      avgScore: 71,
      improvement: '+5%',
      recentTests: [
        { id: 1, name: t.mathematics, completed: 24, avg: 73 },
        { id: 2, name: t.physics, completed: 22, avg: 69 },
        { id: 3, name: t.biology, completed: 25, avg: 75 }
      ]
    }
  };

  const studentData = [
    { id: 1, name: 'Айжан Сейітова', lastTest: t.mathematics, score: 92, trend: 'up', avatar: '👩' },
    { id: 2, name: 'Данияр Нұрланов', lastTest: t.physics, score: 88, trend: 'up', avatar: '👨' },
    { id: 3, name: 'Камила Жанбекова', lastTest: t.chemistry, score: 85, trend: 'stable', avatar: '👩' },
    { id: 4, name: 'Арман Досов', lastTest: t.mathematics, score: 82, trend: 'down', avatar: '👨' },
    { id: 5, name: 'Диана Абдуллина', lastTest: t.biology, score: 79, trend: 'up', avatar: '👩' }
  ];

  const weakAreas = [
    { 
      topic: language === 'kz' ? 'Интегралдар' : 'Интегралы', 
      percentage: 45, 
      subject: t.mathematics 
    },
    { 
      topic: language === 'kz' ? 'Электродинамика' : 'Электродинамика', 
      percentage: 52, 
      subject: t.physics 
    },
    { 
      topic: language === 'kz' ? 'Органикалық химия' : 'Органическая химия', 
      percentage: 58, 
      subject: t.chemistry 
    }
  ];

  const diaryEntries = [
    {
      id: 1,
      date: '2024-12-19',
      subject: t.mathematics,
      topic: language === 'kz' ? 'Интегралдар' : 'Интегралы',
      studentsPresent: 26,
      studentsTotal: 28,
      notes: language === 'kz' 
        ? 'Оқушылар интегралдарды жақсы түсінді. Данияр мен Айжан белсенді қатысты.'
        : 'Ученики хорошо поняли интегралы. Данияр и Айжан активно участвовали.',
      homework: language === 'kz' 
        ? 'Тапсырма №145-150, интегралдарды есептеу'
        : 'Задание №145-150, вычисление интегралов',
      rating: 4
    },
    {
      id: 2,
      date: '2024-12-18',
      subject: t.physics,
      topic: language === 'kz' ? 'Электромагниттік индукция' : 'Электромагнитная индукция',
      studentsPresent: 24,
      studentsTotal: 28,
      notes: language === 'kz' 
        ? 'Тақырып қиын болды. Қосымша түсіндіру керек.'
        : 'Тема была сложной. Нужно дополнительное объяснение.',
      homework: language === 'kz' 
        ? 'Тапсырма №67-70, Фарадей заңы'
        : 'Задание №67-70, закон Фарадея',
      rating: 3
    },
    {
      id: 3,
      date: '2024-12-17',
      subject: t.chemistry,
      topic: language === 'kz' ? 'Органикалық қосылыстар' : 'Органические соединения',
      studentsPresent: 27,
      studentsTotal: 28,
      notes: language === 'kz' 
        ? 'Зертханалық жұмыс жақсы өтті. Барлық оқушылар тәжірибеге қатысты.'
        : 'Лабораторная работа прошла хорошо. Все ученики участвовали в эксперименте.',
      homework: language === 'kz' 
        ? 'Реакция теңдеулерін жазу'
        : 'Написать уравнения реакций',
      rating: 5
    }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t.totalStudents}</p>
                <p className="text-3xl font-bold">{classData[selectedClass].students}</p>
              </div>
              <Users size={40} className="text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{t.avgScore}</p>
                <p className="text-3xl font-bold">{classData[selectedClass].avgScore}%</p>
              </div>
              <Target size={40} className="text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{t.activeTests}</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <BookOpen size={40} className="text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">{t.improvement}</p>
                <p className="text-3xl font-bold">{classData[selectedClass].improvement}</p>
              </div>
              <TrendingUp size={40} className="text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Последняя активность */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t.recentActivity}</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Download size={16} className="mr-2" />
                {t.export}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classData[selectedClass].recentTests.map((test: {id:number; name:string; completed:number; avg:number}) => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{test.name}</h4>
                      <p className="text-sm text-gray-600">
                        {test.completed} {language === 'kz' ? 'ден' : 'из'} {classData[selectedClass].students} {language === 'kz' ? 'орындады' : 'выполнили'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{test.avg}%</p>
                    <p className="text-sm text-gray-600">{language === 'kz' ? 'орташа балл' : 'средний балл'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Лучшие ученики */}
        <Card>
          <CardHeader>
            <CardTitle>{t.topPerformers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentData.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="text-2xl">{student.avatar}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.score}%</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full ${
                    student.trend === 'up' ? 'bg-green-100' : 
                    student.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <TrendingUp size={16} className={`m-1 ${
                      student.trend === 'up' ? 'text-green-600' : 
                      student.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Слабые области */}
      <Card>
        <CardHeader>
          <CardTitle>{t.weakAreas}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weakAreas.map((area, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{area.topic}</h4>
                  <span className="text-sm text-gray-600">{area.subject}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${area.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{area.percentage}% {t.understanding}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t.students} - {selectedClass}</CardTitle>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMessageDialog(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <MessageSquare size={16} className="mr-2" />
              {t.sendMessage}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Download size={16} className="mr-2" />
              {t.export}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.studentName}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.lastTest}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.score}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.trend}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{student.avatar}</div>
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{student.lastTest}</td>
                  <td className="py-4 px-4">
                    <Badge variant={
                      student.score >= 85 ? 'default' :
                      student.score >= 70 ? 'secondary' : 'destructive'
                    }>
                      {student.score}%
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      student.trend === 'up' ? 'bg-green-100' : 
                      student.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <TrendingUp size={16} className={`${
                        student.trend === 'up' ? 'text-green-600' : 
                        student.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                      }`} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(student)}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-700"
                    >
                      {t.viewDetails}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderDiaryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t.lessonDiary}</h2>
        <Button onClick={handleAddDiaryEntry} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />
          {t.addEntry}
        </Button>
      </div>

      <div className="grid gap-6">
        {diaryEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{entry.subject} - {entry.topic}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    <Calendar size={14} className="inline mr-1" />
                    {entry.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={`${i < entry.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <Badge variant="outline">
                    {entry.studentsPresent}/{entry.studentsTotal}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{t.lessonNotes}</h4>
                  <p className="text-gray-600">{entry.notes}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{t.homework}</h4>
                  <p className="text-gray-600">{entry.homework}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users size={14} />
                      {entry.studentsPresent} {t.studentsAttended}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={14} />
                      45 {t.minutes}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEntry(entry.id)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {t.edit}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyEntry(entry.id)}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      {t.copy}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTestsTab = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.testManagement}</h3>
        <p className="text-gray-600 mb-6">{t.createManageTests}</p>
        <Button onClick={handleCreateTest} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={20} className="mr-2" />
          {t.createTest}
        </Button>
      </CardContent>
    </Card>
  );

  const renderReportsTab = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <Download size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.reportsAnalytics}</h3>
        <p className="text-gray-600 mb-6">{t.generateReports}</p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t.exportExcel}
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExport('pdf')}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t.createPdf}
          </Button>
        </div>
        {/* Attempt list (spec reports) */}
        <div className="mt-8 text-left">
          <h4 className="text-lg font-semibold mb-3">Специальные попытки (ЕНТ спецификации)</h4>
          <AttemptList />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t.dashboard}</h1>
            <p className="text-gray-300 mt-1">{t.welcome}, {user?.name || 'Айгүл Серікова'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Переключатель класса */}
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as '11A' | '11B')}
              className="px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={language==='kz'?'Сыныпты таңдау':'Выбор класса'}
            >
              <option value="11A">{language === 'kz' ? 'Сынып 11А' : 'Класс 11А'}</option>
              <option value="11B">{language === 'kz' ? 'Сынып 11Б' : 'Класс 11Б'}</option>
            </select>

            {/* Переключатель языка */}
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'ru' ? 'kz' : 'ru')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              aria-label={language==='ru'?'Сменить язык на KZ':'Тілді RU-ға ауыстыру'}
            >
              {language === 'ru' ? 'ҚAZ' : 'RUS'}
            </Button>

            {/* Кнопка создания теста */}
            <Button onClick={handleCreateTest} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus size={20} className="mr-2" />
              {t.createTest}
            </Button>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-2xl p-2 shadow-lg" role="tablist" aria-label={language==='kz'?'Навигация мұғалім панелі':'Навигация панели учителя'}>
          {[
            { id: 'overview', label: t.overview, icon: BarChart3 },
            { id: 'students', label: t.students, icon: Users },
            { id: 'diary', label: t.diary, icon: BookOpen },
            { id: 'tests', label: t.tests, icon: PieChart },
            { id: 'reports', label: t.reports, icon: LineChart }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Основной контент */}
        <div>
          <section role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={activeTab !== 'overview'}>
            {activeTab === 'overview' && renderOverviewTab()}
          </section>
          <section role="tabpanel" id="panel-students" aria-labelledby="tab-students" hidden={activeTab !== 'students'}>
            {activeTab === 'students' && renderStudentsTab()}
          </section>
          <section role="tabpanel" id="panel-diary" aria-labelledby="tab-diary" hidden={activeTab !== 'diary'}>
            {activeTab === 'diary' && renderDiaryTab()}
          </section>
          <section role="tabpanel" id="panel-tests" aria-labelledby="tab-tests" hidden={activeTab !== 'tests'}>
            {activeTab === 'tests' && renderTestsTab()}
          </section>
          <section role="tabpanel" id="panel-reports" aria-labelledby="tab-reports" hidden={activeTab !== 'reports'}>
            {activeTab === 'reports' && renderReportsTab()}
          </section>
        </div>
      </div>

      {/* Модальные окна */}
      
      {/* Диалог создания теста */}
      {showCreateTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t.createTest}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'kz' ? 'Тест атауы' : 'Название теста'}
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder={language === 'kz' ? 'Мысалы: Математика - Интегралдар' : 'Например: Математика - Интегралы'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'kz' ? 'Пәні' : 'Предмет'}
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="mathematics">{t.mathematics}</option>
                  <option value="physics">{t.physics}</option>
                  <option value="chemistry">{t.chemistry}</option>
                  <option value="biology">{t.biology}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowCreateTest(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {language === 'kz' ? 'Бас тарту' : 'Отмена'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateTest(false);
                    toast.success(
                      language === 'kz' 
                        ? `${selectedClass} сыныбы үшін тест жасалды`
                        : `Тест создан для класса ${selectedClass}`
                    );
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {language === 'kz' ? 'Жасау' : 'Создать'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Диалог экспорта */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{t.export}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {language === 'kz' ? 'Экспорт форматын таңдаңыз:' : 'Выберите формат экспорта:'}
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => handleExport('excel')}
                  variant="outline"
                  className="justify-start"
                >
                  <Download size={16} className="mr-2" />
                  {t.exportExcel}
                </Button>
                <Button 
                  onClick={() => handleExport('pdf')}
                  variant="outline"
                  className="justify-start"
                >
                  <Download size={16} className="mr-2" />
                  {t.createPdf}
                </Button>
              </div>
              <Button 
                onClick={() => setShowExportDialog(false)}
                variant="ghost"
                className="w-full"
              >
                {language === 'kz' ? 'Жабу' : 'Закрыть'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Диалог отправки сообщения */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t.sendMessage}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'kz' ? 'Хабарлама мәтіні' : 'Текст сообщения'}
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                  placeholder={language === 'kz' ? 'Хабарламаңызды жазыңыз...' : 'Напишите ваше сообщение...'}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowMessageDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {language === 'kz' ? 'Бас тарту' : 'Отмена'}
                </Button>
                <Button 
                  onClick={() => handleSendMessage()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {language === 'kz' ? 'Жіберу' : 'Отправить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Диалог добавления записи в дневник */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{t.addEntry}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'kz' ? 'Пәні' : 'Предмет'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="mathematics">{t.mathematics}</option>
                    <option value="physics">{t.physics}</option>
                    <option value="chemistry">{t.chemistry}</option>
                    <option value="biology">{t.biology}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'kz' ? 'Тақырып' : 'Тема'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={language === 'kz' ? 'Сабақ тақырыбы' : 'Тема урока'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.lessonNotes}</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder={language === 'kz' ? 'Сабақ туралы жазбаңыз...' : 'Ваши заметки о уроке...'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.homework}</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20"
                  placeholder={language === 'kz' ? 'Үй тапсырмасы...' : 'Домашнее задание...'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'kz' ? 'Қатысқан оқушылар' : 'Присутствовало учеников'}
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max={classData[selectedClass].students}
                    defaultValue={classData[selectedClass].students}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'kz' ? 'Сабақ бағасы' : 'Оценка урока'}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewEntryRating(rating)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={20} 
                          className={`${
                            rating <= newEntryRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 hover:text-yellow-400'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowAddEntry(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {language === 'kz' ? 'Бас тарту' : 'Отмена'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddEntry(false);
                    toast.success(
                      language === 'kz' 
                        ? 'Күнделік жазбасы сәтті қосылды'
                        : 'Запись в дневник успешно добавлена'
                    );
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {language === 'kz' ? 'Сақтау' : 'Сохранить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Диалог деталей ученика */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedStudent.avatar}</div>
                  <div>
                    <CardTitle>{selectedStudent.name}</CardTitle>
                    <p className="text-gray-600">{language === 'kz' ? 'Оқушы мәліметтері' : 'Информация об ученике'}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{language === 'kz' ? 'Соңғы нәтижелер' : 'Последние результаты'}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>{t.mathematics}</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.physics}</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.chemistry}</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">{language === 'kz' ? 'Статистика' : 'Статистика'}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>{language === 'kz' ? 'Тестілер саны' : 'Количество тестов'}</span>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'kz' ? 'Орташа балл' : 'Средний балл'}</span>
                      <span className="font-medium">{selectedStudent.score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'kz' ? 'Қатысу' : 'Посещаемость'}</span>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleSendMessage(selectedStudent.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageSquare size={16} className="mr-2" />
                  {language === 'kz' ? 'Хабарлама жазу' : 'Написать сообщение'}
                </Button>
                <Button 
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {language === 'kz' ? 'Жабу' : 'Закрыть'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
