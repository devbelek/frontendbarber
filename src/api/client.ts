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

    if (token) {
      // Если токен начинается с google-auth, значит это Google аутентификация
      if (token.startsWith('google-auth-')) {
        // Добавляем специальные заголовки для Google-аутентификации
        config.headers['X-Google-Auth'] = 'true';

        // Если есть данные пользователя Google, добавляем их в заголовок
        if (googleUser) {
          const user = JSON.parse(googleUser);
          config.headers['X-Google-Email'] = user.email;
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

export default apiClient;