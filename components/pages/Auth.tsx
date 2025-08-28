import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Mail, Lock, User, UserCheck } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'student' | 'teacher' | 'tutor'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        toast.success('Успешный вход в систему');
        // Navigate to next page after login
        window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: 'home' } }));
      } else {
        if (!formData.name) {
          toast.error('Пожалуйста, введите имя');
          return;
        }
        await register(formData.email, formData.password, formData.name, formData.role);
        toast.success('Регистрация успешна');
        // Navigate to next page after registration
        window.dispatchEvent(new CustomEvent('app:navigate', { detail: { page: 'home' } }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'student'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLoginMode ? t('auth.login') : t('auth.register')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Name (only for registration) */}
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.name')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Role (only for registration) */}
            {!isLoginMode && (
              <div className="space-y-2">
                <Label>{t('auth.role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{t('auth.student')}</SelectItem>
                    <SelectItem value="teacher">{t('auth.teacher')}</SelectItem>
                    <SelectItem value="tutor">{t('auth.tutor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('auth.submit')}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLoginMode ? t('auth.switchToRegister') : t('auth.switchToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};