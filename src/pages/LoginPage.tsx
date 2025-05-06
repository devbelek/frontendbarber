// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      // Простая проверка формы
      if (!email.trim()) {
        setLocalError('Пожалуйста, введите email');
        setIsSubmitting(false);
        return;
      }

      if (!password.trim()) {
        setLocalError('Пожалуйста, введите пароль');
        setIsSubmitting(false);
        return;
      }

      // Вызываем функцию входа из контекста авторизации
      const success = await login({ email, password });

      if (success) {
        // Перенаправляем на страницу профиля при успешном входе
        navigate('/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('Произошла ошибка при входе. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout openLoginModal={() => {}}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="flex items-center justify-center mb-6">
              <Scissors className="h-8 w-8 text-[#9A0F34] mr-2" />
              <h1 className="text-2xl font-bold">Вход в систему</h1>
            </div>

            {(localError || authError) && (
              <div className="bg-red-50 p-4 rounded-md mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{localError || authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] focus:border-[#9A0F34]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34] focus:border-[#9A0F34]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                    Запомнить меня
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#9A0F34] hover:text-[#7b0c29]">
                    Забыли пароль?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Нет аккаунта?{' '}
                  <Link to="/register" className="font-medium text-[#9A0F34] hover:text-[#7b0c29]">
                    Зарегистрироваться
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;