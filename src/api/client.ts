// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Добавляем токен только если он существует
    if (token) {
      // Проверяем, не является ли токен временным Google-токеном
      if (token.startsWith('google-auth-')) {
        // Для Google-аутентификации не отправляем токен на бэкенд
        console.log('Используется Google-аутентификация, токен не отправляется');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Добавлен токен авторизации:', token.substring(0, 10) + '...');
      }
    } else {
      console.log('Токен отсутствует, запрос отправляется без авторизации');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок авторизации
// Интерцептор для добавления токена к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Добавляем токен только если он существует
    if (token) {
      // Даже если это Google-токен, отправляем его
      // Изменение стратегии - отправляем все токены
      config.headers.Authorization = `Bearer ${token}`;

      // Если это Google-токен, добавляем специальный заголовок
      if (token.startsWith('google-auth-')) {
        config.headers['X-Google-Auth'] = 'true';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;