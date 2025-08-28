import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { dataService, Question } from '../../utils/dataService';

// Lazy import to avoid heavy worker on first load
let pdfLoaded = false as boolean;
async function extractPdfText(file: File): Promise<string> {
  // Use explicit ESM entry to satisfy Vite resolver
  // Use ESM entry that Vite resolves from node_modules
  // @ts-ignore
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/build/pdf.mjs');
  if (!pdfLoaded) {
    try {
      // Vite-friendly worker resolution
      // @ts-ignore
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    } catch {}
    pdfLoaded = true;
  }
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({
    data: arrayBuffer,
    // Respect strict CSP by avoiding eval/new Function in PDF.js
    isEvalSupported: false,
    // Disable JavaScript in PDFs to avoid sandbox that may require eval
    enableScripting: false,
  });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content: any = await page.getTextContent();
    const pageText = (content.items || [])
      .map((it: any) => (typeof it.str === 'string' ? it.str : ''))
      .join(' ');
    text += `\n${pageText}\n`;
  }
  return text;
}

function parseQuestionsFromPlainText(text: string): Question[] {
  // Normalize whitespace
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Split by question numbers like "1.", "2." at start or after space
  const parts = normalized.split(/(?:(?:^|\s)(\d{1,3})\.)\s/g);
  // parts will be like [prefix, qnum, qtext, qnum, qtext, ...]
  const questions: Question[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const qnum = parts[i];
    const block = parts[i + 1] || '';
    if (!qnum || !block) continue;
    // Extract options A) ... B) ... C) ... D) ...
    const optionMatches = block.split(/(?=\s?[A-DА-Г]\)\s)/g);
    const stem = optionMatches.shift()?.trim() || block.trim();
    const options: string[] = [];
    for (const seg of optionMatches) {
      const m = seg.match(/^[A-DА-Г]\)\s*(.*)$/);
      if (m) options.push(m[1].trim());
    }
    if (options.length >= 2) {
      const q: Question = {
        id: `import-hist-${qnum}`,
        question: stem,
        type: 'multiple_choice',
        options: options.slice(0, 6),
        correct_answer: 0,
        correctAnswer: 0,
        subject: 'history_kz',
        difficulty: 'medium',
      };
      questions.push(q);
    }
  }
  return questions;
}

export const ImportENTDialog: React.FC<{ onImported?: () => void }> = ({ onImported }) => {
  const [open, setOpen] = useState(false);
  const [subjectKey, setSubjectKey] = useState<'history_kz' | 'math_literacy' | 'math_profile' | 'physics_profile'>('history_kz');
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [answerKey, setAnswerKey] = useState('');
  const [parsing, setParsing] = useState(false);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [prepared, setPrepared] = useState<Question[]>([]);

  const handleParse = async () => {
    try {
      setParsing(true);
      let qs: Question[] = [];
      if (file) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const text = await extractPdfText(file);
          qs = parseQuestionsFromPlainText(text);
        } else if (file.name.toLowerCase().endsWith('.json')) {
          const raw = JSON.parse(await file.text());
          qs = Array.isArray(raw) ? raw : raw.questions || [];
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const raw = await file.text();
          const lines = raw.split(/\n+/);
          for (const line of lines) {
            const cols = line.split(/,|;\t?/).map(s => s.trim());
            if (cols.length >= 6) {
              const [stem, a, b, c, d, correct] = cols;
              const idx = ['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].indexOf(correct);
              const ca = idx === -1 ? 0 : idx % 4;
              qs.push({
                id: `import-${Math.random().toString(36).slice(2)}`,
                question: stem,
                type: 'multiple_choice',
                options: [a, b, c, d],
                correct_answer: ca,
                correctAnswer: ca,
              } as Question);
            }
          }
        }
      } else if (jsonText.trim()) {
        const raw = JSON.parse(jsonText);
        qs = Array.isArray(raw) ? raw : raw.questions || [];
      }
      // Apply subject and optional answer key override
      const answers = answerKey
        .split(/[,\s]+/)
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
        .map(s => ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(s));
      const ready = qs.map((q, i) => {
        const ca = Number.isInteger(answers[i]) && (answers[i] as number) >= 0 ? (answers[i] as number) : (typeof q.correct_answer === 'number' ? (q.correct_answer as number) : 0);
        return {
          ...q,
          subject: subjectKey,
          correct_answer: ca,
          correctAnswer: ca,
        } as Question;
      });
      setPrepared(ready);
      setPreviewCount(ready.length);
    } catch (e) {
      console.error(e);
      setPrepared([]);
      setPreviewCount(0);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!prepared.length) return;
    await dataService.importENTQuestions(subjectKey, prepared);
    setOpen(false);
    setPrepared([]);
    setPreviewCount(0);
    if (onImported) onImported();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Загрузить вопросы (PDF/JSON/CSV)</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Импорт вопросов ЕНТ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Предмет (ENT ключ)</label>
            <select
              className="border rounded px-2 py-2 text-sm"
              value={subjectKey}
              onChange={(e) => setSubjectKey(e.target.value as any)}
            >
              <option value="history_kz">История Казахстана</option>
              <option value="math_literacy">Математическая грамотность</option>
              <option value="math_profile">Профильная математика</option>
              <option value="physics_profile">Профильная физика</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Файл (PDF/JSON/CSV)</label>
            <Input type="file" accept=".pdf,.json,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Или вставьте JSON массив вопросов</label>
            <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={4} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Ключ ответов (опционально, через пробел/запятую, напр. A B C D ...)</label>
            <Input value={answerKey} onChange={(e) => setAnswerKey(e.target.value)} placeholder="A B C D ..." />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleParse} disabled={parsing}>Распознать</Button>
            <span className="text-sm text-gray-600">Найдено: {previewCount}</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button onClick={handleImport} disabled={!prepared.length}>Импортировать</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

