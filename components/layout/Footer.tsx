import React from 'react';
import { BookOpen, Github, Mail, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">EduPlatform</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Современная платформа для подготовки к ЕНТ: тесты, аналитика и ИИ‑помощник.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Продукт</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Возможности</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Цены</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Безопасность</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Ресурсы</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Документация</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Поддержка</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Блог</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@eduplatform.app</li>
              <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> eduplatform.app</li>
            </ul>
            <div className="mt-4 flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <a aria-label="GitHub" className="hover:text-gray-900 dark:hover:text-white" href="#"><Github className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} EduPlatform. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="#">Политика</a>
            <a className="hover:text-white" href="#">Условия</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

