import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { DEFAULT_ENT_TEMPLATE, loadEntTemplate, saveEntTemplate, EntTemplate } from '../../utils/entTemplates';
import { toCSV, fromCSV } from '../../utils/csv';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  BookOpen,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  createdBy: string;
}

interface AdminStats {
  totalQuestions: number;
  totalUsers: number;
  totalTests: number;
  averageScore: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'stats' | 'users'>('questions');
  const [template, setTemplate] = useState<EntTemplate>(loadEntTemplate());

  const [newQuestion, setNewQuestion] = useState<{ question: string; options: string[]; correctAnswer: number; subject: string; difficulty: Difficulty }>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    difficulty: 'medium'
  });

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the server
      const mockQuestions: Question[] = [
        {
          id: '1',
          question: 'Что такое столица Казахстана?',
          options: ['Алматы', 'Нур-Султан', 'Шымкент', 'Караганда'],
          correctAnswer: 1,
          subject: 'География',
          difficulty: 'easy',
          createdAt: '2024-01-15',
          createdBy: user?.id || ''
        },
        {
          id: '2',
          question: 'Сколько будет 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          subject: 'Математика',
          difficulty: 'easy',
          createdAt: '2024-01-14',
          createdBy: user?.id || ''
        },
        {
          id: '3',
          question: 'Кто написал "Война и мир"?',
          options: ['Пушкин', 'Толстой', 'Достоевский', 'Чехов'],
          correctAnswer: 1,
          subject: 'Литература',
          difficulty: 'medium',
          createdAt: '2024-01-13',
          createdBy: user?.id || ''
        }
      ];
      
      setQuestions(mockQuestions);
    } catch (error) {
      toast.error('Ошибка при загрузке вопросов');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const mockStats: AdminStats = {
        totalQuestions: 25,
        totalUsers: 150,
        totalTests: 340,
        averageScore: 78
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleTemplateChange = (updater: (t: EntTemplate) => EntTemplate) => {
    const updated = updater(template);
    setTemplate(updated);
  };

  const saveTemplate = () => {
    try {
      saveEntTemplate(template);
      toast.success('Шаблон ЕНТ сохранён');
    } catch (e) {
      toast.error('Не удалось сохранить шаблон');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question || !newQuestion.subject || newQuestion.options.some(opt => !opt)) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        subject: newQuestion.subject,
        difficulty: newQuestion.difficulty,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: user?.id || ''
      };

      setQuestions(prev => [...prev, question]);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        subject: '',
        difficulty: 'medium'
      });
      setIsAddingQuestion(false);
      toast.success('Вопрос добавлен успешно');
    } catch (error) {
      toast.error('Ошибка при добавлении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      difficulty: question.difficulty
    });
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const updatedQuestion: Question = {
        ...editingQuestion,
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        subject: newQuestion.subject,
        difficulty: newQuestion.difficulty
      };

      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id ? updatedQuestion : q
      ));
      
      setEditingQuestion(null);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        subject: '',
        difficulty: 'medium'
      });
      
      toast.success('Вопрос обновлен успешно');
    } catch (error) {
      toast.error('Ошибка при обновлении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;

    setLoading(true);
    try {
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Вопрос удален');
    } catch (error) {
      toast.error('Ошибка при удалении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      subject: '',
      difficulty: 'medium'
    });
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-gray-600">
            Добро пожаловать, {user?.name}! Управляйте контентом платформы.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="flex flex-wrap gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего вопросов
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Пользователей
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Тестов пройдено
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Средний балл
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ENT Template Editor */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Шаблон ЕНТ</h2>
          <Card>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(template.tracks) as any).map(([trackKey, track]: any) => (
                <div key={trackKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Направление: {trackKey === 'math' ? 'Математика' : 'Физика'}</h3>
                    <Badge variant="secondary">Время: {track.totalTimeMinutes} мин</Badge>
                  </div>
                  <div className="mt-3 space-y-3">
                    {track.sections.map((section: any, idx: number) => (
                      <div key={section.id} className="grid md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-2">
                          <Label>Название секции</Label>
                          <Input value={section.title} onChange={(e)=>handleTemplateChange(prev=>{
                            const next = {...prev};
                            (next as any).tracks[trackKey].sections[idx].title = e.target.value;
                            return next;
                          })} />
                        </div>
                        <div>
                          <Label>Вопросов</Label>
                          <Input type="number" value={section.numQuestions} onChange={(e)=>handleTemplateChange(prev=>{
                            const next = {...prev};
                            (next as any).tracks[trackKey].sections[idx].numQuestions = Number(e.target.value);
                            return next;
                          })} />
                        </div>
                        <div>
                          <Label>Минут</Label>
                          <Input type="number" value={section.timeLimitMinutes} onChange={(e)=>handleTemplateChange(prev=>{
                            const next = {...prev};
                            (next as any).tracks[trackKey].sections[idx].timeLimitMinutes = Number(e.target.value);
                            return next;
                          })} />
                        </div>
                        <div>
                          <Label>Обязательная</Label>
                          <Button type="button" variant={section.mandatory? 'default':'outline'} onClick={()=>handleTemplateChange(prev=>{
                            const next = {...prev};
                            (next as any).tracks[trackKey].sections[idx].mandatory = !(next as any).tracks[trackKey].sections[idx].mandatory;
                            return next;
                          })}>{section.mandatory? 'Да':'Нет'}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={saveTemplate}>Сохранить шаблон</Button>
                <Button variant="outline" onClick={()=>{setTemplate(DEFAULT_ENT_TEMPLATE); toast.success('Шаблон сброшен по умолчанию');}}>Сбросить</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Management */}
        <div className="space-y-6">
          {/* Add Question Button and Bulk Import/Export */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.questions')}
            </h2>
            <Button
              onClick={() => setIsAddingQuestion(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t('admin.addQuestion')}</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={()=>{
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
              const dl = document.createElement('a');
              dl.setAttribute('href', dataStr);
              dl.setAttribute('download', `questions-export-${Date.now()}.json`);
              dl.click();
            }}>Экспорт JSON</Button>
            <Button variant="outline" onClick={()=>{
              const flat = questions.map((q)=>({ id: q.id, question: q.question, subject: (q as any).subject, difficulty: (q as any).difficulty, options: (q as any).options?.join('|') ?? '', correct_answer: String((q as any).correctAnswer ?? (q as any).correct_answer ?? 0) }));
              const csv = toCSV(flat, ['id','question','subject','difficulty','options','correct_answer']);
              const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
              const dl = document.createElement('a');
              dl.setAttribute('href', dataStr);
              dl.setAttribute('download', `questions-export-${Date.now()}.csv`);
              dl.click();
            }}>Экспорт CSV</Button>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Input type="file" accept="application/json,.json" onChange={(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const imported = JSON.parse(String(reader.result));
                    if (Array.isArray(imported)) {
                      setQuestions(imported as any);
                      toast.success('Импортировано вопросов: ' + imported.length);
                    } else {
                      toast.error('Неверный формат файла');
                    }
                  } catch (err) {
                    toast.error('Ошибка импорта');
                  }
                };
                reader.readAsText(file);
              }} />
              <span className="text-sm text-gray-600">Импорт JSON</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Input type="file" accept="text/csv,.csv" onChange={(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const rows = fromCSV(String(reader.result));
                    const imported = rows.map(r => ({
                      id: r.id || Date.now().toString(),
                      question: r.question,
                      options: (r.options||'').split('|').filter(Boolean),
                      correctAnswer: isNaN(Number(r.correct_answer)) ? 0 : Number(r.correct_answer),
                      subject: r.subject,
                      difficulty: (r.difficulty === 'easy' || r.difficulty === 'hard') ? r.difficulty : 'medium'
                    }));
                    // @ts-ignore
                    setQuestions(imported);
                    toast.success('Импортировано из CSV: ' + imported.length);
                  } catch {
                    toast.error('Ошибка импорта CSV');
                  }
                };
                reader.readAsText(file);
              }} />
              <span className="text-sm text-gray-600">Импорт CSV</span>
            </label>
          </div>

          {/* Add/Edit Question Form */}
          {(isAddingQuestion || editingQuestion) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingQuestion ? 'Редактировать вопрос' : t('admin.addQuestion')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">{t('admin.questionText')}</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Введите текст вопроса..."
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Предмет</Label>
                    <Select
                      value={newQuestion.subject}
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Математика">Математика</SelectItem>
                        <SelectItem value="Литература">Литература</SelectItem>
                        <SelectItem value="География">География</SelectItem>
                        <SelectItem value="История">История</SelectItem>
                        <SelectItem value="Физика">Физика</SelectItem>
                        <SelectItem value="Химия">Химия</SelectItem>
                        <SelectItem value="Биология">Биология</SelectItem>
                        <SelectItem value="Информатика">Информатика</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Сложность</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: (value as Difficulty) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="hard">Сложный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t('admin.answers')}</Label>
                  <div className="space-y-2 mt-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`Вариант ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant={newQuestion.correctAnswer === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                        >
                          {newQuestion.correctAnswer === index ? 'Правильный' : 'Выбрать'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewQuestion(prev => ({ ...prev, options: prev.options.filter((_,i)=>i!==index) }))}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={()=>setNewQuestion(prev=>({...prev, options: [...prev.options, '']}))}>Добавить вариант</Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? t('common.loading') : t('admin.save')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      // Quick preview mode
                      const q = newQuestion;
                      toast.info('Предпросмотр вопроса: ' + (q.question || '')); 
                    }}
                  >
                    Предпросмотр
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{question.question}</h3>
                      <div className="flex space-x-2 mb-3">
                        <Badge variant="secondary">{question.subject}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty === 'easy' ? 'Легкий' : 
                           question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          question.correctAnswer === index
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                        {question.correctAnswer === index && (
                          <span className="ml-2 text-xs">(Правильный ответ)</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    Создано: {question.createdAt}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};