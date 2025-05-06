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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
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

      // Удаляем недействительный токен
      localStorage.removeItem('token');

      // Можно добавить логику обновления токена через refresh token
      // Пример для refresh token механизма (раскомментируйте при необходимости)
      /*
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
          originalRequest._retry = true;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // При ошибке обновления токена выходим из системы
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
      */
    }

    return Promise.reject(error);
  }
);

export default apiClient;