// src/components/ui/UnifiedLoginModal.tsx - обновленная версия
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { GoogleLogin } from '@react-oauth/google';
import * as jwtDecode from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [formMode, setFormMode] = useState<'google' | 'email'>('google');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode.jwtDecode(credentialResponse.credential);

      // Отправляем токен на бэкенд - создаем клиента по умолчанию
      const response = await authAPI.googleAuth(credentialResponse.credential, 'client');

      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        window.location.reload();
      }

      notification.success('Вход выполнен', 'Добро пожаловать!');
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      notification.error('Ошибка', 'Не удалось войти через Google');
    }
  };

  const handleChangeFormMode = () => {
    setFormMode(formMode === 'google' ? 'email' : 'google');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Отправляем запрос на API для входа
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      notification.success('Вход выполнен', 'Добро пожаловать!');
      onClose();
      // Перезагружаем страницу
      window.location.reload();
    } catch (error) {
      console.error('Email login error:', error);
      notification.error('Ошибка входа', 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Вход в TARAK
          </h2>

          {formMode === 'google' ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                Войдите через Google для доступа ко всем функциям платформы
              </p>

              <div className="mb-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => notification.error('Ошибка', 'Не удалось войти через Google')}
                  useOneTap={false}
                  theme="outline"
                  shape="rectangular"
                  text="signin_with"
                  locale="ru"
                  width="full"
                />
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={handleChangeFormMode}
                  className="text-sm text-[#9A0F34] hover:underline"
                >
                  Войти по email и паролю
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                После входа вы сможете выбрать тип аккаунта в личном кабинете
              </p>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleChangeFormMode}
                  className="text-sm text-[#9A0F34] hover:underline"
                >
                  Войти через Google
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginModal;