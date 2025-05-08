// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обновим интерцептор для обнаружения Google-аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const googleUser = localStorage.getItem('googleUser');

    if (token) {
      if (token.startsWith('google-auth-')) {
        // Это Google аутентификация
        console.log('Используется Google аутентификация');

        // Добавим специальный заголовок для Google-аутентификации
        config.headers['X-Google-Auth'] = 'true';

        // Если есть данные пользователя Google, добавим их в заголовок
        if (googleUser) {
          const user = JSON.parse(googleUser);
          config.headers['X-Google-Email'] = user.email;
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
      console.log('Токен добавлен к запросу');
    } else {
      console.log('Запрос без авторизации');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;