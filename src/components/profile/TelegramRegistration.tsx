import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { notificationsAPI } from '../../api/services';

const TelegramRegistration: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Проверяем, зарегистрирован ли пользователь в телеграм-боте
  useEffect(() => {
    checkTelegramStatus();
  }, []);

  const checkTelegramStatus = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.checkTelegramStatus();
      setIsRegistered(response.data.registered);
      if (response.data.registered && response.data.username) {
        setUsername(response.data.username);
      }
    } catch (error) {
      console.error('Ошибка при проверке статуса Telegram:', error);
      setError('Не удалось проверить статус Telegram');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Отправляем запрос на регистрацию
      await notificationsAPI.registerTelegramAccount({ username });

      // Проверяем статус после регистрации
      await checkTelegramStatus();

      setSuccess('Telegram успешно подключен! Теперь вы будете получать уведомления о бронированиях.');
    } catch (error: any) {
      console.error('Ошибка при регистрации Telegram:', error);
      setError(error.response?.data?.detail || 'Не удалось подключить Telegram. Пожалуйста, проверьте имя пользователя и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4 p-4 border rounded-md">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="border-b pb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <MessageCircle className="h-4 w-4 mr-1" />
          Telegram для уведомлений
        </label>
        <div className="flex items-center">
          <p className="text-gray-900 mr-2">
            <a
              href={`https://t.me/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              @{username}
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Подключено
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Вы будете получать уведомления о новых бронированиях в Telegram
        </p>
      </div>
    );
  }

  return (
    <div className="border-b pb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
        Подключение Telegram для уведомлений
      </label>

      {error && (
        <div className="bg-red-50 p-2 rounded-md mb-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-2 rounded-md mb-3">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Чтобы получать уведомления о новых бронированиях, подключите вашего Telegram-бота:
        </p>

        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
          <li>Откройте Telegram и найдите бота <a href="https://t.me/barberhub_notification_bot" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">@barberhub_notification_bot</a></li>
          <li>Нажмите кнопку "Start" или отправьте команду /start</li>
          <li>Введите ваше имя пользователя Telegram без @ в поле ниже</li>
        </ol>

        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <MessageCircle className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="Ваш username в Telegram"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
            />
          </div>
          <Button
            onClick={handleRegister}
            disabled={loading || !username}
            variant="primary"
          >
            Подключить
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Мы отправим вам тестовое сообщение для подтверждения подключения
        </p>
      </div>
    </div>
  );
};

export default TelegramRegistration;