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
    const googleUser = localStorage.getItem('googleUser');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else if (googleUser) {
      // Создаем новый временный токен для пользователя Google
      const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('token', newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      console.log('Adding temporary Google token to request:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок авторизации
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получена ошибка 401 и это не повторная попытка
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.warn('Authentication token expired or invalid');
      originalRequest._retry = true;

      // Проверяем наличие Google-пользователя
      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        // Создаем новый временный токен для Google-пользователя
        const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('token', newToken);

        // Повторяем запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      }

      // Для обычных пользователей пытаемся обновить токен
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken
          });
          const newToken = response.data.access;
          localStorage.setItem('token', newToken);

          // Повторяем исходный запрос
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // При ошибке обновления токена выходим из системы
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Проверяем, не находимся ли мы на странице логина, чтобы избежать цикличного редиректа
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        // Если нет refresh token, проверяем наличие Google-пользователя еще раз
        // (это на случай, если гугл-пользователь был добавлен после первой проверки)
        const googleUserCheck = localStorage.getItem('googleUser');
        if (!googleUserCheck) {
          localStorage.removeItem('token');
          // Проверяем, не находимся ли мы на странице логина, чтобы избежать цикличного редиректа
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;