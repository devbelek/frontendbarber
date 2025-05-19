import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { GoogleLogin } from '@react-oauth/google';
import * as jwtDecode from 'jwt-decode';

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientLoginModal: React.FC<ClientLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const notification = useNotification();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку для этого поля
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }

      if (!formData.firstName) {
        newErrors.firstName = 'Имя обязательно';
      }

      if (!formData.phone) {
        newErrors.phone = 'Телефон обязателен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        // Регистрация
        const response = await authAPI.registerClient({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        });

        if (response.data.access) {
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          // Обновляем контекст авторизации
          window.location.reload();
        }

        notification.success('Регистрация успешна', 'Добро пожаловать в TARAK!');
        onClose();
      } else {
        // Авторизация
        const response = await authAPI.loginClient({
          email: formData.email,
          password: formData.password
        });

        if (response.data.access) {
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          window.location.reload();
        }

        notification.success('Вход выполнен', 'Добро пожаловать обратно!');
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.error || 'Произошла ошибка. Попробуйте позже.';
      notification.error('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode.jwtDecode(credentialResponse.credential);

      // Отправляем токен на бэкенд
      const response = await authAPI.googleAuth(credentialResponse.credential, 'client');
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        window.location.reload();
      }

      notification.success('Вход выполнен', 'Вы успешно вошли через Google!');
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      notification.error('Ошибка', 'Не удалось войти через Google');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Регистрация' : 'Вход для клиентов'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                        placeholder="Иван"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                      placeholder="Иванов"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                    placeholder="+996 XXX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Или</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => notification.error('Ошибка', 'Не удалось войти через Google')}
                useOneTap={false}
                theme="outline"
                shape="rectangular"
                text={isSignUp ? "signup_with" : "signin_with"}
                locale="ru"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#9A0F34] hover:underline font-medium"
              >
                {isSignUp ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginModal;