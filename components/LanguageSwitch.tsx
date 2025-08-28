import React from 'react';
import { Button } from './ui/button';

export type Language = 'ru' | 'kz';

interface LanguageSwitchProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentLanguage === 'ru' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('ru')}
        className="min-w-[60px]"
      >
        RU
      </Button>
      <Button
        variant={currentLanguage === 'kz' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('kz')}
        className="min-w-[60px]"
      >
        KZ
      </Button>
    </div>
  );
};