import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { GoogleLogin } from '@react-oauth/google';
import * as jwtDecode from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const notification = useNotification();

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

          <p className="text-gray-600 text-center mb-6">
            Войдите через Google для доступа ко всем функциям платформы
          </p>

          <div className="mb-6">
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

          <p className="text-xs text-gray-500 text-center">
            После входа вы сможете выбрать тип аккаунта в личном кабинете
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginModal;