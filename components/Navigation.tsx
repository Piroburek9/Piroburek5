import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { User, LogOut } from 'lucide-react';
type UserRole = 'student' | 'teacher' | 'tutor';

export type Language = 'ru' | 'kz';

interface NavigationProps {
  language: Language;
  userRole: UserRole;
  userName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  language,
  userRole,
  userName,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'student':
        return language === 'ru' ? 'Ученик' : 'Оқушы';
      case 'teacher':
        return language === 'ru' ? 'Учитель' : 'Мұғалім';
      case 'tutor':
        return language === 'ru' ? 'Репетитор' : 'Жеке мұғалім';
      default:
        return role;
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: language === 'ru' ? 'Главная' : 'Басты бет',
      roles: ['student', 'teacher', 'tutor']
    },
    {
      id: 'tests',
      label: language === 'ru' ? 'Тесты' : 'Тесттер',
      roles: ['student', 'teacher', 'tutor']
    },
    {
      id: 'progress',
      label: language === 'ru' ? 'Прогресс' : 'Дамуы',
      roles: ['student', 'teacher', 'tutor']
    },
    {
      id: 'admin',
      label: language === 'ru' ? 'Администрирование' : 'Әкімшілік',
      roles: ['teacher', 'tutor']
    }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{userName}</span>
            </div>
            <Badge variant="outline">
              {getRoleText(userRole)}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'ru' ? 'Выйти' : 'Шығу'}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter(item => item.roles.includes(userRole))
            .map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};