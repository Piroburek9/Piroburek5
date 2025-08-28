import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { dataService } from '../../utils/dataService';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, CalendarDays, Target, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface ResultItem {
  id: string;
  test_id: string;
  score: number; // percentage 0..100
  time_spent: number; // seconds
  completed_at: string;
  answers: Array<{ questionId: string; selectedAnswer: number; correct: boolean }>;
}

export const Diary: React.FC = () => {
  const { t } = useLanguage();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dataService.getResults();
        // newest first
        const sorted = res.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        setResults(sorted as any);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => set.add(r.test_id.replace('test-', '')));
    return ['all', ...Array.from(set)];
  }, [results]);

  const filtered = useMemo(() => {
    if (subjectFilter === 'all') return results;
    return results.filter(r => r.test_id.replace('test-', '') === subjectFilter);
  }, [results, subjectFilter]);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}м ${sec}с`;
    };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Дневник тестов</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm bg-white"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'Все предметы' : s}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-600">
              Нет сохраненных результатов. Пройдите тест, чтобы он появился в дневнике.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => {
              const subject = r.test_id.replace('test-', '') || 'general';
              const correct = r.answers?.filter((a: any) => a.correct).length || Math.round((r.score / 100) * (r.answers?.length || 0));
              const total = r.answers?.length || 0;
              const isOpen = !!expanded[r.id];
              return (
                <Card key={r.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <CardTitle className="text-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{subject}</Badge>
                        <span className="font-semibold">{Math.round(r.score)}%</span>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{new Date(r.completed_at).toLocaleString('ru-RU')}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{fmtTime(r.time_spent)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1"><Target className="w-4 h-4" />{correct}/{total} верно</div>
                      <Separator className="mx-1" />
                      <Button variant="outline" size="sm" onClick={() => toggleExpand(r.id)} className="flex items-center gap-1">
                        {isOpen ? <><ChevronUp className="w-4 h-4" /> Скрыть детали</> : <><ChevronDown className="w-4 h-4" /> Показать детали</>}
                      </Button>
                    </div>
                    {isOpen && (
                      <div className="mt-4 space-y-2">
                        {(r.answers || []).map((a, idx) => (
                          <div key={idx} className={`p-2 rounded text-sm ${a.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            Вопрос {idx + 1}: {a.correct ? 'верно' : 'ошибка'}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


