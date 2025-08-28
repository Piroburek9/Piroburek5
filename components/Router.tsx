import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Header } from './layout/Header';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Tests } from './pages/Tests';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Diary } from './pages/Diary';

export type Page = 'home' | 'tests' | 'profile' | 'admin' | 'auth' | 'diary';

interface RouterProps {
  onToggleChatbot?: () => void;
}

export const Router: React.FC<RouterProps> = ({ onToggleChatbot }) => {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    if (!user && currentPage !== 'auth' && currentPage !== 'home') {
      setCurrentPage('auth');
    }
  }, [user, currentPage]);

  // Listen for global navigation events (e.g., after login/register)
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ page: Page }>;
      if (custom.detail?.page) {
        setCurrentPage(custom.detail.page);
      }
    };
    window.addEventListener('app:navigate', handler as EventListener);
    return () => window.removeEventListener('app:navigate', handler as EventListener);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'tests':
        return <Tests />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return user?.role === 'teacher' || user?.role === 'tutor' ? 
          <Admin /> : 
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl mb-4">{t('common.error')}</h1>
            <p>{t('auth.insufficientPermissions')}</p>
          </div>;
      case 'diary':
        return <Diary />;
      case 'auth':
        return <Auth />;
      default:
        return <Home onNavigate={(page) => setCurrentPage(page as Page)} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onToggleChatbot={onToggleChatbot}
      />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
};