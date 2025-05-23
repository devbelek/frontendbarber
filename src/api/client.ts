import axios from 'axios';

// Устанавливаем базовый URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Создаем экземпляр axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Увеличен таймаут до 30 секунд
});

// Интерцептор запросов
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const googleUser = localStorage.getItem('googleUser');

    // Не устанавливаем Content-Type для запросов с FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (token) {
      // Проверяем тип токена
      if (token.startsWith('google-auth-')) {
        // Google аутентификация
        config.headers['X-Google-Auth'] = 'true';

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

// Интерцептор ответов
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Обработка ошибки 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Пытаемся обновить токен
          const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken
          });

          // Сохраняем новый токен
          if (response.data.access) {
            localStorage.setItem('token', response.data.access);

            // Обновляем заголовок для повторного запроса
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

            // Повторяем исходный запрос
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Очищаем токены и перенаправляем на страницу входа
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('googleUser');
        window.location.href = '/login';
      }
    }

    // Обработка других ошибок
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;