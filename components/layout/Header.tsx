import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { LogOut, User, BookOpen, Home, Settings, Globe, Bot, Sparkles } from 'lucide-react';
import { Page } from '../Router';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onToggleChatbot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onToggleChatbot }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kz' : 'ru');
  };

  return (
    <header className="sticky top-0 z-50 nav-futuristic border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setCurrentPage('home')}
          >
            <div className="relative">
              <BookOpen className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-futuristic">EduPlatform</span>
              <span className="text-xs text-gray-400 font-mono">Next-Gen Learning</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <div className="futuristic-card px-4 py-2 cursor-pointer group">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                  Главная
                </span>
              </div>
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* AI Assistant Button */}
            {onToggleChatbot && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleChatbot}
                aria-label="Открыть ИИ-помощник"
                className="futuristic-card px-4 py-2 hover:bg-blue-500/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bot className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors hidden sm:inline">
                    ИИ-помощник
                  </span>
                </div>
              </Button>
            )}

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label={`Switch language to ${language === 'ru' ? 'KZ' : 'RU'}`}
              role="switch"
              aria-checked={language !== 'ru'}
              className="futuristic-card px-3 py-2 hover:bg-purple-500/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                  {language === 'ru' ? 'RU' : 'KZ'}
                </span>
              </div>
            </Button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="futuristic-card px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white font-medium">
                      {user?.name}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="btn-futuristic group"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    <span>{t('nav.logout')}</span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setCurrentPage('auth')} 
                size="sm"
                className="btn-futuristic"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Войти</span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};