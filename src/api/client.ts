// src/api/client.ts
import axios from 'axios';

// Исправляем базовый URL, чтобы он правильно ссылался на API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL, // Теперь включает /api в базовом URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обновляем интерцептор для правильной работы с Google-аутентификацией
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const googleUser = localStorage.getItem('googleUser');

    // Не устанавливаем Content-Type для запросов с FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Позволяем axios установить правильный Content-Type с boundary
    }

    if (token) {
      // Если токен начинается с google-auth, значит это Google аутентификация
      if (token.startsWith('google-auth-')) {
        // Добавляем специальные заголовки для Google-аутентификации
        config.headers['X-Google-Auth'] = 'true';

        // Если есть данные пользователя Google, добавляем их в заголовок
        if (googleUser) {
          try {
            const user = JSON.parse(googleUser);
            config.headers['X-Google-Email'] = user.email;
          } catch (e) {
            console.error('Ошибка при парсинге данных Google пользователя:', e);
          }
        }
      } else {
        // Стандартная JWT аутентификация
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Добавляем интерцептор ответа для обработки ошибок аутентификации и ограничения запросов
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Добавляем обработку ошибки 429 (Too Many Requests)
    if (error.response?.status === 429) {
      // Извлекаем информацию о времени ожидания, если она есть
      const retryAfterSeconds = error.response.headers['retry-after'] || 60;
      console.error(`Слишком много запросов. Пожалуйста, подождите ${retryAfterSeconds} секунд перед повторной попыткой.`);

      // Здесь можно добавить показ пользовательского сообщения или уведомления
      return Promise.reject(error);
    }

    // Если получаем 401 и у нас есть refreshToken и еще не было попытки обновления
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Пытаемся обновить токен
          const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken
          });

          // Сохраняем новый токен и повторяем запрос
          if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Если не удалось обновить токен, выходим из системы
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('googleUser');
        window.location.href = '/login'; // Перенаправляем на страницу входа
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;